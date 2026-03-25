// @ts-nocheck
import { useState, useEffect } from "react";
import {
  Minus,
  Square,
  X,
  Copy,
  Monitor,
  Plus,
  LayoutGrid,
  Layers,
  GripVertical,
  PanelTop,
  AppWindow,
} from "lucide-react";
import { useUiStore } from "../../stores/ui-store";
import { useLayoutStore, type LayoutMode } from "../../stores/layout-store";

const ZEN_LAYOUT_OPTIONS: { mode: LayoutMode; icon: React.ReactNode; label: string }[] = [
  { mode: "grid", icon: <LayoutGrid size={14} />, label: "Grid Layout" },
  { mode: "splitter", icon: <GripVertical size={14} />, label: "Splitter Layout" },
  { mode: "tabs", icon: <PanelTop size={14} />, label: "Tabbed Layout" },
  { mode: "window", icon: <AppWindow size={14} />, label: "Window Layout" },
];

export function UnifiedTitlebar() {
  const appMode = useUiStore((s) => s.appMode);
  const setAppMode = useUiStore((s) => s.setAppMode);
  const zenLayoutMode = useLayoutStore((s) => s.layoutMode);
  const setZenLayoutMode = useLayoutStore((s) => s.setLayoutMode);

  const [isMaximized, setIsMaximized] = useState(false);
  const [isSpanned, setIsSpanned] = useState(false);
  const [displayCount, setDisplayCount] = useState(1);

  const hasWindowApi = typeof window !== "undefined" && !!window.api;

  useEffect(() => {
    if (!hasWindowApi) return;

    window.api.window.isMaximized?.().then(setIsMaximized).catch(() => {});
    window.api.window.getDisplayCount?.().then(setDisplayCount).catch(() => {});
    window.api.window.isSpanned?.().then(setIsSpanned).catch(() => {});

    const unsubMax = window.api.window.onMaximizeChange?.((maximized: boolean) => {
      setIsMaximized(maximized);
    });

    const unsubSpan = window.api.window.onSpanChange?.((spanned: boolean) => {
      setIsSpanned(spanned);
    });

    return () => {
      unsubMax?.();
      unsubSpan?.();
    };
  }, [hasWindowApi]);

  const handleSpanToggle = () => {
    if (!hasWindowApi) return;
    if (isSpanned) {
      window.api.window.restoreSpan();
    } else {
      window.api.window.spanAllMonitors();
    }
  };

  return (
    <div
      className="relative flex h-8 select-none items-center shrink-0"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--color-divider-strong, rgba(255,255,255,0.14))",
        WebkitAppRegion: "drag",
      }}
    >
      {/* Left: App identity */}
      <div
        className="flex items-center gap-2 pl-3 shrink-0"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <img
          src="/liteeditor-icon.png"
          alt="LiteEditor"
          className="h-5 w-5 rounded shrink-0"
        />
        <span
          className="text-[11px] font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          LiteEditor
        </span>
        <span
          className="text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          Alpha
        </span>
      </div>

      {/* Center: Mode toggles + layout options + Add Pane (absolutely centered) */}
      <div
        className="absolute left-1/2 top-0 h-full flex -translate-x-1/2 items-center gap-1.5"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        {/* Canvas / Zen mode toggle */}
        <div
          className="flex items-center gap-px rounded p-px"
          style={{ background: "var(--bg-overlay)" }}
        >
          <button
            className="flex w-[26px] items-center justify-center rounded-sm transition-colors"
            style={{
              height: "22px",
              background: appMode === "canvas" ? "var(--bg-muted)" : "transparent",
              color: appMode === "canvas" ? "var(--accent)" : "var(--text-muted)",
            }}
            onClick={() => setAppMode("canvas")}
            title="Canvas mode"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className="flex w-[26px] items-center justify-center rounded-sm transition-colors"
            style={{
              height: "22px",
              background: appMode === "zen" ? "var(--bg-muted)" : "transparent",
              color: appMode === "zen" ? "var(--accent)" : "var(--text-muted)",
            }}
            onClick={() => setAppMode("zen")}
            title="Zen mode"
          >
            <Layers size={15} />
          </button>
        </div>

        {/* Zen layout mode buttons — only visible in zen mode */}
        {appMode === "zen" && (
          <div
            className="flex items-center gap-px rounded p-px"
            style={{ background: "var(--bg-overlay)" }}
          >
            {ZEN_LAYOUT_OPTIONS.map(({ mode, icon, label }) => (
              <button
                key={mode}
                className="flex w-[26px] items-center justify-center rounded-sm transition-colors"
                style={{
                  height: "22px",
                  background: zenLayoutMode === mode ? "var(--bg-muted)" : "transparent",
                  color: zenLayoutMode === mode ? "var(--accent)" : "var(--text-muted)",
                }}
                onClick={() => setZenLayoutMode(mode)}
                title={label}
              >
                {icon}
              </button>
            ))}
          </div>
        )}

        {/* Add Pane button */}
        {(appMode === "canvas" || appMode === "zen") && (
          <button
            className="flex h-[22px] w-[26px] items-center justify-center rounded-sm transition-colors"
            style={{
              color: "var(--text-muted)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-overlay)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
            onClick={() =>
              window.dispatchEvent(new Event("canvas:add-pane-menu"))
            }
            title="Add pane"
          >
            <Plus size={15} />
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Span + Window controls */}
      <div
        className="flex items-center shrink-0"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        {/* Span button — only when multiple displays and desktop API exists */}
        {hasWindowApi && displayCount > 1 && (
          <>
            <button
              className="flex h-8 w-12 items-center justify-center transition-colors"
              style={{
                color: isSpanned ? "#f59e0b" : "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                if (!isSpanned) e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                if (!isSpanned) e.currentTarget.style.color = "var(--text-muted)";
              }}
              onClick={handleSpanToggle}
              title={isSpanned ? "Restore window" : "Span all monitors"}
            >
              <Monitor size={14} />
            </button>
            <div className="w-px h-4 shrink-0" style={{ background: "var(--border)" }} />
          </>
        )}

        {/* Window controls — only in desktop mode */}
        {hasWindowApi && (
          <>
            <button
              className="flex h-8 w-12 items-center justify-center transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-overlay)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => window.api.window.minimize()}
              title="Minimize"
            >
              <Minus size={16} />
            </button>
            <button
              className="flex h-8 w-12 items-center justify-center transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-overlay)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => window.api.window.maximize()}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Copy size={14} /> : <Square size={14} />}
            </button>
            <button
              className="flex h-8 w-12 items-center justify-center transition-colors hover:bg-red-600/80 hover:text-white"
              style={{ color: "var(--text-muted)" }}
              onClick={() => window.api.window.close()}
              title="Close"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
