// @ts-nocheck
import { create } from "zustand";

export type SidebarPanel = "projects" | "files" | "search" | "git";

export type AppMode = "canvas" | "zen";

export interface WorkspaceUIState {
  sidebarVisible: boolean;
  activeSidebarPanel: SidebarPanel;
  sidebarWidth: number;
  terminalPanelVisible: boolean;
  settingsPanelVisible: boolean;
  appMode: AppMode;
}

interface UiState {
  sidebarVisible: boolean;
  activeSidebarPanel: SidebarPanel;
  sidebarWidth: number;
  terminalPanelVisible: boolean;
  settingsPanelVisible: boolean;
  appMode: AppMode;
  nativeOverlayOpen: boolean;

  toggleSidebar: () => void;
  setActiveSidebarPanel: (panel: SidebarPanel) => void;
  setSidebarWidth: (width: number) => void;
  toggleTerminalPanel: () => void;
  toggleSettingsPanel: () => void;
  setAppMode: (mode: AppMode) => void;
  toggleAppMode: () => void;
  setNativeOverlayOpen: (open: boolean) => void;
  getUIState: () => WorkspaceUIState;
  restoreUIState: (state: Partial<WorkspaceUIState>) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarVisible: true,
  activeSidebarPanel: "projects",
  sidebarWidth: 260,
  terminalPanelVisible: false,
  settingsPanelVisible: false,
  appMode: "canvas",
  nativeOverlayOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),

  setActiveSidebarPanel: (panel) =>
    set((s) => {
      if (s.activeSidebarPanel === panel && s.sidebarVisible) {
        return { sidebarVisible: false };
      }
      return { activeSidebarPanel: panel, sidebarVisible: true };
    }),

  setSidebarWidth: (width) => set({ sidebarWidth: width }),

  toggleTerminalPanel: () => set((s) => ({ terminalPanelVisible: !s.terminalPanelVisible })),
  toggleSettingsPanel: () => set((s) => ({ settingsPanelVisible: !s.settingsPanelVisible })),

  setAppMode: (mode) => set({ appMode: mode }),
  toggleAppMode: () =>
    set((s) => {
      // Cycle: canvas -> zen -> canvas
      const modes: AppMode[] = ["canvas", "zen"];
      const idx = modes.indexOf(s.appMode);
      return { appMode: modes[(idx + 1) % modes.length] };
    }),
  setNativeOverlayOpen: (open) => set({ nativeOverlayOpen: open }),

  getUIState: (): WorkspaceUIState => {
    const s = get();
    return {
      sidebarVisible: s.sidebarVisible,
      activeSidebarPanel: s.activeSidebarPanel,
      sidebarWidth: s.sidebarWidth,
      terminalPanelVisible: s.terminalPanelVisible,
      settingsPanelVisible: s.settingsPanelVisible,
      appMode: s.appMode,
    };
  },

  restoreUIState: (state) => {
    const update: Partial<UiState> = {};
    if (state.sidebarVisible !== undefined) update.sidebarVisible = state.sidebarVisible;
    if (state.activeSidebarPanel && (state.activeSidebarPanel as string) !== "settings")
      update.activeSidebarPanel = state.activeSidebarPanel as SidebarPanel;
    if (state.sidebarWidth !== undefined) update.sidebarWidth = state.sidebarWidth;
    if (state.terminalPanelVisible !== undefined)
      update.terminalPanelVisible = state.terminalPanelVisible;
    if (state.settingsPanelVisible !== undefined)
      update.settingsPanelVisible = state.settingsPanelVisible;
    if (state.appMode) update.appMode = state.appMode;
    set(update);
  },
}));
