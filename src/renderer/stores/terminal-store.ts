import { create } from 'zustand'
import { useEditorStore } from './editor-store'

export interface TerminalSession {
  id: string
  title: string
  shell?: string
  cwd?: string
}

interface TerminalState {
  sessions: TerminalSession[]
  activeSessionId: string | null

  createSession: (id: string, shell?: string, cwd?: string) => void
  killSession: (id: string) => void
  renameSession: (id: string, title: string) => void
  addTerminal: () => Promise<void>
  removeTerminal: (id: string) => void
  setActiveSession: (id: string) => void
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,

  createSession: (id, shell, cwd) => {
    set((state) => {
      const sessions = [...state.sessions, {
        id,
        title: `Terminal ${state.sessions.length + 1}`,
        shell,
        cwd
      }]
      return { sessions, activeSessionId: id }
    })
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
    try { window.api.pty.kill(id) } catch { /* ignore */ }
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id)
      let activeSessionId = state.activeSessionId
      if (activeSessionId === id) {
        activeSessionId = sessions.length > 0 ? sessions[sessions.length - 1].id : null
      }
      return { sessions, activeSessionId }
    })
  },

  setActiveSession: (id) => set({ activeSessionId: id })
}))
