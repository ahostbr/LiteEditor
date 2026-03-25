// @ts-nocheck
import { useEffect, useRef } from "react";
import { useZenStore } from "../../stores/zen-store";
import { useLayoutStore } from "../../stores/layout-store";
import { GridLayout } from "./GridLayout";
import { SplitterLayout } from "./SplitterLayout";
import { WindowLayout } from "./WindowLayout";
import { TabLayout } from "./TabLayout";
import { PanelRenderer } from "./PanelRenderer";
import { isLiteEditorHostManaged, getLiteEditorHostConfig } from "../../hostMode";

export function ZenArea() {
  const panels = useZenStore((s) => s.panels);
  const maximizedPanelId = useZenStore((s) => s.maximizedPanelId);
  const setActivePanel = useZenStore((s) => s.setActivePanel);
  const addTerminalPanel = useZenStore((s) => s.addTerminalPanel);
  const addUnifiedEditorPanel = useZenStore((s) => s.addUnifiedEditorPanel);
  const layoutMode = useLayoutStore((s) => s.layoutMode);
  const initializedRef = useRef(false);

  const addChatPanel = useZenStore((s) => s.addChatPanel);
  const hostManaged = isLiteEditorHostManaged();

  // Auto-create panels on mount
  useEffect(() => {
    if (panels.length === 0) {
      initializedRef.current = true;
      if (hostManaged) {
        // In thread workspace: start with Chat + Terminal
        const config = getLiteEditorHostConfig();
        addChatPanel(config?.threadId);
      } else {
        addUnifiedEditorPanel();
      }
      addTerminalPanel();
    }
  }, []);

  if (panels.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center h-full"
        style={{ backgroundColor: "var(--bg-base)", color: "var(--text-muted)" }}
      >
        <span className="text-sm">Starting terminal...</span>
      </div>
    );
  }

  // Maximized panel takes full area
  if (maximizedPanelId) {
    const maxPanel = panels.find((p) => p.id === maximizedPanelId);
    if (maxPanel) {
      return (
        <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: "var(--bg-base)" }}>
          <PanelRenderer
            panel={maxPanel}
            isActive={true}
            onFocus={() => setActivePanel(maxPanel.id)}
            visible={true}
          />
        </div>
      );
    }
  }

  switch (layoutMode) {
    case "grid":
      return <GridLayout panels={panels} />;
    case "splitter":
      return <SplitterLayout panels={panels} />;
    case "window":
      return <WindowLayout panels={panels} />;
    case "tabs":
      return <TabLayout panels={panels} />;
  }
}

export default ZenArea;
