// @ts-nocheck
import { useState, useRef, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Loader2,
  X,
  FolderOpen,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useBrowserShellStore } from "../../stores/browser-shell-store";
import { useZenStore } from "../../stores/zen-store";
import { useEditorStore } from "../../stores/editor-store";
import { cn } from "../../lib/cn";

interface BrowserHeaderProps {
  panelId: string;
  browserSessionId?: string;
  title: string;
  isActive: boolean;
  onFocus: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function BrowserHeader({
  panelId,
  browserSessionId,
  title,
  isActive,
  onFocus,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: BrowserHeaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const removePanel = useZenStore((s) => s.removePanel);
  const isMaximized = useZenStore((s) => s.maximizedPanelId === panelId);
  const toggleMaximize = useZenStore((s) => s.toggleMaximize);
  const projectRoot = useEditorStore((s) => s.projectRoot);
  const activeTab = useBrowserShellStore((s) => s.getActiveTab(panelId));

  const canGoBack = activeTab?.canGoBack ?? false;
  const canGoForward = activeTab?.canGoForward ?? false;
  const isLoading = activeTab?.isLoading ?? false;
  const currentUrl = activeTab?.url ?? "";

  const displayUrl = isFocused ? urlInput : currentUrl;

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (browserSessionId) window.api.browser.goBack(browserSessionId);
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (browserSessionId) window.api.browser.goForward(browserSessionId);
  };

  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!browserSessionId) return;
    if (isLoading) {
      window.api.browser.stop(browserSessionId);
    } else {
      window.api.browser.reload(browserSessionId);
    }
  };

  const handleUrlSubmit = () => {
    const value = urlInput.trim();
    if (!value || !browserSessionId) return;

    let targetUrl = value;
    // If it looks like a URL (has dots and no spaces), navigate directly
    if (/^[\w-]+(\.[\w-]+)+/.test(value) && !value.includes(" ")) {
      if (!/^https?:\/\//i.test(value)) {
        targetUrl = "https://" + value;
      }
    } else if (!/^https?:\/\//i.test(value) && !/^file:\/\//i.test(value)) {
      // Treat as search query
      targetUrl = "https://www.google.com/search?q=" + encodeURIComponent(value);
    }

    window.api.browser.navigate(browserSessionId, targetUrl);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUrlSubmit();
    }
    if (e.key === "Escape") {
      setUrlInput(currentUrl);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setUrlInput(currentUrl);
    setIsFocused(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 h-[60px] shrink-0 cursor-default overflow-hidden",
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
      {/* Navigation buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className="p-1 rounded hover:bg-[var(--bg-muted)] transition-opacity disabled:opacity-25"
          title="Back"
        >
          <ArrowLeft size={18} style={{ color: "var(--text-muted)" }} />
        </button>
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className="p-1 rounded hover:bg-[var(--bg-muted)] transition-opacity disabled:opacity-25"
          title="Forward"
        >
          <ArrowRight size={18} style={{ color: "var(--text-muted)" }} />
        </button>
        <button
          onClick={handleReload}
          className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
          title={isLoading ? "Stop" : "Reload"}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          ) : (
            <RotateCw size={18} style={{ color: "var(--text-muted)" }} />
          )}
        </button>
      </div>

      {/* URL bar */}
      <input
        ref={inputRef}
        value={displayUrl}
        onChange={(e) => setUrlInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search or enter URL"
        className="flex-1 min-w-0 h-[32px] px-3 rounded text-[13px] outline-none border"
        style={{
          backgroundColor: "var(--bg-overlay)",
          borderColor: isFocused ? "var(--accent)" : "var(--border)",
          color: "var(--text-primary)",
        }}
      />

      {/* Project CWD indicator */}
      {projectRoot && (
        <div
          className="flex items-center gap-1 shrink-0 text-[10px] max-w-[180px]"
          style={{ color: "var(--text-muted)" }}
          title={projectRoot}
        >
          <FolderOpen size={10} className="shrink-0 opacity-60" />
          <span className="truncate font-mono">{projectRoot.split(/[\\/]/).pop()}</span>
        </div>
      )}

      {/* Fullscreen */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMaximize(panelId);
        }}
        className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity shrink-0"
        title={isMaximized ? "Restore" : "Fullscreen"}
      >
        {isMaximized ? (
          <Minimize2 size={18} style={{ color: "var(--text-muted)" }} />
        ) : (
          <Maximize2 size={18} style={{ color: "var(--text-muted)" }} />
        )}
      </button>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removePanel(panelId);
        }}
        className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity shrink-0"
        title="Close"
      >
        <X size={18} style={{ color: "var(--text-muted)" }} />
      </button>
    </div>
  );
}
