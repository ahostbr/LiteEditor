import { create } from "zustand";
import { nativeBoundsController } from "../lib/native-bounds-controller";

export interface BrowserTab {
  id: string;
  sessionId: string | null; // WebContentsView session (ephemeral — not persisted)
  url: string;
  title: string;
  favicon?: string;
  workspaceColor?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

interface PaneShellState {
  tabs: BrowserTab[];
  activeTabIndex: number;
  sidebarCollapsed: boolean;
}

interface BrowserShellState {
  panes: Map<string, PaneShellState>;

  // Pane lifecycle
  initPane: (paneId: string, sidebarCollapsed?: boolean) => void;
  destroyPane: (paneId: string) => Promise<void>;

  // Tab lifecycle
  openTab: (paneId: string, url: string, workspaceColor?: string) => Promise<string | null>;
  closeTab: (paneId: string, tabId: string) => Promise<void>;
  activateTab: (paneId: string, tabId: string) => void;

  // Tab state updates (from IPC)
  updateTab: (sessionId: string, updates: Partial<Pick<BrowserTab, "url" | "title" | "favicon" | "isLoading" | "canGoBack" | "canGoForward">>) => void;

  // Sidebar
  setSidebarCollapsed: (paneId: string, collapsed: boolean) => void;

  // Selectors
  getPane: (paneId: string) => PaneShellState | undefined;
  getActiveTab: (paneId: string) => BrowserTab | undefined;
}

let tabCounter = 0;

function makeTab(url: string, workspaceColor?: string): BrowserTab {
  return {
    id: `tab-${++tabCounter}-${Date.now()}`,
    sessionId: null,
    url,
    title: url,
    workspaceColor,
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
  };
}

const browserDriver = {
  createView: (url: string) => window.api.browser.createView(url),
  destroyView: (sessionId: string) => window.api.browser.destroyView(sessionId),
  showView: (sessionId: string) => window.api.browser.showView(sessionId),
  hideView: (sessionId: string) => window.api.browser.hideView(sessionId),
  setBounds: (sessionId: string, bounds: Parameters<typeof window.api.browser.setBounds>[1]) =>
    window.api.browser.setBounds(sessionId, bounds),
};

export const useBrowserShellStore = create<BrowserShellState>((set, get) => ({
  panes: new Map(),

  initPane: (paneId, sidebarCollapsed = false) => {
    const existing = get().panes.get(paneId);
    if (existing) return;
    set((state) => {
      const panes = new Map(state.panes);
      panes.set(paneId, { tabs: [], activeTabIndex: 0, sidebarCollapsed });
      return { panes };
    });
  },

  destroyPane: async (paneId) => {
    const pane = get().panes.get(paneId);
    if (!pane) return;

    // Destroy all sessions in order — hide first, then destroy
    for (const tab of pane.tabs) {
      if (tab.sessionId) {
        try {
          browserDriver.hideView(tab.sessionId);
        } catch {}
        try {
          browserDriver.destroyView(tab.sessionId);
        } catch {}
      }
    }

    set((state) => {
      const panes = new Map(state.panes);
      panes.delete(paneId);
      return { panes };
    });
  },

  openTab: async (paneId, url, workspaceColor) => {
    // Ensure pane exists
    if (!get().panes.get(paneId)) {
      get().initPane(paneId);
    }

    const tab = makeTab(url, workspaceColor);

    // Insert tab into pane immediately (with null sessionId so UI can render placeholder)
    set((state) => {
      const panes = new Map(state.panes);
      const pane = panes.get(paneId);
      if (!pane) return state;
      const newTabs = [...pane.tabs, tab];
      panes.set(paneId, { ...pane, tabs: newTabs, activeTabIndex: newTabs.length - 1 });
      return { panes };
    });

    // Create native session
    try {
      const sessionId = await browserDriver.createView(url);
      tab.sessionId = sessionId;
      tab.isLoading = true;

      set((state) => {
        const panes = new Map(state.panes);
        const pane = panes.get(paneId);
        if (!pane) return state;
        const tabs = pane.tabs.map((t) => (t.id === tab.id ? { ...t, sessionId, isLoading: true } : t));
        panes.set(paneId, { ...pane, tabs });
        return { panes };
      });

      return sessionId;
    } catch (err) {
      console.error("[BrowserShellStore] createView failed:", err);
      // Remove the tab that failed
      set((state) => {
        const panes = new Map(state.panes);
        const pane = panes.get(paneId);
        if (!pane) return state;
        const tabs = pane.tabs.filter((t) => t.id !== tab.id);
        const activeTabIndex = Math.min(pane.activeTabIndex, Math.max(0, tabs.length - 1));
        panes.set(paneId, { ...pane, tabs, activeTabIndex });
        return { panes };
      });
      return null;
    }
  },

  closeTab: async (paneId, tabId) => {
    const pane = get().panes.get(paneId);
    if (!pane) return;

    const tab = pane.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Destroy native session
    if (tab.sessionId) {
      try {
        browserDriver.hideView(tab.sessionId);
      } catch {}
      try {
        browserDriver.destroyView(tab.sessionId);
      } catch {}
    }

    set((state) => {
      const panes = new Map(state.panes);
      const p = panes.get(paneId);
      if (!p) return state;
      const tabs = p.tabs.filter((t) => t.id !== tabId);
      if (tabs.length === 0) {
        // No tabs left — pane will be cleaned up by caller or leave empty
        panes.set(paneId, { ...p, tabs: [], activeTabIndex: 0 });
      } else {
        const activeTabIndex = Math.min(p.activeTabIndex, tabs.length - 1);
        panes.set(paneId, { ...p, tabs, activeTabIndex });
      }
      return { panes };
    });
  },

  activateTab: (paneId, tabId) => {
    const pane = get().panes.get(paneId);
    if (!pane) return;

    const newIndex = pane.tabs.findIndex((t) => t.id === tabId);
    if (newIndex === -1) return;

    const oldTab = pane.tabs[pane.activeTabIndex];
    const newTab = pane.tabs[newIndex];

    // Sequence: hide old → update NativeBoundsController → show new
    // NativeBoundsController's rAF loop handles setBounds — don't call it here
    if (oldTab?.sessionId && oldTab.sessionId !== newTab?.sessionId) {
      try {
        browserDriver.hideView(oldTab.sessionId);
      } catch {}
    }

    if (newTab?.sessionId) {
      // Update the rAF loop to track the new session's bounds
      nativeBoundsController.updateSessionId(paneId, newTab.sessionId);
      try {
        browserDriver.showView(newTab.sessionId);
      } catch {}
    }

    set((state) => {
      const panes = new Map(state.panes);
      const p = panes.get(paneId);
      if (!p) return state;
      panes.set(paneId, { ...p, activeTabIndex: newIndex });
      return { panes };
    });
  },

  updateTab: (sessionId, updates) => {
    set((state) => {
      const panes = new Map(state.panes);
      let changed = false;

      for (const [paneId, pane] of panes) {
        const tabIndex = pane.tabs.findIndex((t) => t.sessionId === sessionId);
        if (tabIndex === -1) continue;

        const tab = pane.tabs[tabIndex];
        const newTab = { ...tab, ...updates };
        const tabs = [...pane.tabs];
        tabs[tabIndex] = newTab;
        panes.set(paneId, { ...pane, tabs });
        changed = true;
        break; // sessionId is unique across panes
      }

      return changed ? { panes } : state;
    });
  },

  setSidebarCollapsed: (paneId, collapsed) => {
    set((state) => {
      const panes = new Map(state.panes);
      const pane = panes.get(paneId);
      if (!pane) return state;
      panes.set(paneId, { ...pane, sidebarCollapsed: collapsed });
      return { panes };
    });
  },

  getPane: (paneId) => get().panes.get(paneId),

  getActiveTab: (paneId) => {
    const pane = get().panes.get(paneId);
    if (!pane || pane.tabs.length === 0) return undefined;
    return pane.tabs[pane.activeTabIndex];
  },
}));

/**
 * Wire up the global browser:state-update IPC listener.
 * Called once at app startup (or first use). Routes updates to the correct tab by sessionId.
 */
export function initBrowserShellStoreListener(): () => void {
  const unsub = window.api.browser.onStateUpdate((_event: unknown, data: {
    sessionId: string;
    url?: string;
    title?: string;
    isLoading?: boolean;
    canGoBack?: boolean;
    canGoForward?: boolean;
    favicon?: string;
  }) => {
    useBrowserShellStore.getState().updateTab(data.sessionId, {
      ...(data.url !== undefined && { url: data.url }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.isLoading !== undefined && { isLoading: data.isLoading }),
      ...(data.canGoBack !== undefined && { canGoBack: data.canGoBack }),
      ...(data.canGoForward !== undefined && { canGoForward: data.canGoForward }),
      ...(data.favicon !== undefined && { favicon: data.favicon }),
    });
  });
  return unsub;
}
