import { useRepositoryStore } from "../../stores/repository-store";
import { useCanvasStore } from "../../stores/canvas-store";
import { useUiStore } from "../../stores/ui-store";

export function StatusBar() {
  const currentBranch = useRepositoryStore((s) => s.currentBranch);
  const focusedPaneId = useCanvasStore((s) => s.focusedPaneId);
  const panes = useCanvasStore((s) => s.panes);
  const appMode = useUiStore((s) => s.appMode);

  const focusedPane = focusedPaneId ? panes.get(focusedPaneId) : null;
  const paneCount = panes.size;

  return (
    <div
      className="flex h-7 select-none items-center justify-between px-3"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--color-divider-strong, rgba(255,255,255,0.14))",
        color: "var(--text-muted)",
        fontSize: "11px",
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Status dot */}
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-ok, #4a8c5e)" }} />
          <span>Ready</span>
        </div>

        {/* Git branch */}
        {currentBranch && (
          <div
            className="flex items-center gap-1"
            style={{ color: "var(--text-secondary)" }}
          >
            <span style={{ fontSize: "12px" }}>⌇</span>
            <span>{currentBranch}</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Focused pane title */}
        {focusedPane && (
          <span
            className="max-w-[200px] truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {focusedPane.title}
          </span>
        )}

        {/* Pane count */}
        <span>
          {paneCount} {paneCount === 1 ? "pane" : "panes"}
        </span>

        {/* App mode */}
        <span
          className="capitalize"
          style={{ color: "var(--text-secondary)" }}
        >
          {appMode}
        </span>

        {/* Version */}
        <span style={{ color: "var(--text-muted)" }}>v0.1</span>
      </div>
    </div>
  );
}
