import { create } from 'zustand'
import { useEditorStore } from './editor-store'
import { useSettingsStore } from './settings-store'

export interface TerminalSession {
  id: string
  title: string
  shell?: string
  cwd?: string
  createdAt?: number
}

interface TerminalState {
  sessions: TerminalSession[]
  activeSessionId: string | null

  createSession: (id: string, shell?: string, cwd?: string, createdAt?: number) => void
  updateSessionMeta: (id: string, meta: { shell?: string; cwd?: string; createdAt?: number }) => void
  killSession: (id: string) => void
  renameSession: (id: string, title: string) => void
  addTerminal: (shell?: string, cwd?: string) => Promise<void>
  removeTerminal: (id: string) => void
  setActiveSession: (id: string) => void
  reorderTerminals: (fromIndex: number, toIndex: number) => void
  restartTerminal: (id: string, cwd: string) => Promise<string | null>
}

function resolveTerminalCwd(cwd?: string): string | undefined {
  const explicitCwd = typeof cwd === 'string' ? cwd.trim() : ''
  if (explicitCwd) return explicitCwd

  const configuredCwd = useSettingsStore.getState().defaultTerminalCwd.trim()
  if (configuredCwd) return configuredCwd

  return useEditorStore.getState().projectRoot || undefined
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,

  createSession: (id, shell, cwd, createdAt) => {
    set((state) => {
      const existing = state.sessions.find((session) => session.id === id)
      if (existing) {
        const sessions = state.sessions.map((session) =>
          session.id === id
            ? {
                ...session,
                ...(shell !== undefined ? { shell } : {}),
                ...(cwd !== undefined ? { cwd } : {}),
                ...(createdAt !== undefined ? { createdAt } : {})
              }
            : session
        )
        return { sessions, activeSessionId: id }
      }

      const sessions = [
        ...state.sessions,
        {
          id,
          title: `Terminal ${state.sessions.length + 1}`,
          shell,
          cwd,
          createdAt
        }
      ]
      return { sessions, activeSessionId: id }
    })
  },

  updateSessionMeta: (id, meta) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id
          ? {
              ...session,
              ...(meta.shell !== undefined ? { shell: meta.shell } : {}),
              ...(meta.cwd !== undefined ? { cwd: meta.cwd } : {}),
              ...(meta.createdAt !== undefined ? { createdAt: meta.createdAt } : {})
            }
          : session
      )
    }))
  },

  killSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id)
    }))
  },

  renameSession: (id, title) => {
    set((state) => ({
      sessions: state.sessions.map((s) => s.id === id ? { ...s, title } : s)
    }))
  },

  addTerminal: async (shell?: string, cwd?: string) => {
    const resolvedCwd = resolveTerminalCwd(cwd)
    try {
      const sessionId = await window.api.pty.create(shell || undefined, resolvedCwd)
      get().createSession(sessionId, shell, resolvedCwd)
      const info = await window.api.pty.getSessionInfo(sessionId)
      if (info) {
        get().updateSessionMeta(sessionId, {
          shell: info.shell,
          cwd: info.cwd,
          createdAt: info.createdAt
        })
      }
    } catch (err) {
      console.error('Failed to create terminal:', err)
    }
  },

  removeTerminal: (id) => {
    const exists = get().sessions.some((s) => s.id === id)
    if (exists) {
      try { window.api.pty.kill(id) } catch { /* ignore */ }
    }
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id)
      let activeSessionId = state.activeSessionId
      if (activeSessionId === id) {
        activeSessionId = sessions.length > 0 ? sessions[sessions.length - 1].id : null
      }
      return { sessions, activeSessionId }
    })
  },

  setActiveSession: (id) => set({ activeSessionId: id }),

  reorderTerminals: (fromIndex, toIndex) => {
    set((state) => {
      const sessions = [...state.sessions]
      const [moved] = sessions.splice(fromIndex, 1)
      sessions.splice(toIndex, 0, moved)
      return { sessions }
    })
  },

  restartTerminal: async (id, cwd) => {
    const session = get().sessions.find((s) => s.id === id)
    if (!session) return null
    const { shell } = session
    const resolvedCwd = cwd.trim()
    if (!resolvedCwd) return null

    try {
      const newId = await window.api.pty.create(shell || undefined, resolvedCwd)
      try { window.api.pty.kill(id) } catch { /* ignore */ }

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, id: newId, cwd: resolvedCwd } : s
        ),
        activeSessionId: state.activeSessionId === id ? newId : state.activeSessionId
      }))
      const info = await window.api.pty.getSessionInfo(newId)
      if (info) {
        get().updateSessionMeta(newId, {
          shell: info.shell,
          cwd: info.cwd,
          createdAt: info.createdAt
        })
      }
      return newId
    } catch (err) {
      console.error('Failed to restart terminal:', err)
      return null
    }
  }
}))
