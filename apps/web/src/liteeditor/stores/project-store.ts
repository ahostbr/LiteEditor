import { create } from "zustand";
import { useWorkspaceStore } from "./workspace-store";

export type AgentStatus = "idle" | "working" | "waiting" | "error";

/** Persisted fields (stored in ~/.liteeditor/projects.json via main process) */
export interface PersistedProject {
  id: string;
  name: string;
  rootPath: string;
  lastActiveWorkspaceId: string;
  lastActivity: number;
  pinned: boolean;
  createdAt: number;
  /** Project icon — preset name (e.g. "code", "python") or custom path */
  icon?: string;
}

/** Full runtime state (persisted fields + ephemeral UI state) */
export interface ProjectState extends PersistedProject {
  gitBranch: string | null;
  agentStatus: AgentStatus;
  agentStatusText: string;
  prStatus: { number: number; state: "open" | "merged" | "draft" | "closed" } | null;
  listeningPorts: number[];
  notificationCount: number;
}

function toProjectState(p: PersistedProject): ProjectState {
  return {
    ...p,
    gitBranch: null,
    agentStatus: "idle",
    agentStatusText: "",
    prStatus: null,
    listeningPorts: [],
    notificationCount: 0,
  };
}

interface ProjectStoreState {
  projects: ProjectState[];
  activeProjectId: string | null;
  loaded: boolean;

  loadFromDisk: () => Promise<void>;
  addProject: (path: string, name?: string) => Promise<string>;
  removeProject: (id: string) => Promise<void>;
  setActiveProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectState>) => void;
  renameProject: (id: string, name: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  getActiveProject: () => ProjectState | undefined;
  clearNotifications: (id: string) => void;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  loaded: false,

  loadFromDisk: async () => {
    // Retry up to 3 times with increasing delay — backend IPC may not be ready on cold start
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const persisted = (await window.api.project.list()) as PersistedProject[];
        set({
          projects: persisted.map(toProjectState),
          loaded: true,
        });
        return;
      } catch {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }
    // All retries failed — mark as loaded with empty list so UI doesn't hang
    set({ loaded: true });
  },

  addProject: async (path, name) => {
    const existing = get().projects.find((p) => p.rootPath === path);
    if (existing) {
      set({ activeProjectId: existing.id });
      return existing.id;
    }

    const persisted = (await window.api.project.add(path, name)) as PersistedProject;
    const project = toProjectState(persisted);

    set((s) => ({
      projects: [...s.projects, project],
      activeProjectId: persisted.id,
    }));

    // Auto-create Default workspace for new projects
    if (!persisted.lastActiveWorkspaceId) {
      const ws = await useWorkspaceStore.getState().createWorkspace(persisted.id, "Default");
      await window.api.project.update(persisted.id, { lastActiveWorkspaceId: ws.id });
    }

    return persisted.id;
  },

  removeProject: async (id) => {
    await window.api.project.remove(id);
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id);
      let activeProjectId = s.activeProjectId;
      if (activeProjectId === id) {
        activeProjectId = projects.length > 0 ? projects[projects.length - 1].id : null;
      }
      return { projects, activeProjectId };
    });
  },

  setActiveProject: async (id) => {
    set({ activeProjectId: id });
    await window.api.project.update(id, { lastActivity: Date.now() });
  },

  updateProject: (id, updates) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  renameProject: async (id, name) => {
    await window.api.project.update(id, { name });
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  },

  togglePin: async (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return;
    const pinned = !project.pinned;
    await window.api.project.update(id, { pinned });
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, pinned } : p)),
    }));
  },

  reorderProjects: (fromIndex, toIndex) => {
    set((s) => {
      const projects = [...s.projects];
      const [moved] = projects.splice(fromIndex, 1);
      projects.splice(toIndex, 0, moved);
      return { projects };
    });
  },

  getActiveProject: () => {
    const s = get();
    return s.projects.find((p) => p.id === s.activeProjectId);
  },

  clearNotifications: (id) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, notificationCount: 0 } : p)),
    }));
  },
}));
