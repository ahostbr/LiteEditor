// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useEditorStore } from "../../stores/editor-store";

/** Access Monaco lazily — only available after first file is opened. */
function getMonaco(): typeof import("monaco-editor") | null {
  return (window as any).__monaco ?? null;
}

export function CommandCenter() {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [matchInfo, setMatchInfo] = useState<{ current: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const decorationsRef = useRef<any>(null);
  const activeTab = useEditorStore((s) => {
    const pane = s.panes[s.activePaneIndex];
    if (!pane || pane.activeTabIndex < 0) return null;
    return pane.tabs[pane.activeTabIndex] ?? null;
  });

  const getActiveEditor = useCallback((): any | null => {
    const monaco = getMonaco();
    if (!monaco) return null;
    const editors = monaco.editor.getEditors();
    for (let i = editors.length - 1; i >= 0; i--) {
      if (editors[i].hasTextFocus() || editors[i].getModel()) {
        return editors[i];
      }
    }
    return editors[0] ?? null;
  }, []);

  const clearDecorations = useCallback(() => {
    decorationsRef.current?.clear();
    decorationsRef.current = null;
  }, []);

  const doSearch = useCallback(
    (searchQuery: string) => {
      const editor = getActiveEditor();
      const monaco = getMonaco();
      if (!editor || !monaco || !searchQuery) {
        clearDecorations();
        setMatchInfo(null);
        return;
      }

      const model = editor.getModel();
      if (!model) return;

      const matches = model.findMatches(searchQuery, true, false, false, null, true);
      setMatchInfo(
        matches.length > 0 ? { current: 1, total: matches.length } : { current: 0, total: 0 },
      );

      // Highlight all matches
      const decorations = matches.map((m: any) => ({
        range: m.range,
        options: {
          className: "findMatch",
          overviewRuler: { color: "#d4a03980", position: monaco.editor.OverviewRulerLane.Center },
        },
      }));

      clearDecorations();
      decorationsRef.current = editor.createDecorationsCollection(decorations);

      // Jump to first match
      if (matches.length > 0) {
        editor.setSelection(matches[0].range);
        editor.revealRangeInCenter(matches[0].range);
      }
    },
    [getActiveEditor, clearDecorations],
  );

  const goToMatch = useCallback(
    (direction: 1 | -1) => {
      const editor = getActiveEditor();
      if (!editor || !matchInfo || matchInfo.total === 0) return;

      const model = editor.getModel();
      if (!model) return;

      const matches = model.findMatches(query, true, false, false, null, true);
      if (matches.length === 0) return;

      const next = (matchInfo.current - 1 + direction + matches.length) % matches.length;
      setMatchInfo({ current: next + 1, total: matches.length });
      editor.setSelection(matches[next].range);
      editor.revealRangeInCenter(matches[next].range);
    },
    [getActiveEditor, matchInfo, query],
  );

  const openSearch = useCallback(() => {
    if (!activeTab || activeTab.type !== "file") return;
    setIsSearching(true);
    setQuery("");
    setMatchInfo(null);
  }, [activeTab]);

  const closeSearch = useCallback(() => {
    setIsSearching(false);
    setQuery("");
    setMatchInfo(null);
    clearDecorations();
  }, [clearDecorations]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearching) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isSearching]);

  // Clean up decorations on unmount
  useEffect(() => () => clearDecorations(), [clearDecorations]);

  const fileName = activeTab?.title || "";

  if (isSearching) {
    return (
      <div
        className="flex items-center gap-2 px-3"
        style={
          {
            border: "1px solid var(--accent)",
            borderRadius: "6px",
            height: "22px",
            width: "38vw",
            maxWidth: "600px",
            background: "var(--bg-overlay)",
            WebkitAppRegion: "no-drag",
          } as React.CSSProperties
        }
      >
        <Search size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            doSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              closeSearch();
            } else if (e.key === "Enter") {
              e.preventDefault();
              goToMatch(e.shiftKey ? -1 : 1);
            }
          }}
          placeholder={`Search in ${fileName}...`}
          className="flex-1 bg-transparent border-none outline-none text-[12px] min-w-0"
          style={{ color: "var(--text-primary)" }}
          spellCheck={false}
        />
        {matchInfo && query && (
          <span
            className="text-[10px] shrink-0"
            style={{ color: matchInfo.total > 0 ? "var(--text-muted)" : "var(--error)" }}
          >
            {matchInfo.total > 0 ? `${matchInfo.current}/${matchInfo.total}` : "No results"}
          </span>
        )}
        <button
          onClick={closeSearch}
          className="flex items-center justify-center shrink-0 rounded-sm hover:bg-[var(--bg-muted)] transition-colors"
          style={{ color: "var(--text-muted)" }}
          title="Close Search (Escape)"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      className="flex items-center gap-2 px-3 transition-colors cursor-default"
      style={
        {
          border: "1px solid var(--border)",
          borderRadius: "6px",
          height: "22px",
          width: "38vw",
          maxWidth: "600px",
          color: "var(--text-secondary)",
          background: "transparent",
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-overlay)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      onClick={openSearch}
    >
      <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      <span className="text-[12px] truncate">
        {activeTab ? `Search in ${fileName}` : "LiteEditor"}
      </span>
    </button>
  );
}
