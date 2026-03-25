// @ts-nocheck
import React, { useState, useRef, useCallback } from "react";
import { Tab } from "./Tab";
import { ContextMenu, type ContextMenuItem } from "../shared/ContextMenu";
import { useEditorStore } from "../../stores/editor-store";
import { confirmAndSaveTab, confirmAndSaveTabs } from "../../lib/close-helpers";

interface TabBarProps {
  paneIndex: number;
}

export function TabBar({ paneIndex }: TabBarProps) {
  const pane = useEditorStore((s) => s.panes[paneIndex]);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const closeOtherTabs = useEditorStore((s) => s.closeOtherTabs);
  const closeAllTabs = useEditorStore((s) => s.closeAllTabs);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabIndex: number } | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(
    async (tabIndex: number) => {
      if (!pane) return;
      const tab = pane.tabs[tabIndex];
      if (!tab) return;
      if (!(await confirmAndSaveTab(tab))) return;
      closeTab(paneIndex, tabIndex);
    },
    [pane, paneIndex, closeTab],
  );

  const handleCloseOthers = useCallback(
    async (keepIndex: number) => {
      if (!pane) return;
      const toClose = pane.tabs.filter((_, i) => i !== keepIndex);
      if (!(await confirmAndSaveTabs(toClose))) return;
      closeOtherTabs(paneIndex, keepIndex);
    },
    [pane, paneIndex, closeOtherTabs],
  );

  const handleCloseAll = useCallback(async () => {
    if (!pane) return;
    if (!(await confirmAndSaveTabs(pane.tabs))) return;
    closeAllTabs(paneIndex);
  }, [pane, paneIndex, closeAllTabs]);

  if (!pane) return null;

  const handleContextMenu = (e: React.MouseEvent, tabIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, tabIndex });
  };

  const handleBarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabIndex: -1 });
  };

  const contextItems: ContextMenuItem[] = contextMenu
    ? contextMenu.tabIndex >= 0
      ? [
          { label: "Close", onClick: () => handleClose(contextMenu.tabIndex) },
          { label: "Close Others", onClick: () => handleCloseOthers(contextMenu.tabIndex) },
          { label: "Close All", onClick: () => handleCloseAll() },
        ]
      : [{ label: "New File", onClick: () => useEditorStore.getState().newFile() }]
    : [];

  return (
    <>
      <div
        ref={scrollRef}
        className="flex items-center h-[var(--tab-height)] overflow-x-auto shrink-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          scrollbarWidth: "none",
        }}
        onContextMenu={handleBarContextMenu}
      >
        {pane.tabs.map((tab, i) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={i === pane.activeTabIndex}
            onClick={() => setActiveTab(paneIndex, i)}
            onClose={() => handleClose(i)}
            onContextMenu={(e) => handleContextMenu(e, i)}
          />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
