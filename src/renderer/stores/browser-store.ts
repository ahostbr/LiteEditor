import { create } from 'zustand'

export interface BrowserSession {
  id: string
  url: string
  title: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
}

interface BrowserState {
  sessions: Map<string, BrowserSession>
  registerSession: (id: string, url?: string) => void
  removeSession: (id: string) => void
  updateSession: (id: string, updates: Partial<BrowserSession>) => void
  getSession: (id: string) => BrowserSession | undefined
}

export const useBrowserStore = create<BrowserState>((set, get) => ({
  sessions: new Map(),

  registerSession: (id, url) => {
    set((state) => {
      const sessions = new Map(state.sessions)
      sessions.set(id, {
        id,
        url: url || 'about:blank',
        title: '',
        isLoading: true,
        canGoBack: false,
        canGoForward: false
      })
      return { sessions }
    })
  },

  removeSession: (id) => {
    set((state) => {
      const sessions = new Map(state.sessions)
      sessions.delete(id)
      return { sessions }
    })
  },

  updateSession: (id, updates) => {
    set((state) => {
      const sessions = new Map(state.sessions)
      const existing = sessions.get(id)
      if (existing) {
        sessions.set(id, { ...existing, ...updates })
      }
      return { sessions }
    })
  },

  getSession: (id) => {
    return get().sessions.get(id)
  }
}))
