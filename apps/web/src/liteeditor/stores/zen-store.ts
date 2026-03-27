import { create } from "zustand";
import { useTerminalStore } from "./terminal-store";
import { useEditorStore } from "./editor-store";
import { cleanupPaneSession } from "../lib/session-cleanup";
import { resolveTerminalCwd } from "../lib/terminal-utils";
import { getLanguageFromPath } from "../lib/language-map";

export type ZenPanelType =
  | "terminal"
  | "editor"
  | "browser"
  | "unified-editor"
  | "claude"
  | "codex"
  | "chat"
  | "files"
  | "search"
  | "settings"
  | "git";

export interface ZenPanel {
  id: string;
  type: ZenPanelType;
  title: string;
  // Terminal panels
  terminalSessionId?: string;
  // Editor panels
  filePath?: string;
  isDirty?: boolean;
  // Browser panels
  browserSessionId?: string;
  browserUrl?: string;
  // Claude panels
  claudeSessionId?: string;
  // Codex panels
  codexSessionId?: string;
  // Chat panels
  threadId?: string;
  // Cross-mode sync identity (shared with canvas-store)
  syncId?: string;
}

interface ZenState {
  panels: ZenPanel[];
  activePanelId: string | null;
  maximizedPanelId: string | null;

  addTerminalPanel: (shell?: string, cwd?: string, syncId?: string, terminalSessionId?: string) => Promise<void>;
  addEditorPanel: (filePath: string, content: string) => void;
  addBrowserPanel: (url?: string, syncId?: string, browserSessionId?: string) => void;
  addUnifiedEditorPanel: (syncId?: string) => void;
  addClaudePanel: (syncId?: string) => void;
  addCodexPanel: (syncId?: string) => void;
  addChatPanel: (threadId?: string, syncId?: string) => void;
  addFilesPanel: (syncId?: string) => void;
  addSearchPanel: (syncId?: string) => void;
  addSettingsPanel: (syncId?: string) => void;
  addGitPanel: (syncId?: string) => void;
  clearEditorPanels: () => void;
  removePanel: (id: string) => void;
  rebindTerminalPanelSession: (panelId: string, nextSessionId: string) => void;
  setActivePanel: (id: string) => void;
  reorderPanels: (fromIndex: number, toIndex: number) => void;
  markPanelDirty: (id: string, dirty: boolean) => void;
  renamePanel: (id: string, title: string) => void;
  toggleMaximize: (id: string) => void;
}

let panelCounter = 0;

export const useZenStore = create<ZenState>((set, get) => ({
  panels: [],
  activePanelId: null,
  maximizedPanelId: null,

  addTerminalPanel: async (shell?: string, cwd?: string, syncId?: string, terminalSessionId?: string) => {
    const resolvedCwd = resolveTerminalCwd(cwd);
    try {
      const sessionId = terminalSessionId || await window.api.pty.create(shell || undefined, resolvedCwd);
      if (!terminalSessionId) {
        useTerminalStore.getState().createSession(sessionId, shell, resolvedCwd);
      }
      const id = `zen-term-${++panelCounter}`;
      const termCount = get().panels.filter((p) => p.type === "terminal").length + 1;
      set((state) => ({
        panels: [
          ...state.panels,
          {
            id,
            type: "terminal",
            title: `Terminal ${termCount}`,
            terminalSessionId: sessionId,
            syncId: syncId || `sync-${id}`,
          },
        ],
        activePanelId: id,
      }));
    } catch (err) {
      console.error("Failed to create zen terminal panel:", err);
    }
  },

  addBrowserPanel: (url?: string, syncId?: string, browserSessionId?: string) => {
    const id = `zen-browser-${++panelCounter}`;
    const browserCount = get().panels.filter((p) => p.type === "browser").length + 1;
    set((state) => ({
      panels: [
        ...state.panels,
        {
          id,
          type: "browser",
          title: `Browser ${browserCount}`,
          browserUrl: url || "https://www.google.com",
          browserSessionId,
          syncId: syncId || `sync-${id}`,
        },
      ],
      activePanelId: id,
    }));
  },

  addClaudePanel: (syncId?: string) => {
    const id = `zen-claude-${++panelCounter}`;
    set((state) => ({
      panels: [
        ...state.panels,
        {
          id,
          type: "claude",
          title: "Claude Code",
          syncId: syncId || `sync-${id}`,
        },
      ],
      activePanelId: id,
    }));
  },

  addCodexPanel: (syncId?: string) => {
    const id = `zen-codex-${++panelCounter}`;
    set((state) => ({
      panels: [
        ...state.panels,
        {
          id,
          type: "codex",
          title: "Codex",
          syncId: syncId || `sync-${id}`,
        },
      ],
      activePanelId: id,
    }));
  },

  addChatPanel: (threadId?: string, syncId?: string) => {
    const id = `zen-chat-${++panelCounter}`;
    set((state) => ({
      panels: [
        ...state.panels,
        {
          id,
          type: "chat",
          title: "Chat",
          threadId,
          syncId: syncId || `sync-${id}`,
        },
      ],
      activePanelId: id,
    }));
  },

  addFilesPanel: (syncId?: string) => {
    const existing = get().panels.find((p) => p.type === "files");
    if (existing) {
      set({ activePanelId: existing.id });
      return;
    }
    const id = `zen-files-${++panelCounter}`;
    set((state) => ({
      panels: [...state.panels, { id, type: "files", title: "Files", syncId: syncId || `sync-${id}` }],
      activePanelId: id,
    }));
  },

  addSearchPanel: (syncId?: string) => {
    const existing = get().panels.find((p) => p.type === "search");
    if (existing) {
      set({ activePanelId: existing.id });
      return;
    }
    const id = `zen-search-${++panelCounter}`;
    set((state) => ({
      panels: [...state.panels, { id, type: "search", title: "Search", syncId: syncId || `sync-${id}` }],
      activePanelId: id,
    }));
  },

  addSettingsPanel: (syncId?: string) => {
    const existing = get().panels.find((p) => p.type === "settings");
    if (existing) {
      set({ activePanelId: existing.id });
      return;
    }
    const id = `zen-settings-${++panelCounter}`;
    set((state) => ({
      panels: [...state.panels, { id, type: "settings", title: "Settings", syncId: syncId || `sync-${id}` }],
      activePanelId: id,
    }));
  },

  addGitPanel: (syncId?: string) => {
    const existing = get().panels.find((p) => p.type === "git");
    if (existing) {
      set({ activePanelId: existing.id });
      return;
    }
    const id = `zen-git-${++panelCounter}`;
    set((state) => ({
      panels: [...state.panels, { id, type: "git", title: "Git", syncId: syncId || `sync-${id}` }],
      activePanelId: id,
    }));
  },

  addUnifiedEditorPanel: (syncId?: string) => {
    const existing = get().panels.find((p) => p.type === "unified-editor");
    if (existing) {
      set({ activePanelId: existing.id });
      return;
    }
    const id = `zen-unified-${++panelCounter}`;
    set((state) => ({
      panels: [
        ...state.panels,
        {
          id,
          type: "unified-editor",
          title: "Editor",
          syncId: syncId || `sync-${id}`,
        },
      ],
      activePanelId: id,
    }));
  },

  clearEditorPanels: () => {
    set((state) => {
      const panels = state.panels.filter((p) => p.type !== "editor" && p.type !== "unified-editor");
      let activePanelId = state.activePanelId;
      if (activePanelId && !panels.find((p) => p.id === activePanelId)) {
        activePanelId = panels.length > 0 ? panels[panels.length - 1].id : null;
      }
      return { panels, activePanelId };
    });
  },

  addEditorPanel: (filePath: string, content: string) => {
    // Check if panel with this path already exists
    const existing = get().panels.find((p) => p.type === "editor" && p.filePath === filePath);
    if (existing) {
      set({ activePanelId: existing.id });
      return;
    }

    // Create/get Monaco model so content is loaded
    const monaco = (window as any).__monaco;
    if (monaco) {
      const uri = monaco.Uri.file(filePath);
      let model = monaco.editor.getModel(uri);
      if (!model) {
        const language = getLanguageFromPath(filePath);
        model = monaco.editor.createModel(content, language, uri);
      }
    }

    const id = `zen-editor-${++panelCounter}`;
    const fileName = filePath.replace(/^.*[\\/]/, "");
    set((state) => ({
      panels: [
        ...state.panels,
        {
          id,
          type: "editor",
          title: fileName,
          filePath,
          isDirty: false,
        },
      ],
      activePanelId: id,
    }));
  },

  removePanel: (id: string) => {
    const panel = get().panels.find((p) => p.id === id);
    if (!panel) return;

    cleanupPaneSession(panel);

    set((state) => {
      const panels = state.panels.filter((p) => p.id !== id);
      let activePanelId = state.activePanelId;
      if (activePanelId === id) {
        activePanelId = panels.length > 0 ? panels[panels.length - 1].id : null;
      }
      return { panels, activePanelId };
    });
  },

  rebindTerminalPanelSession: (panelId: string, nextSessionId: string) => {
    set((state) => ({
      panels: state.panels.map((panel) =>
        panel.id === panelId && panel.type === "terminal"
          ? { ...panel, terminalSessionId: nextSessionId }
          : panel,
      ),
    }));
  },

  setActivePanel: (id: string) => set({ activePanelId: id }),

  reorderPanels: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const panels = [...state.panels];
      const [moved] = panels.splice(fromIndex, 1);
      panels.splice(toIndex, 0, moved);
      return { panels };
    });
  },

  markPanelDirty: (id: string, dirty: boolean) => {
    set((state) => ({
      panels: state.panels.map((p) => (p.id === id ? { ...p, isDirty: dirty } : p)),
    }));
  },

  renamePanel: (id: string, title: string) => {
    set((state) => ({
      panels: state.panels.map((p) => (p.id === id ? { ...p, title } : p)),
    }));
  },

  toggleMaximize: (id: string) => {
    set((state) => ({
      maximizedPanelId: state.maximizedPanelId === id ? null : id,
    }));
  },
}));
