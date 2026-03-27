import React, { useEffect, useRef, Suspense } from "react";
import { useUiStore } from "./stores/ui-store";

// Lazy-load zen mode — only loads when user switches to zen mode
const ZenArea = React.lazy(() => import("./components/zen-mode/ZenArea"));
// Lazy-load canvas mode — the new default mode
const Canvas = React.lazy(() => import("./components/canvas/Canvas"));
import { useEditorStore } from "./stores/editor-store";
import { useTerminalStore } from "./stores/terminal-store";
import { useSettingsStore } from "./stores/settings-store";
import { useLayoutStore } from "./stores/layout-store";
import { useZenStore } from "./stores/zen-store";
import { useCanvasStore } from "./stores/canvas-store";
import { useAppearance } from "./hooks/useAppearance";
import { useShallow } from "zustand/react/shallow";

import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useCanvasNavigation } from "./hooks/useCanvasNavigation";
import { useWorkspacePersistence } from "./hooks/useWorkspacePersistence";
import { useProjectStore } from "./stores/project-store";
import { useWorkspaceStore } from "./stores/workspace-store";
import { getLiteEditorHostConfig, isLiteEditorHostManaged } from "./hostMode";
import { ConfirmDialog } from "./components/shared/ConfirmDialog";
import { ToastViewport } from "./components/shared/ToastViewport";
import { useToastStore } from "./stores/toast-store";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { openFileInCurrentMode, ensureEditorVisible } from "./lib/open-file";
import { logWarn, logError } from "./stores/error-store";
import { initPaneSync, syncOnModeSwitch, addPaneToCurrentMode } from "./lib/pane-sync";

async function loadWorkspaceForProject(projectRoot: string, opts?: { skipCanvas?: boolean }): Promise<void> {
  try {
    const data = (await window.api.workspace.loadState(projectRoot)) as {
      editor?: unknown;
      ui?: unknown;
      canvas?: unknown;
    } | null;
    if (!data) return;

    // Restore editor state (tabs, panes)
    if (data.editor && typeof data.editor === "object") {
      await useEditorStore
        .getState()
        .restoreWorkspaceState(data.editor as any, (path: string) => window.api.fs.readFile(path));
    }

    // Restore UI state (sidebar, terminal, app mode)
    if (data.ui && typeof data.ui === "object") {
      useUiStore.getState().restoreUIState(data.ui as any);
    }

    // Restore canvas state (pane layout, viewport)
    if (!opts?.skipCanvas && data.canvas && typeof data.canvas === "object") {
      useCanvasStore.getState().restoreCanvasState(data.canvas as any);
    }
  } catch (err) {
    logWarn("App", "Workspace file missing or corrupt — starting fresh", err);
  }
}

async function saveWorkspaceForProject(projectRoot: string): Promise<void> {
  try {
    const editorState = useEditorStore.getState().getWorkspaceState();
    const uiState = useUiStore.getState().getUIState();
    const canvasState = useCanvasStore.getState().getCanvasState();
    const workspace = { editor: editorState, ui: uiState, canvas: canvasState };
    await window.api.workspace.saveState(projectRoot, JSON.stringify(workspace, null, 2));
  } catch (err) {
    logWarn("App", "Failed to save workspace state", err);
  }
}

function applyStringEdits(base: string, editsValue: unknown): string {
  if (!Array.isArray(editsValue)) return base;
  let updated = base;

  for (const edit of editsValue) {
    if (!edit || typeof edit !== "object") continue;
    const oldString = typeof (edit as any).oldString === "string" ? (edit as any).oldString : "";
    const newString = typeof (edit as any).newString === "string" ? (edit as any).newString : "";
    const replaceAll = Boolean((edit as any).replaceAll);

    if (!oldString) {
      updated += newString;
      continue;
    }

    if (replaceAll) {
      updated = updated.split(oldString).join(newString);
    } else {
      updated = updated.replace(oldString, newString);
    }
  }

  return updated;
}

function getActiveSelectionText(): string {
  const monacoAny = (window as any).__monaco as any;
  const editors = monacoAny?.editor?.getEditors?.() as any[] | undefined;
  if (!editors || editors.length === 0) return "";

  const focused = editors.find((editor: any) => editor?.hasTextFocus?.()) || editors[0];
  const model = focused?.getModel?.();
  const selection = focused?.getSelection?.();
  if (!model || !selection) return "";

  try {
    return String(model.getValueInRange(selection) ?? "");
  } catch (err) {
    logWarn("App", "Failed to get active selection text", err);
    return "";
  }
}

async function ensureClaudePanelSession(): Promise<string | null> {
  const ui = useUiStore.getState();

  // If in canvas mode, add a Claude pane to the canvas
  if (ui.appMode === "canvas") {
    const store = useCanvasStore.getState();

    // Check if Claude pane already exists
    for (const pane of store.panes.values()) {
      if (pane.type === "claude" && pane.claudeSessionId) {
        store.setFocusedPane(pane.id);
        return pane.claudeSessionId;
      }
    }

    store.addPane("claude");

    // Wait for the Claude session to be initialized
    for (let i = 0; i < 80; i++) {
      for (const pane of useCanvasStore.getState().panes.values()) {
        if (pane.type === "claude" && pane.claudeSessionId) {
          useCanvasStore.getState().setFocusedPane(pane.id);
          return pane.claudeSessionId;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    return null;
  }

  // Fall back to zen mode behavior
  if (ui.appMode !== "zen") {
    ui.setAppMode("zen");
  }

  useZenStore.getState().addClaudePanel();

  for (let i = 0; i < 80; i++) {
    const zen = useZenStore.getState();
    const panel = zen.panels.find((item) => item.type === "claude" && item.claudeSessionId);
    if (panel?.claudeSessionId) {
      zen.setActivePanel(panel.id);
      return panel.claudeSessionId;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  return null;
}

function renameClaudePanel(title: string): boolean {
  const zen = useZenStore.getState();
  const activePanel = zen.activePanelId
    ? zen.panels.find((panel) => panel.id === zen.activePanelId && panel.type === "claude")
    : undefined;
  const fallbackPanel = zen.panels.find((panel) => panel.type === "claude");
  const target = activePanel ?? fallbackPanel;
  if (!target) return false;

  zen.renamePanel(target.id, title);
  return true;
}


export default function App() {
  const hostManaged = isLiteEditorHostManaged();
  useKeyboardShortcuts();
  useCanvasNavigation();
  useWorkspacePersistence();

  const appMode = useUiStore((s) => s.appMode);
  const prevProjectRootRef = useRef<string | null>(null);
  const prevAppModeRef = useRef(appMode);

  // Initial load: settings, layout, projects, then workspace
  useEffect(() => {
    async function init() {
      await useSettingsStore.getState().loadSettings();
      useLayoutStore.getState().loadLayout();
      const hostConfig = getLiteEditorHostConfig();

      if (hostConfig) {
        useProjectStore.setState({
          activeProjectId: hostConfig.projectId,
          loaded: true,
          projects: [
            {
              id: hostConfig.projectId,
              name: hostConfig.projectName,
              rootPath: hostConfig.projectRoot,
              lastActiveWorkspaceId: hostConfig.workspaceId,
              lastActivity: Date.now(),
              pinned: true,
              createdAt: Date.now(),
              gitBranch: null,
              agentStatus: "idle",
              agentStatusText: "",
              prStatus: null,
              listeningPorts: [],
              notificationCount: 0,
            },
          ],
        });
        useWorkspaceStore.setState({
          activeProjectId: hostConfig.projectId,
          activeWorkspaceId: hostConfig.workspaceId,
          workspaces: [
            {
              id: hostConfig.workspaceId,
              name: hostConfig.workspaceName,
              projectId: hostConfig.projectId,
              type: "local",
              canvas: null,
              lastActivity: Date.now(),
              createdAt: Date.now(),
            },
          ],
        });
        useUiStore.setState({
          activeSidebarPanel:
            useUiStore.getState().activeSidebarPanel === "projects"
              ? "files"
              : useUiStore.getState().activeSidebarPanel,
        });
        useEditorStore.getState().setProjectRoot(hostConfig.projectRoot);
        await loadWorkspaceForProject(hostConfig.projectRoot, { skipCanvas: true });
        await useSettingsStore.getState().loadWorkspaceSettings(hostConfig.projectRoot);
        prevProjectRootRef.current = hostConfig.projectRoot;
        return;
      }

      // Load project registry from disk (auto-selects last active project)
      await useProjectStore.getState().loadFromDisk();

      // Restore last workspace (global — projectRoot + zoomLevel)
      const data = (await window.api.workspace.load()) as Record<string, unknown> | null;
      if (data && typeof data.zoomLevel === "number") {
        window.api.window.setZoomLevel(data.zoomLevel);
      }

      // Determine project to restore: workspace.json projectRoot > project-store auto-selected
      let restoreRoot: string | null = null;
      if (data && data.projectRoot && typeof data.projectRoot === "string") {
        restoreRoot = data.projectRoot as string;
      }

      // If workspace.json had a projectRoot, ensure the project is registered
      if (restoreRoot) {
        const projects = useProjectStore.getState().projects;
        const existing = projects.find((p) => p.rootPath === restoreRoot);
        if (!existing) {
          await useProjectStore.getState().addProject(restoreRoot);
        } else if (useProjectStore.getState().activeProjectId !== existing.id) {
          await useProjectStore.getState().setActiveProject(existing.id);
        }
      }

      // Fall back to project-store's auto-selected project if no workspace root
      if (!restoreRoot) {
        const activeProject = useProjectStore.getState().getActiveProject();
        if (activeProject) {
          restoreRoot = activeProject.rootPath;
        }
      }

      // Restore project workspace (pane layout, editor state, settings)
      if (restoreRoot) {
        useEditorStore.getState().setProjectRoot(restoreRoot);
        await loadWorkspaceForProject(restoreRoot);
        await useSettingsStore.getState().loadWorkspaceSettings(restoreRoot);
        prevProjectRootRef.current = restoreRoot;
      } else if (useProjectStore.getState().projects.length === 0) {
        // First-ever launch — no projects exist
        useToastStore.getState().pushToast(
          "Open a folder to get started — or just add panes to the canvas",
          "info",
          5000,
        );
      }

      // If launched with a file from Explorer, open it after workspace restore
      // so it wins the race and becomes the active tab
      const params = new URLSearchParams(window.location.search);
      const launchFile = params.get("openFile");
      if (launchFile) {
        try {
          // Check if launch file is inside a known project
          const projects = useProjectStore.getState().projects;
          const normalPath = launchFile.replace(/\\/g, "/").toLowerCase();
          const matchingProject = projects.find((p) => {
            const normRoot = p.rootPath.replace(/\\/g, "/").toLowerCase();
            return normalPath.startsWith(normRoot + "/") || normalPath === normRoot;
          });

          if (matchingProject && useProjectStore.getState().activeProjectId !== matchingProject.id) {
            await useProjectStore.getState().setActiveProject(matchingProject.id);
            useEditorStore.getState().setProjectRoot(matchingProject.rootPath);
            await loadWorkspaceForProject(matchingProject.rootPath);
          } else if (!matchingProject) {
            // Not in any known project — open in zen mode
            useUiStore.getState().setAppMode("zen");
            if (!useEditorStore.getState().projectRoot) {
              const dir = launchFile.replace(/[\\/][^\\/]+$/, "");
              useEditorStore.getState().setProjectRoot(dir);
            }
          }

          await openFileInCurrentMode(launchFile);
        } catch (err) {
          logWarn("App", "Failed to open launch file", err);
        }
      }
    }
    init().catch(() => {});
  }, []);

  // Listen for files opened from OS (file associations / second instance)
  useEffect(() => {
    const unsub = window.api.onOpenFile(async (filePath: string) => {
      try {
        // Check if this file belongs to a known project
        const projects = useProjectStore.getState().projects;
        const normalPath = filePath.replace(/\\/g, "/").toLowerCase();
        const matchingProject = projects.find((p) => {
          const normRoot = p.rootPath.replace(/\\/g, "/").toLowerCase();
          return normalPath.startsWith(normRoot + "/") || normalPath === normRoot;
        });

        if (matchingProject) {
          // File is inside a known project — switch to it and open
          if (useProjectStore.getState().activeProjectId !== matchingProject.id) {
            await useProjectStore.getState().setActiveProject(matchingProject.id);
            useEditorStore.getState().setProjectRoot(matchingProject.rootPath);
            await loadWorkspaceForProject(matchingProject.rootPath);
          }
          await openFileInCurrentMode(filePath);
        } else {
          // File is NOT in any known project — open in zen mode
          useUiStore.getState().setAppMode("zen");
          await openFileInCurrentMode(filePath);

          // Offer to register parent folder as a project
          const parentDir = filePath.replace(/[\\/][^\\/]+$/, "");
          useToastStore.getState().pushToast(
            `Opened in zen mode — open "${parentDir.replace(/^.*[\\/]/, "")}" as a project from the sidebar`,
            "info",
            5000,
          );

          if (!useEditorStore.getState().projectRoot) {
            useEditorStore.getState().setProjectRoot(parentDir);
          }
        }
      } catch (err) {
        logWarn("App", "Failed to open file from OS", err);
      }
    });
    return unsub;
  }, []);

  // Listen for IPC health warnings from main process
  useEffect(() => {
    const unsub = window.api.onIpcHealthWarning((missingChannels: string[]) => {
      logError(
        "IPC",
        `Critical IPC handlers missing: ${missingChannels.join(", ")}. Some features may not work.`,
      );
    });
    return unsub;
  }, []);

  // Initialize bidirectional pane sync between canvas and zen stores
  useEffect(() => {
    const cleanup = initPaneSync();
    return cleanup;
  }, []);

  // Register window globals for main-process executeJavaScript calls
  // (AgentBridge + MCP server use these to create panes from the main process)
  useEffect(() => {
    (window as any).__createTerminalPane = (sessionId: string) => {
      addPaneToCurrentMode("terminal", { terminalSessionId: sessionId });
    };
    (window as any).__createBrowserPane = (sessionId: string) => {
      addPaneToCurrentMode("browser", { browserSessionId: sessionId });
    };
    (window as any).__openEditorFile = (filePath: string) => {
      openFileInCurrentMode(filePath).catch(() => {});
    };
    return () => {
      delete (window as any).__createTerminalPane;
      delete (window as any).__createBrowserPane;
      delete (window as any).__openEditorFile;
    };
  }, []);

  // Sync panes when switching between canvas and zen modes
  useEffect(() => {
    syncOnModeSwitch(appMode);
  }, [appMode]);

  // Extra hardening: when leaving Zen mode, force-hide and zero native views.
  useEffect(() => {
    const previousMode = prevAppModeRef.current;
    if (previousMode === "zen" && appMode !== "zen") {
      const ZERO_BOUNDS = { x: 0, y: 0, width: 0, height: 0 };
      const panels = useZenStore.getState().panels;
      for (const panel of panels) {
        if (panel.browserSessionId) {
          window.api.browser.hideView(panel.browserSessionId);
          window.api.browser.setBounds(panel.browserSessionId, ZERO_BOUNDS);
        }
        if (panel.claudeSessionId) {
          window.api.claude.hideView(panel.claudeSessionId);
          window.api.claude.setBounds(panel.claudeSessionId, ZERO_BOUNDS);
        }
        if (panel.codexSessionId) {
          window.api.codex.hideView(panel.codexSessionId);
          window.api.codex.setBounds(panel.codexSessionId, ZERO_BOUNDS);
        }
      }
    }

    prevAppModeRef.current = appMode;
  }, [appMode]);

  // Claude host-op bridge: main process requests renderer-side editor/terminal/git actions.
  useEffect(() => {
    const unsub = window.api.claude.onHostOp((request) => {
      const requestPayload =
        request.payload && typeof request.payload === "object"
          ? (request.payload as Record<string, unknown>)
          : {};

      const respond = (ok: boolean, payload?: Record<string, unknown>, error?: string) => {
        window.api.claude.sendHostOpResult({
          id: request.id,
          ok,
          ...(payload ? { payload } : {}),
          ...(error ? { error } : {}),
        });
      };

      const handle = async (): Promise<Record<string, unknown>> => {
        switch (request.op) {
          case "open_folder": {
            const path = typeof requestPayload.path === "string" ? requestPayload.path : null;
            if (!path) return { opened: false };
            useEditorStore.getState().setProjectRoot(path);
            useUiStore.getState().setAppMode("canvas");
            return { opened: true, path };
          }
          case "open_file": {
            const filePath =
              typeof requestPayload.filePath === "string" ? requestPayload.filePath : null;
            if (!filePath) return {};
            const content = await window.api.fs.readFile(filePath);
            useUiStore.getState().setAppMode("canvas");
            useEditorStore.getState().openFile(filePath, content);
            return {};
          }
          case "open_content": {
            const fileName =
              typeof requestPayload.fileName === "string"
                ? requestPayload.fileName
                : "Claude Content";
            const content =
              typeof requestPayload.content === "string" ? requestPayload.content : "";

            useUiStore.getState().setAppMode("canvas");
            useEditorStore.getState().newFile();
            useEditorStore.setState((state) => {
              const pane = state.panes[state.activePaneIndex];
              if (!pane || pane.activeTabIndex < 0) return state;
              const tabs = [...pane.tabs];
              const current = tabs[pane.activeTabIndex];
              tabs[pane.activeTabIndex] = { ...current, title: fileName, content, isDirty: false };
              const panes = [...state.panes] as typeof state.panes;
              panes[state.activePaneIndex] = { ...pane, tabs };
              return { panes };
            });

            return { updatedContent: content };
          }
          case "open_diff": {
            const originalFilePath =
              typeof requestPayload.originalFilePath === "string"
                ? requestPayload.originalFilePath
                : "";
            const newFilePath =
              typeof requestPayload.newFilePath === "string"
                ? requestPayload.newFilePath
                : originalFilePath;
            let original = "";
            try {
              if (originalFilePath) original = await window.api.fs.readFile(originalFilePath);
            } catch (err) {
              logWarn("App", "Failed to read original file for diff", err);
            }
            const modified = applyStringEdits(original, requestPayload.edits);

            useUiStore.getState().setAppMode("canvas");
            useEditorStore
              .getState()
              .openDiff(newFilePath || originalFilePath || "Claude Diff", original, modified);

            return { newEdits: requestPayload.edits ?? [] };
          }
          case "open_file_diffs": {
            const fileDiffs = Array.isArray(requestPayload.fileDiffs)
              ? requestPayload.fileDiffs
              : [];
            for (const fileDiff of fileDiffs) {
              if (!fileDiff || typeof fileDiff !== "object") continue;
              const originalFilePath =
                typeof (fileDiff as any).originalFilePath === "string"
                  ? (fileDiff as any).originalFilePath
                  : "";
              const newFilePath =
                typeof (fileDiff as any).newFilePath === "string"
                  ? (fileDiff as any).newFilePath
                  : originalFilePath;
              let original = "";
              try {
                if (originalFilePath) original = await window.api.fs.readFile(originalFilePath);
              } catch (err) {
                logWarn("App", "Failed to read file for diff", err);
              }
              const modified = applyStringEdits(original, (fileDiff as any).edits);
              useUiStore.getState().setAppMode("canvas");
              useEditorStore
                .getState()
                .openDiff(newFilePath || originalFilePath || "Claude Diff", original, modified);
            }
            return {};
          }
          case "get_current_selection":
            return { selection: getActiveSelectionText() };
          case "new_conversation_tab": {
            const sessionId = await ensureClaudePanelSession();
            return { success: !!sessionId, ...(sessionId ? { sessionId } : {}) };
          }
          case "rename_tab": {
            const title =
              typeof requestPayload.title === "string" ? requestPayload.title.trim() : "";
            if (!title) return { success: false };
            return { success: renameClaudePanel(title) };
          }
          case "fork_conversation": {
            const sessionId = await ensureClaudePanelSession();
            const fallback =
              typeof requestPayload.forkedFromSession === "string"
                ? requestPayload.forkedFromSession
                : "";
            return { sessionId: sessionId ?? fallback };
          }
          case "check_git_status": {
            try {
              const files = (await window.api.git.status()) as unknown[];
              const branch = (await window.api.git.currentBranch()) as { name?: string } | null;
              return {
                isClean: files.length === 0,
                hasChanges: files.length > 0,
                branch: branch?.name ?? null,
              };
            } catch (err) {
              logWarn("App", "Git status check failed", err);
              return { isClean: true, hasChanges: false, branch: null };
            }
          }
          case "checkout_branch": {
            const branch = typeof requestPayload.branch === "string" ? requestPayload.branch : "";
            if (!branch) return { status: "failed", branch: null };
            try {
              await window.api.git.checkout(branch);
              return { status: "checked_out", branch };
            } catch (err) {
              return {
                status: "failed",
                branch,
                error: err instanceof Error ? err.message : String(err),
              };
            }
          }
          case "open_output_panel": {
            const ui = useUiStore.getState();
            if (!ui.terminalPanelVisible) ui.toggleTerminalPanel();
            return { success: true };
          }
          case "open_config":
            if (!useUiStore.getState().settingsPanelVisible) {
              useUiStore.getState().toggleSettingsPanel();
            }
            return { success: true };
          case "attach_terminal_session": {
            const sessionId =
              typeof requestPayload.sessionId === "string" ? requestPayload.sessionId : null;
            if (!sessionId) return {};
            const shell =
              typeof requestPayload.shell === "string" ? requestPayload.shell : undefined;
            const cwd = typeof requestPayload.cwd === "string" ? requestPayload.cwd : undefined;
            const terminalStore = useTerminalStore.getState();
            const exists = terminalStore.sessions.some((session) => session.id === sessionId);
            if (!exists) {
              terminalStore.createSession(sessionId, shell, cwd);
            }
            const info = await window.api.pty.getSessionInfo(sessionId).catch(() => null);
            if (info) {
              terminalStore.updateSessionMeta(sessionId, {
                shell: info.shell,
                cwd: info.cwd,
                createdAt: info.createdAt,
              });
            }
            terminalStore.setActiveSession(sessionId);
            const ui = useUiStore.getState();
            if (!ui.terminalPanelVisible) ui.toggleTerminalPanel();
            return { success: true };
          }
          default:
            return {};
        }
      };

      handle()
        .then((payload) => respond(true, payload))
        .catch((err) => {
          const errorText = err instanceof Error ? err.message : String(err);
          respond(false, undefined, errorText);
        });
    });

    return unsub;
  }, []);

  // Appearance: sync accent, glass blur, particles, etc. to CSS variables
  const { activeTheme, accentColor, glassBlur, reduceMotion, particleColor, glowColor, particleSpeed } = useSettingsStore(
    useShallow((s) => ({
      activeTheme: s.activeTheme,
      accentColor: s.accentColor,
      glassBlur: s.glassBlur,
      reduceMotion: s.reduceMotion,
      particleColor: s.particleColor,
      glowColor: s.glowColor,
      particleSpeed: s.particleSpeed,
    }))
  );

  useAppearance({ accentColor, glassBlur, reduceMotion, particleColor, glowColor, particleSpeed });

  // Initialize git and search when project root changes, handle project switch
  const projectRoot = useEditorStore((s) => s.projectRoot);

  // Keep Codex host bridge aligned with the active LiteEditor project root.
  useEffect(() => {
    window.api.codex.setProjectRoot(projectRoot ?? null);
  }, [projectRoot]);

  // Auto-register project in the project store when projectRoot changes
  useEffect(() => {
    if (projectRoot && !hostManaged) {
      useProjectStore.getState().addProject(projectRoot);
    }
  }, [hostManaged, projectRoot]);

  useEffect(() => {
    if (!projectRoot) return;

    async function onProjectChange() {
      const oldRoot = prevProjectRootRef.current;

      // Save old project's workspace state before switching
      if (oldRoot && oldRoot !== projectRoot) {
        await saveWorkspaceForProject(oldRoot);

        // Clear workspace settings from old project
        useSettingsStore.getState().clearWorkspaceSettings();

        // Load new project's workspace state
        await loadWorkspaceForProject(projectRoot!);

        // Load new project's settings overlay
        await useSettingsStore.getState().loadWorkspaceSettings(projectRoot!);
      }

      prevProjectRootRef.current = projectRoot!;

      // Defer non-critical init so it doesn't compete with tree load
      setTimeout(() => {
        window.api.git.init(projectRoot!).catch(() => {});
        window.api.search.setRoot(projectRoot!).catch(() => {});
      }, 0);

      if (!hostManaged) {
        // Save projectRoot to global workspace (merge to preserve zoomLevel etc.)
        window.api.workspace
          .load()
          .then((data: unknown) => {
            const ws = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
            ws.projectRoot = projectRoot;
            window.api.workspace.save(JSON.stringify(ws));
          })
          .catch(() => {});
      }
    }

    onProjectChange().catch(() => {});
  }, [hostManaged, projectRoot]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ErrorBoundary>
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{
            backgroundColor: activeTheme === "matrix" ? "#000" : "var(--bg-base)",
            backgroundImage: activeTheme !== "matrix" && appMode === "zen" ? "url('/hero-background.png')" : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {appMode === "canvas" ? (
            <Suspense
              fallback={<div className="h-full" style={{ backgroundColor: "var(--bg-base)" }} />}
            >
              <Canvas />
            </Suspense>
          ) : (
            <Suspense
              fallback={<div className="h-full" style={{ backgroundColor: "var(--bg-base)" }} />}
            >
              <ZenArea />
            </Suspense>
          )}
        </div>
      </ErrorBoundary>
      <ToastViewport />
      <ConfirmDialog />
    </div>
  );
}
