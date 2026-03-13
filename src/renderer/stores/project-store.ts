import { create } from 'zustand'

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'error'

export interface ProjectState {
  id: string
  name: string
  rootPath: string
  gitBranch: string | null
  agentStatus: AgentStatus
  agentStatusText: string
  prStatus: { number: number; state: 'open' | 'merged' | 'draft' | 'closed' } | null
  listeningPorts: number[]
  lastActivity: number
  pinned: boolean
  notificationCount: number
}

interface ProjectStoreState {
  projects: ProjectState[]
  activeProjectId: string | null

  addProject: (path: string, name?: string) => string
  removeProject: (id: string) => void
  setActiveProject: (id: string) => void
  updateProject: (id: string, updates: Partial<ProjectState>) => void
  renameProject: (id: string, name: string) => void
  togglePin: (id: string) => void
  reorderProjects: (fromIndex: number, toIndex: number) => void
  getActiveProject: () => ProjectState | undefined
  clearNotifications: (id: string) => void
}

let projectCounter = 0

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [],
  activeProjectId: null,

  addProject: (path, name) => {
    const existing = get().projects.find((p) => p.rootPath === path)
    if (existing) {
      set({ activeProjectId: existing.id })
      return existing.id
    }

    const id = `project-${++projectCounter}`
    const projectName = name || path.replace(/^.*[\\/]/, '') || 'Project'

    const project: ProjectState = {
      id,
      name: projectName,
      rootPath: path,
      gitBranch: null,
      agentStatus: 'idle',
      agentStatusText: '',
      prStatus: null,
      listeningPorts: [],
      lastActivity: Date.now(),
      pinned: false,
      notificationCount: 0
    }

    set((s) => ({
      projects: [...s.projects, project],
      activeProjectId: id
    }))

    return id
  },

  removeProject: (id) => {
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id)
      let activeProjectId = s.activeProjectId
      if (activeProjectId === id) {
        activeProjectId = projects.length > 0 ? projects[projects.length - 1].id : null
      }
      return { projects, activeProjectId }
    })
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  updateProject: (id, updates) => {
    set((s) => ({
      projects: s.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
    }))
  },

  renameProject: (id, name) => {
    set((s) => ({
      projects: s.projects.map((p) => p.id === id ? { ...p, name } : p)
    }))
  },

  togglePin: (id) => {
    set((s) => ({
      projects: s.projects.map((p) => p.id === id ? { ...p, pinned: !p.pinned } : p)
    }))
  },

  reorderProjects: (fromIndex, toIndex) => {
    set((s) => {
      const projects = [...s.projects]
      const [moved] = projects.splice(fromIndex, 1)
      projects.splice(toIndex, 0, moved)
      return { projects }
    })
  },

  getActiveProject: () => {
    const s = get()
    return s.projects.find((p) => p.id === s.activeProjectId)
  },

  clearNotifications: (id) => {
    set((s) => ({
      projects: s.projects.map((p) => p.id === id ? { ...p, notificationCount: 0 } : p)
    }))
  }
}))
