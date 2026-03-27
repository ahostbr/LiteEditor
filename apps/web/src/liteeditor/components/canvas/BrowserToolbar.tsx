import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Loader2, X } from "lucide-react";
import { useBrowserShellStore } from "../../stores/browser-shell-store";

interface BrowserToolbarProps {
  paneId: string;
  /** Controlled visibility — toolbar is hidden by default, shown via Cmd+L or parent */
  visible: boolean;
  onHide: () => void;
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  // If it looks like a domain (no spaces, contains a dot), prepend https://
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed) && !trimmed.includes(" ")) {
    if (!/^https?:\/\//i.test(trimmed)) return "https://" + trimmed;
    return trimmed;
  }
  // Otherwise treat as a search query
  if (!/^https?:\/\//i.test(trimmed) && !/^file:\/\//i.test(trimmed)) {
    return "https://www.google.com/search?q=" + encodeURIComponent(trimmed);
  }
  return trimmed;
}

export function BrowserToolbar({ paneId, visible, onHide }: BrowserToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const activeTab = useBrowserShellStore((s) => s.getActiveTab(paneId));
  const currentUrl = activeTab?.url ?? "";
  const canGoBack = activeTab?.canGoBack ?? false;
  const canGoForward = activeTab?.canGoForward ?? false;
  const isLoading = activeTab?.isLoading ?? false;
  const sessionId = activeTab?.sessionId;

  // When toolbar becomes visible, focus and select all
  useEffect(() => {
    if (visible) {
      setInputValue(currentUrl);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [visible]);

  // Keep input in sync with current URL when not focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(currentUrl);
    }
  }, [currentUrl, isFocused]);

  const handleSubmit = () => {
    const url = normalizeUrl(inputValue);
    if (!url || !sessionId) return;
    window.api.browser.navigate(sessionId, url);
    inputRef.current?.blur();
    onHide();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setInputValue(currentUrl);
      inputRef.current?.blur();
      onHide();
    }
  };

  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-1 px-2 h-[38px] shrink-0"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Back */}
      <button
        onClick={() => sessionId && window.api.browser.goBack(sessionId)}
        disabled={!canGoBack}
        className="p-1 rounded hover:bg-[var(--bg-muted)] disabled:opacity-25 transition-opacity"
        title="Back"
      >
        <ArrowLeft size={14} style={{ color: "var(--text-muted)" }} />
      </button>

      {/* Forward */}
      <button
        onClick={() => sessionId && window.api.browser.goForward(sessionId)}
        disabled={!canGoForward}
        className="p-1 rounded hover:bg-[var(--bg-muted)] disabled:opacity-25 transition-opacity"
        title="Forward"
      >
        <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
      </button>

      {/* Reload / Stop */}
      <button
        onClick={() => {
          if (!sessionId) return;
          isLoading
            ? window.api.browser.stop(sessionId)
            : window.api.browser.reload(sessionId);
        }}
        className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-60 hover:opacity-100 transition-opacity"
        title={isLoading ? "Stop" : "Reload"}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        ) : (
          <RotateCw size={14} style={{ color: "var(--text-muted)" }} />
        )}
      </button>

      {/* URL input */}
      <input
        ref={inputRef}
        value={isFocused ? inputValue : currentUrl}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setInputValue(currentUrl);
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        placeholder="Search or enter URL"
        className="flex-1 min-w-0 h-[26px] px-2 rounded text-[12px] outline-none border"
        style={{
          backgroundColor: "var(--bg-overlay)",
          borderColor: isFocused ? "var(--accent)" : "var(--border)",
          color: "var(--text-primary)",
        }}
      />

      {/* Close toolbar button */}
      <button
        onClick={onHide}
        className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-60 hover:opacity-100 transition-opacity"
        title="Hide toolbar (Escape)"
      >
        <X size={14} style={{ color: "var(--text-muted)" }} />
      </button>
    </div>
  );
}
