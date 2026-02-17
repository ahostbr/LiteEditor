import { create } from 'zustand'

export type SidebarPanel = 'files' | 'search' | 'git' | 'settings'

interface UiState {
  sidebarVisible: boolean
  activeSidebarPanel: SidebarPanel
  sidebarWidth: number
  terminalPanelVisible: boolean

  toggleSidebar: () => void
  setActiveSidebarPanel: (panel: SidebarPanel) => void
  setSidebarWidth: (width: number) => void
  toggleTerminalPanel: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarVisible: true,
  activeSidebarPanel: 'files',
  sidebarWidth: 260,
  terminalPanelVisible: false,

  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),

  setActiveSidebarPanel: (panel) =>
    set((s) => {
      if (s.activeSidebarPanel === panel && s.sidebarVisible) {
        return { sidebarVisible: false }
      }
      return { activeSidebarPanel: panel, sidebarVisible: true }
    }),

  setSidebarWidth: (width) => set({ sidebarWidth: width }),

  toggleTerminalPanel: () => set((s) => ({ terminalPanelVisible: !s.terminalPanelVisible }))
}))
