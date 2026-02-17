import { create } from 'zustand'

export interface TerminalSession {
  id: string
  title: string
  shell?: string
  cwd?: string
}

interface TerminalState {
  sessions: Map<string, TerminalSession>

  createSession: (id: string, shell?: string, cwd?: string) => void
  killSession: (id: string) => void
  renameSession: (id: string, title: string) => void
}

export const useTerminalStore = create<TerminalState>((set) => ({
  sessions: new Map(),

  createSession: (id, shell, cwd) => {
    set((state) => {
      const sessions = new Map(state.sessions)
      sessions.set(id, {
        id,
        title: `Terminal ${sessions.size + 1}`,
        shell,
        cwd
      })
      return { sessions }
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
  }
}))
