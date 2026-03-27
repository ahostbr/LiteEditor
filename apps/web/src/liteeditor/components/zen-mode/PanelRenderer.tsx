import { useRef } from "react";
import { GripHorizontal, X } from "lucide-react";
import { TerminalInstance } from "./TerminalInstance";
import { TerminalHeader } from "./TerminalHeader";
import { ZenMonacoEditor } from "./ZenMonacoEditor";
import { EditorPanelHeader } from "./EditorPanelHeader";
import { ZenUnifiedEditor } from "./ZenUnifiedEditor";
import { BrowserPanel } from "./BrowserPanel";
import { BrowserHeader } from "./BrowserHeader";
import { ClaudePanel } from "./ClaudePanel";
import { ClaudeHeader } from "./ClaudeHeader";
import { CodexPanel } from "./CodexPanel";
import { CodexHeader } from "./CodexHeader";
import { RepositoryView } from "../git/RepositoryView";
import { FileExplorerPane } from "../canvas/FileExplorerPane";
import { SearchPane } from "../canvas/SearchPane";
import { SettingsPane } from "../canvas/SettingsPane";
import ChatView from "../../../components/ChatView";
import { useZenStore, type ZenPanel } from "../../stores/zen-store";
import { cn } from "../../lib/cn";
import type { Terminal } from "@xterm/xterm";

interface PanelRendererProps {
  panel: ZenPanel;
  isActive: boolean;
  onFocus: () => void;
  onTermRef?: (ref: Terminal | null) => void;
  visible?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function PanelRenderer({
  panel,
  isActive,
  onFocus,
  onTermRef,
  visible = true,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: PanelRendererProps) {
  const termRefLocal = useRef<Terminal | null>(null);

  if (panel.type === "terminal" && panel.terminalSessionId) {
    return (
      <>
        <TerminalHeader
          sessionId={panel.terminalSessionId}
          panelId={panel.id}
          title={panel.title}
          isActive={isActive}
          onFocus={onFocus}
          termRef={termRefLocal.current}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <TerminalInstance
            sessionId={panel.terminalSessionId}
            onTermRef={(ref) => {
              termRefLocal.current = ref;
              onTermRef?.(ref);
            }}
          />
        </div>
      </>
    );
  }

  if (panel.type === "editor" && panel.filePath) {
    return (
      <>
        <EditorPanelHeader
          panelId={panel.id}
          filePath={panel.filePath}
          title={panel.title}
          isDirty={panel.isDirty ?? false}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <ZenMonacoEditor filePath={panel.filePath} panelId={panel.id} />
        </div>
      </>
    );
  }

  if (panel.type === "unified-editor") {
    return (
      <>
        <div
          className={cn(
            "flex items-center justify-between px-3 h-[36px] shrink-0 cursor-default overflow-hidden",
            isActive ? "border-t-2" : "border-t-2 border-transparent",
          )}
          style={{
            backgroundColor: "var(--bg-surface)",
            borderTopColor: isActive ? "var(--accent)" : "transparent",
            borderBottom: "1px solid var(--border)",
          }}
          onClick={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <GripHorizontal size={14} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-sm truncate"
              style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              Editor
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              useZenStore.getState().removePanel(panel.id);
            }}
            className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
            title="Close Editor Panel"
          >
            <X size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ZenUnifiedEditor />
        </div>
      </>
    );
  }

  if (panel.type === "browser") {
    return (
      <>
        <BrowserHeader
          panelId={panel.id}
          browserSessionId={panel.browserSessionId}
          title={panel.title}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <BrowserPanel
            panelId={panel.id}
            initialUrl={panel.browserUrl || "https://www.google.com"}
            visible={visible}
          />
        </div>
      </>
    );
  }

  if (panel.type === "claude") {
    return (
      <>
        <ClaudeHeader
          panelId={panel.id}
          title={panel.title}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <ClaudePanel panelId={panel.id} visible={visible} />
        </div>
      </>
    );
  }

  if (panel.type === "codex") {
    return (
      <>
        <CodexHeader
          panelId={panel.id}
          title={panel.title}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <CodexPanel panelId={panel.id} visible={visible} />
        </div>
      </>
    );
  }

  if (panel.type === "chat") {
    return (
      <>
        <ZenPanelHeader
          panel={panel}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ backgroundColor: "var(--bg-base, #0a0a0a)" }}>
          <ChatView threadId={panel.threadId ?? panel.id} />
        </div>
      </>
    );
  }

  if (panel.type === "git") {
    return (
      <>
        <ZenPanelHeader
          panel={panel}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <RepositoryView />
        </div>
      </>
    );
  }

  if (panel.type === "files") {
    return (
      <>
        <ZenPanelHeader
          panel={panel}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <FileExplorerPane />
        </div>
      </>
    );
  }

  if (panel.type === "search") {
    return (
      <>
        <ZenPanelHeader
          panel={panel}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <SearchPane />
        </div>
      </>
    );
  }

  if (panel.type === "settings") {
    return (
      <>
        <ZenPanelHeader
          panel={panel}
          isActive={isActive}
          onFocus={onFocus}
          draggable={draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <SettingsPane />
        </div>
      </>
    );
  }

  return null;
}

/** Generic header for new panel types (chat, git, files, search, settings) */
function ZenPanelHeader({
  panel,
  isActive,
  onFocus,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  panel: ZenPanel;
  isActive: boolean;
  onFocus: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 h-[36px] shrink-0 cursor-default overflow-hidden",
        isActive ? "border-t-2" : "border-t-2 border-transparent",
      )}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTopColor: isActive ? "var(--accent)" : "transparent",
        borderBottom: "1px solid var(--border)",
      }}
      onClick={onFocus}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <GripHorizontal size={14} style={{ color: "var(--text-muted)" }} />
        <span
          className="text-sm truncate"
          style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
        >
          {panel.title}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          useZenStore.getState().removePanel(panel.id);
        }}
        className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
        title={`Close ${panel.title} Panel`}
      >
        <X size={14} style={{ color: "var(--text-muted)" }} />
      </button>
    </div>
  );
}
