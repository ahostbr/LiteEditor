// @ts-nocheck
import { useEffect, useRef } from "react";
import { useTerminalStore } from "../../stores/terminal-store";
import { useCanvasStore, type CanvasPaneState } from "../../stores/canvas-store";
import { useSettingsStore } from "../../stores/settings-store";
import { useEditorStore } from "../../stores/editor-store";
import { TerminalInstance } from "../zen-mode/TerminalInstance";
import { ZenMonacoEditor } from "../zen-mode/ZenMonacoEditor";
import { ZenUnifiedEditor } from "../zen-mode/ZenUnifiedEditor";
import { BrowserShellPane } from "./BrowserShellPane";
import { ClaudePanel } from "../zen-mode/ClaudePanel";
import { CodexPanel } from "../zen-mode/CodexPanel";
import { RepositoryView } from "../git/RepositoryView";
import ChatView from "../../../components/ChatView";
import { FileExplorerPane } from "./FileExplorerPane";
import { SearchPane } from "./SearchPane";
import { SettingsPane } from "./SettingsPane";

interface CanvasPanelRendererProps {
  pane: CanvasPaneState;
  isFocused: boolean;
}

export function CanvasPanelRenderer({ pane, isFocused }: CanvasPanelRendererProps) {
  const maximizedPaneId = useCanvasStore((s) => s.maximizedPaneId);
  const isVisible = !maximizedPaneId || maximizedPaneId === pane.id;
  const sessionCreatedRef = useRef(false);

  // Auto-create terminal session if needed
  useEffect(() => {
    if (pane.type === "terminal" && !pane.terminalSessionId && !sessionCreatedRef.current) {
      sessionCreatedRef.current = true;
      const projectRoot = useEditorStore.getState().projectRoot;
      const configuredCwd = useSettingsStore.getState().defaultTerminalCwd.trim();
      const cwd = configuredCwd || projectRoot || undefined;

      window.api.pty
        .create(undefined, cwd)
        .then((sessionId: string) => {
          useTerminalStore.getState().createSession(sessionId, undefined, cwd);
          useCanvasStore.getState().updatePane(pane.id, {
            terminalSessionId: sessionId,
            terminalSessionIds: [sessionId],
            activeTerminalIndex: 0,
            title: `Terminal`,
          });
        })
        .catch((err: unknown) => {
          console.error("Failed to create terminal for canvas pane:", err);
        });
    }
  }, [pane.id, pane.type, pane.terminalSessionId]);

  if (pane.type === "terminal") {
    if (!pane.terminalSessionId) {
      return (
        <div
          className="flex items-center justify-center h-full"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="text-sm">Starting terminal...</span>
        </div>
      );
    }
    // Render the active terminal session (supports multi-tab)
    const sessions = pane.terminalSessionIds || [pane.terminalSessionId];
    const activeIndex = pane.activeTerminalIndex ?? 0;
    const activeSessionId = sessions[activeIndex] || pane.terminalSessionId;
    return <TerminalInstance sessionId={activeSessionId} />;
  }

  if (pane.type === "editor" && pane.filePath) {
    return <ZenMonacoEditor filePath={pane.filePath} panelId={pane.id} />;
  }

  if (pane.type === "unified-editor") {
    return <ZenUnifiedEditor />;
  }

  if (pane.type === "browser") {
    return (
      <BrowserShellPane
        paneId={pane.id}
        initialUrl={pane.browserUrl || "https://www.google.com"}
        restoredTabs={pane.browserShellTabs?.map(({ url, title, workspaceColor }) => ({ url, title, workspaceColor }))}
        restoredActiveTabIndex={pane.browserShellActiveTabIndex}
        restoredSidebarCollapsed={pane.browserShellSidebarCollapsed}
        visible={isVisible}
        isFocused={isFocused}
      />
    );
  }

  if (pane.type === "claude") {
    return <ClaudePanel panelId={pane.id} visible={isVisible} />;
  }

  if (pane.type === "codex") {
    return <CodexPanel panelId={pane.id} visible={isVisible} />;
  }

  if (pane.type === "git") {
    return <RepositoryView />;
  }

  if (pane.type === "chat") {
    return (
      <div className="flex flex-col h-full min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: "var(--bg-base, #0a0a0a)" }}>
        <ChatView threadId={pane.threadId ?? pane.id} />
      </div>
    );
  }

  if (pane.type === "files") {
    return <FileExplorerPane />;
  }

  if (pane.type === "search") {
    return <SearchPane />;
  }

  if (pane.type === "settings") {
    return <SettingsPane />;
  }

  return null;
}
