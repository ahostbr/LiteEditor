// @ts-nocheck
import React, { Suspense, useEffect } from "react";
import { TabBar } from "./TabBar";
import { EmptyState } from "./EmptyState";
import { useEditorStore } from "../../stores/editor-store";
import { cn } from "../../lib/cn";

// Lazy-load Monaco-dependent components — defers ~500MB until first file is opened
const MonacoEditor = React.lazy(() => import("./MonacoEditor"));
const DiffViewer = React.lazy(() => import("./DiffViewer"));

interface EditorPaneProps {
  paneIndex: number;
}

export function EditorPane({ paneIndex }: EditorPaneProps) {
  const pane = useEditorStore((s) => s.panes[paneIndex]);
  const activePaneIndex = useEditorStore((s) => s.activePaneIndex);
  const setActivePane = useEditorStore((s) => s.setActivePane);

  if (!pane) return null;

  const activeTab = pane.activeTabIndex >= 0 ? pane.tabs[pane.activeTabIndex] : null;
  const isActive = activePaneIndex === paneIndex;

  // Lazy-load content for tabs restored from workspace
  useEffect(() => {
    if (activeTab?.needsLoad && activeTab.path) {
      window.api.fs
        .readFile(activeTab.path)
        .then((content) => {
          useEditorStore.getState().openFile(activeTab.path!, content, paneIndex);
        })
        .catch(() => {
          // File no longer exists — close the tab
          useEditorStore.getState().closeTab(paneIndex, pane.activeTabIndex);
        });
    }
  }, [activeTab?.id, activeTab?.needsLoad]);

  return (
    <div
      className="flex flex-col h-full w-full"
      onClick={() => setActivePane(paneIndex as 0 | 1)}
      style={{
        outline: isActive ? "1px solid var(--accent)" : "none",
        outlineOffset: "-1px",
      }}
    >
      <TabBar paneIndex={paneIndex} />
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
        {!activeTab && <EmptyState />}
        {activeTab?.type === "file" && !activeTab.needsLoad && (
          <Suspense
            fallback={
              <div className="w-full h-full" style={{ backgroundColor: "var(--bg-base)" }} />
            }
          >
            <MonacoEditor
              key={activeTab.id}
              content={activeTab.content || ""}
              path={activeTab.path || `untitled:${activeTab.title}`}
              paneIndex={paneIndex}
              tabIndex={pane.activeTabIndex}
            />
          </Suspense>
        )}
        {activeTab?.needsLoad && (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-base)", color: "var(--text-muted)" }}
          >
            <span className="text-xs">Loading...</span>
          </div>
        )}
        {activeTab?.type === "diff" && activeTab.path && (
          <Suspense
            fallback={
              <div className="w-full h-full" style={{ backgroundColor: "var(--bg-base)" }} />
            }
          >
            <DiffViewer
              key={activeTab.id}
              path={activeTab.path}
              original={activeTab.originalContent || ""}
              modified={activeTab.modifiedContent || ""}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
