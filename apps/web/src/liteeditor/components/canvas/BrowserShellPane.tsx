import { useEffect, useRef, useState, useCallback } from "react";
import { useBrowserShellStore, initBrowserShellStoreListener } from "../../stores/browser-shell-store";
import { useUiStore } from "../../stores/ui-store";
import { useCanvasStore } from "../../stores/canvas-store";
import { nativeBoundsController } from "../../lib/native-bounds-controller";
import { BrowserToolbar } from "./BrowserToolbar";
import { TabSidebar } from "./TabSidebar";

// Wire up the global IPC listener once
let listenerInitialized = false;
function ensureListener() {
  if (listenerInitialized) return;
  listenerInitialized = true;
  initBrowserShellStoreListener();
}

interface BrowserShellPaneProps {
  paneId: string;
  initialUrl?: string;
  /** Restored tabs from persistence (URLs + titles) */
  restoredTabs?: Array<{ url: string; title: string; workspaceColor?: string }>;
  restoredActiveTabIndex?: number;
  restoredSidebarCollapsed?: boolean;
  visible?: boolean;
  isFocused?: boolean;
}

const SIDEBAR_EXPANDED_WIDTH = 200;
const SIDEBAR_COLLAPSED_WIDTH = 48;

const browserDriver = {
  setBounds: (sessionId: string, bounds: Parameters<typeof window.api.browser.setBounds>[1]) =>
    window.api.browser.setBounds(sessionId, bounds),
  showView: (sessionId: string) => window.api.browser.showView(sessionId),
  hideView: (sessionId: string) => window.api.browser.hideView(sessionId),
};

export function BrowserShellPane({
  paneId,
  initialUrl,
  restoredTabs,
  restoredActiveTabIndex = 0,
  restoredSidebarCollapsed = false,
  visible = true,
  isFocused = false,
}: BrowserShellPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);

  const nativeOverlayOpen = useUiStore((s) => s.nativeOverlayOpen);
  const effectiveVisible = visible && !nativeOverlayOpen;

  const initPane = useBrowserShellStore((s) => s.initPane);
  const destroyPane = useBrowserShellStore((s) => s.destroyPane);
  const openTab = useBrowserShellStore((s) => s.openTab);
  const closeTab = useBrowserShellStore((s) => s.closeTab);
  const activateTab = useBrowserShellStore((s) => s.activateTab);
  const setSidebarCollapsed = useBrowserShellStore((s) => s.setSidebarCollapsed);

  const pane = useBrowserShellStore((s) => s.getPane(paneId));
  const activeTab = useBrowserShellStore((s) => s.getActiveTab(paneId));

  const sidebarCollapsed = pane?.sidebarCollapsed ?? restoredSidebarCollapsed;
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  // Initialize global IPC listener
  useEffect(() => {
    ensureListener();
  }, []);

  // Register with NativeBoundsController using active tab's session
  useEffect(() => {
    nativeBoundsController.register(
      paneId,
      "browser",
      activeTab?.sessionId ?? "",
      containerRef,
      browserDriver,
      effectiveVisible && !!activeTab?.sessionId,
    );
    return () => {
      nativeBoundsController.unregister(paneId);
    };
  }, [paneId]);

  // Keep NativeBoundsController session in sync with active tab
  useEffect(() => {
    if (activeTab?.sessionId) {
      nativeBoundsController.updateSessionId(paneId, activeTab.sessionId);
    }
  }, [paneId, activeTab?.sessionId]);

  // Keep NativeBoundsController visibility in sync
  useEffect(() => {
    nativeBoundsController.updateVisibility(paneId, effectiveVisible && !!activeTab?.sessionId);
  }, [paneId, effectiveVisible, activeTab?.sessionId]);

  // Sync tab state to canvas-store via Zustand subscription (not useEffect)
  // This ensures canvas-store is always current even if workspace switch
  // happens before a React effect fires.
  useEffect(() => {
    const unsub = useBrowserShellStore.subscribe((state) => {
      const p = state.panes.get(paneId);
      if (!p) return;
      const activeTab = p.tabs[p.activeTabIndex];
      useCanvasStore.getState().updatePane(paneId, {
        browserShellTabs: p.tabs.map(({ id, url, title, workspaceColor }) => ({
          id,
          url,
          title,
          workspaceColor,
        })),
        browserShellActiveTabIndex: p.activeTabIndex,
        browserShellSidebarCollapsed: p.sidebarCollapsed,
        browserSessionId: activeTab?.sessionId ?? undefined,
      });
    });
    return unsub;
  }, [paneId]);

  // Init pane and open initial tabs on mount
  useEffect(() => {
    initPane(paneId, restoredSidebarCollapsed);

    if (restoredTabs && restoredTabs.length > 0) {
      // Restore saved tabs in order
      (async () => {
        for (const tab of restoredTabs) {
          await openTab(paneId, tab.url, tab.workspaceColor);
        }
        // After opening all, activate the saved active index
        const currentPane = useBrowserShellStore.getState().getPane(paneId);
        if (currentPane && currentPane.tabs.length > restoredActiveTabIndex) {
          const targetTab = currentPane.tabs[restoredActiveTabIndex];
          if (targetTab) {
            activateTab(paneId, targetTab.id);
          }
        }
      })();
    } else {
      // Open initial URL tab
      const url = initialUrl || "https://www.google.com";
      openTab(paneId, url);
    }

    return () => {
      // Destroy all native sessions on unmount
      destroyPane(paneId);
    };
  }, [paneId]);

  // Keyboard shortcuts — only fire when this pane is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;
      const meta = e.metaKey || e.ctrlKey;

      // Cmd+T — new tab
      if (meta && e.key === "t" && !e.shiftKey) {
        e.preventDefault();
        openTab(paneId, "https://www.google.com");
        setToolbarVisible(true);
        return;
      }

      // Cmd+L — show toolbar (URL bar)
      if (meta && e.key === "l") {
        e.preventDefault();
        setToolbarVisible(true);
        return;
      }

      // Cmd+W — close active tab
      if (meta && e.key === "w") {
        e.preventDefault();
        const currentPane = useBrowserShellStore.getState().getPane(paneId);
        if (currentPane && currentPane.tabs.length > 0) {
          const activeTabId = currentPane.tabs[currentPane.activeTabIndex]?.id;
          if (activeTabId) closeTab(paneId, activeTabId);
        }
        return;
      }

      // Cmd+Shift+C — copy current URL
      if (meta && e.shiftKey && e.key === "c") {
        e.preventDefault();
        const tab = useBrowserShellStore.getState().getActiveTab(paneId);
        if (tab?.url) {
          navigator.clipboard.writeText(tab.url).catch(() => {});
        }
        return;
      }

      // Cmd+Shift+E — toggle sidebar
      if (meta && e.shiftKey && e.key === "e") {
        e.preventDefault();
        const currentPane = useBrowserShellStore.getState().getPane(paneId);
        if (currentPane) {
          setSidebarCollapsed(paneId, !currentPane.sidebarCollapsed);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [paneId, isFocused, openTab, closeTab, setSidebarCollapsed]);

  const handleActivateTab = useCallback(
    (tabId: string) => {
      activateTab(paneId, tabId);
    },
    [paneId, activateTab],
  );

  const handleNewTab = useCallback(() => {
    openTab(paneId, "https://www.google.com");
    setToolbarVisible(true);
  }, [paneId, openTab]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      closeTab(paneId, tabId);
    },
    [paneId, closeTab],
  );

  const tabs = pane?.tabs ?? [];
  const activeTabIndex = pane?.activeTabIndex ?? 0;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Toolbar (hidden by default, shown on Cmd+L or Cmd+T) */}
      <BrowserToolbar
        paneId={paneId}
        visible={toolbarVisible}
        onHide={() => setToolbarVisible(false)}
      />

      {/* Main area: sidebar + viewport */}
      <div className="flex flex-1 min-h-0">
        {/* Vertical tab sidebar */}
        <TabSidebar
          paneId={paneId}
          tabs={tabs}
          activeTabIndex={activeTabIndex}
          collapsed={sidebarCollapsed}
          onActivateTab={handleActivateTab}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
          onToggleCollapse={() => setSidebarCollapsed(paneId, !sidebarCollapsed)}
        />

        {/* Browser viewport — native view sits over this div */}
        <div
          ref={containerRef}
          className="flex-1 min-w-0 min-h-0"
          style={{
            // Show a subtle loading state while first tab session initializes
            backgroundColor: "var(--bg-base)",
          }}
        >
          {/* Placeholder shown while session is initializing */}
          {(!activeTab || !activeTab.sessionId) && (
            <div
              className="flex items-center justify-center h-full"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="text-sm">Opening browser...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
