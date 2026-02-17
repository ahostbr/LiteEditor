import { create } from 'zustand'
import { useEditorStore } from './editor-store'

export interface TerminalSession {
  id: string
  title: string
  shell?: string
  cwd?: string
}

interface TerminalState {
  sessions: Map<string, TerminalSession>
  activeSessionId: string | null

  createSession: (id: string, shell?: string, cwd?: string) => void
  killSession: (id: string) => void
  renameSession: (id: string, title: string) => void
  addTerminal: () => Promise<void>
  removeTerminal: (id: string) => void
  setActiveSession: (id: string) => void
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: new Map(),
  activeSessionId: null,

  createSession: (id, shell, cwd) => {
    set((state) => {
      const sessions = new Map(state.sessions)
      sessions.set(id, {
        id,
        title: `Terminal ${sessions.size + 1}`,
        shell,
        cwd
      })
      return { sessions, activeSessionId: id }
    })
  },

  killSession: (id) => {
    set((state) => {
      const sessions = new Map(state.sessions)
      sessions.delete(id)
      return { sessions }
    })
  },

  renameSession: (id, title) => {
    set((state) => {
      const sessions = new Map(state.sessions)
      const session = sessions.get(id)
      if (session) {
        sessions.set(id, { ...session, title })
      }
      return { sessions }
    })
  },

  addTerminal: async () => {
    const cwd = useEditorStore.getState().projectRoot || undefined
    try {
      const sessionId = await window.api.pty.create(undefined, cwd)
      get().createSession(sessionId, undefined, cwd)
    } catch (err) {
      console.error('Failed to create terminal:', err)
    }
  },

  removeTerminal: (id) => {
    window.api.pty.kill(id).catch(() => {})
    set((state) => {
      const sessions = new Map(state.sessions)
      sessions.delete(id)
      // Select next session if we removed the active one
      let activeSessionId = state.activeSessionId
      if (activeSessionId === id) {
        const remaining = Array.from(sessions.keys())
        activeSessionId = remaining.length > 0 ? remaining[remaining.length - 1] : null
      }
      return { sessions, activeSessionId }
    })
  },

  setActiveSession: (id) => set({ activeSessionId: id })
}))
