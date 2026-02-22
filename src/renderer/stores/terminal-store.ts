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
  addTerminal: (shell?: string, cwd?: string) => Promise<void>
  removeTerminal: (id: string) => void
  setActiveSession: (id: string) => void
  reorderTerminals: (fromIndex: number, toIndex: number) => void
  restartTerminal: (id: string, cwd: string) => Promise<void>
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

  addTerminal: async (shell?: string, cwd?: string) => {
    const fallbackCwd = cwd || useEditorStore.getState().projectRoot || undefined
    try {
      const sessionId = await window.api.pty.create(shell || undefined, fallbackCwd)
      get().createSession(sessionId, shell, fallbackCwd)
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
    if (!session) return
    const { shell } = session

    try { window.api.pty.kill(id) } catch { /* ignore */ }

    try {
      const newId = await window.api.pty.create(shell || undefined, cwd)
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, id: newId, cwd } : s
        ),
        activeSessionId: state.activeSessionId === id ? newId : state.activeSessionId
      }))
    } catch (err) {
      console.error('Failed to restart terminal:', err)
    }
  }
}))
