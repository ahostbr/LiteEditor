import { create } from 'zustand'

export type SidebarPanel = 'files' | 'search' | 'git' | 'settings'

export type AppMode = 'editor' | 'zen'

interface UiState {
  sidebarVisible: boolean
  activeSidebarPanel: SidebarPanel
  sidebarWidth: number
  terminalPanelVisible: boolean
  appMode: AppMode

  toggleSidebar: () => void
  setActiveSidebarPanel: (panel: SidebarPanel) => void
  setSidebarWidth: (width: number) => void
  toggleTerminalPanel: () => void
  setAppMode: (mode: AppMode) => void
  toggleAppMode: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarVisible: true,
  activeSidebarPanel: 'files',
  sidebarWidth: 260,
  terminalPanelVisible: false,
  appMode: 'editor',

  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),

  setActiveSidebarPanel: (panel) =>
    set((s) => {
      if (s.activeSidebarPanel === panel && s.sidebarVisible) {
        return { sidebarVisible: false }
      }
      return { activeSidebarPanel: panel, sidebarVisible: true }
    }),

  setSidebarWidth: (width) => set({ sidebarWidth: width }),

  toggleTerminalPanel: () => set((s) => ({ terminalPanelVisible: !s.terminalPanelVisible })),

  setAppMode: (mode) => set({ appMode: mode }),
  toggleAppMode: () => set((s) => ({ appMode: s.appMode === 'editor' ? 'zen' : 'editor' }))
}))
