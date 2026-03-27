import { create } from "zustand";
import { useCanvasStore, setWorkspaceIdProvider, type CanvasPaneState } from "./canvas-store";
import { useEditorStore } from "./editor-store";
import { useProjectStore } from "./project-store";
import { logWarn } from "./error-store";
import { cleanupPaneSession } from "../lib/session-cleanup";

export interface Workspace {
  id: string;
  name: string;
  projectId: string;
  type: "local" | "worktree";
  branch?: string;
  worktreePath?: string;
  canvas: PersistedCanvasState | null;
  lastActivity: number;
  createdAt: number;
}

export interface PersistedCanvasState {
  panes: CanvasPaneState[];
  viewportX: number;
  viewportY: number;
  zoom: number;
}

interface WorkspaceStoreState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  threadCanvasStates: Record<string, PersistedCanvasState>;

  loadWorkspacesForProject: (projectId: string) => Promise<void>;
  createWorkspace: (
    projectId: string,
    name: string,
    type?: "local" | "worktree",
    branch?: string,
    worktreePath?: string,
  ) => Promise<Workspace>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspace: (projectId: string, workspaceId: string) => Promise<void>;
  renameWorkspace: (projectId: string, workspaceId: string, name: string) => Promise<void>;
  saveCurrentWorkspace: () => Promise<void>;
  getActiveWorkspace: () => Workspace | undefined;
  getEffectiveRootPath: () => string | null;

  // Thread-scoped canvas persistence
  saveThreadCanvas: (threadId: string) => void;
  loadThreadCanvas: (threadId: string) => PersistedCanvasState | null;
  clearThreadCanvas: (threadId: string) => void;
}

function captureCanvasState(workspaceId: string): PersistedCanvasState {
  const canvas = useCanvasStore.getState();
  // Only capture panes belonging to this workspace
  const panes = Array.from(canvas.panes.values()).filter(
    (p) => !p.workspaceId || p.workspaceId === workspaceId,
  );
  return {
    panes,
    viewportX: canvas.viewportX,
    viewportY: canvas.viewportY,
    zoom: canvas.zoom,
  };
}

function restoreWorkspacePanes(workspaceId: string, state: PersistedCanvasState | null): void {
  const canvas = useCanvasStore.getState();

  // Remove non-terminal panes from the previous workspace (terminals stay hidden)
  // Keep all panes from OTHER workspaces
  const currentPanes = new Map(canvas.panes);
  for (const [id, pane] of currentPanes) {
    // Remove panes that don't belong to any workspace (legacy) or belong to a different workspace
    // But keep terminal panes from any workspace (CSS-hidden persistence)
    if (pane.type !== "terminal" && pane.workspaceId && pane.workspaceId !== workspaceId) {
      // Keep — these belong to other workspaces and are already hidden
    } else if (!pane.workspaceId || pane.workspaceId !== workspaceId) {
      // Remove untagged non-terminal panes (legacy cleanup)
      if (pane.type !== "terminal") {
        // Destroy backend sessions before removing pane to prevent leaks
        try {
          cleanupPaneSession(pane);
        } catch (err) {
          logWarn("workspace-store", `Failed to cleanup pane ${id} during workspace switch`, err);
        }
        currentPanes.delete(id);
      }
    }
  }

  // Add panes from the target workspace
  if (state) {
    for (const pane of state.panes) {
      currentPanes.set(pane.id, { ...pane, workspaceId });
    }
  }

  canvas.setPanes(currentPanes);
  if (state) {
    canvas.setViewport(state.viewportX, state.viewportY, state.zoom);
  }
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  activeProjectId: null,
  threadCanvasStates: {},

  loadWorkspacesForProject: async (projectId) => {
    const workspaces = (await window.api.workspaces.list(projectId)) as Workspace[];
    set({ workspaces, activeProjectId: projectId, activeWorkspaceId: null });
  },

  createWorkspace: async (projectId, name, type = "local", branch, worktreePath) => {
    const persisted = (await window.api.workspaces.create(
      projectId,
      name,
      type,
      branch,
      worktreePath,
    )) as Workspace;
    set((s) => ({ workspaces: [...s.workspaces, persisted] }));
    return persisted;
  },

  switchWorkspace: async (workspaceId) => {
    const state = get();
    if (state.activeWorkspaceId === workspaceId) return;

    // Save current workspace before switching
    if (state.activeWorkspaceId && state.activeProjectId) {
      await get().saveCurrentWorkspace();
    }

    // Tag any untagged panes with the current workspace before switching
    if (state.activeWorkspaceId) {
      useCanvasStore.getState().tagPanesWithWorkspace(state.activeWorkspaceId);
    }

    // Load target workspace
    const target = state.workspaces.find((w) => w.id === workspaceId);
    if (!target) return;

    // Load full workspace data from disk
    let canvasState: PersistedCanvasState | null = null;
    try {
      const full = (await window.api.workspaces.load(
        target.projectId,
        workspaceId,
      )) as Workspace | null;
      canvasState = full?.canvas as PersistedCanvasState | null;
    } catch (err) {
      logWarn(
        "workspace-store",
        `Failed to load workspace ${workspaceId}, starting with empty canvas`,
        err,
      );
    }

    // Restore canvas with terminal persistence
    restoreWorkspacePanes(workspaceId, canvasState);

    // Set project root — look up from project-store (not stale editor-store)
    const project = useProjectStore.getState().projects.find((p) => p.id === target.projectId);
    const effectivePath =
      target.worktreePath || project?.rootPath || useEditorStore.getState().projectRoot;
    if (effectivePath) {
      useEditorStore.getState().setProjectRoot(effectivePath);
    }

    set({ activeWorkspaceId: workspaceId });
  },

  deleteWorkspace: async (projectId, workspaceId) => {
    await window.api.workspaces.delete(projectId, workspaceId);
    set((s) => {
      const workspaces = s.workspaces.filter((w) => w.id !== workspaceId);
      let activeWorkspaceId = s.activeWorkspaceId;
      if (activeWorkspaceId === workspaceId) {
        activeWorkspaceId = workspaces.length > 0 ? workspaces[0].id : null;
      }
      return { workspaces, activeWorkspaceId };
    });
  },

  renameWorkspace: async (projectId, workspaceId, name) => {
    await window.api.workspaces.rename(projectId, workspaceId, name);
    set((s) => ({
      workspaces: s.workspaces.map((w) => (w.id === workspaceId ? { ...w, name } : w)),
    }));
  },

  saveCurrentWorkspace: async () => {
    const { activeWorkspaceId, activeProjectId, workspaces } = get();
    if (!activeWorkspaceId || !activeProjectId) return;

    const workspace = workspaces.find((w) => w.id === activeWorkspaceId);
    if (!workspace) return;

    const canvasState = captureCanvasState(activeWorkspaceId);
    const updated: Workspace = {
      ...workspace,
      canvas: canvasState,
      lastActivity: Date.now(),
    };

    await window.api.workspaces.save(activeProjectId, JSON.stringify(updated));
    set((s) => ({
      workspaces: s.workspaces.map((w) =>
        w.id === activeWorkspaceId ? { ...w, canvas: canvasState, lastActivity: Date.now() } : w,
      ),
    }));
  },

  getActiveWorkspace: () => {
    const s = get();
    return s.workspaces.find((w) => w.id === s.activeWorkspaceId);
  },

  getEffectiveRootPath: () => {
    const ws = get().getActiveWorkspace();
    if (ws?.worktreePath) return ws.worktreePath;
    // Look up project root from project-store (authoritative) rather than editor-store (may be stale)
    const project = useProjectStore.getState().projects.find((p) => p.id === get().activeProjectId);
    return project?.rootPath || useEditorStore.getState().projectRoot;
  },

  // Thread-scoped canvas persistence
  saveThreadCanvas: (threadId: string) => {
    const canvasState = useCanvasStore.getState().getCanvasState();
    set((s) => ({
      threadCanvasStates: { ...s.threadCanvasStates, [threadId]: canvasState },
    }));
  },

  loadThreadCanvas: (threadId: string) => {
    return get().threadCanvasStates[threadId] ?? null;
  },

  clearThreadCanvas: (threadId: string) => {
    set((s) => {
      const { [threadId]: _, ...rest } = s.threadCanvasStates;
      return { threadCanvasStates: rest };
    });
  },
}));

// Wire up the workspace ID provider for canvas-store (avoids circular import)
setWorkspaceIdProvider(() => useWorkspaceStore.getState().activeWorkspaceId);
