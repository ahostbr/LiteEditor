// @ts-nocheck
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useCanvasStore } from "../../stores/canvas-store";
import { useWorkspaceStore } from "../../stores/workspace-store";
import { useCanvasViewport } from "./CanvasViewport";
import { CanvasPane } from "./CanvasPane";
import { Minimap } from "./Minimap";
import { AddPaneMenu } from "./AddPaneMenu";
import { useTerminalNotifications } from "../../hooks/useTerminalNotifications";
import { TemplateManager } from "./TemplateManager";
import { useTemplateStore } from "../../stores/template-store";

export function Canvas() {
  const panes = useCanvasStore((s) => s.panes);
  const viewportX = useCanvasStore((s) => s.viewportX);
  const viewportY = useCanvasStore((s) => s.viewportY);
  const zoom = useCanvasStore((s) => s.zoom);
  const focusedPaneId = useCanvasStore((s) => s.focusedPaneId);
  const maximizedPaneId = useCanvasStore((s) => s.maximizedPaneId);
  const setFocusedPane = useCanvasStore((s) => s.setFocusedPane);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleWheel, grabbing } = useCanvasViewport();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  useTerminalNotifications();

  // Active workspace panes (visible)
  const visiblePanes = useMemo(
    () => useCanvasStore.getState().getVisiblePanes(activeWorkspaceId),
    [panes, activeWorkspaceId],
  );
  // Hidden terminal panes from other workspaces (kept mounted for PTY persistence)
  const hiddenTerminalPanes = useMemo(
    () => useCanvasStore.getState().getHiddenTerminalPanes(activeWorkspaceId),
    [panes, activeWorkspaceId],
  );
  const paneArray = visiblePanes;

  // Click on empty canvas space deselects focused pane
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasSurface) {
        setFocusedPane(null);
        setContextMenu(null);
      }
    },
    [setFocusedPane],
  );

  // Right-click on empty canvas space shows add-pane menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasSurface) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Auto-create a terminal pane if canvas is empty (delayed to let restore run first)
  useEffect(() => {
    const timer = setTimeout(() => {
      const store = useCanvasStore.getState();
      if (store.panes.size === 0) {
        store.addPane("terminal", { x: 40, y: 40, width: 900, height: 600 });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full overflow-hidden"
      data-canvas-container
      style={{ backgroundColor: "var(--bg-base)", contain: "strict" }}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
    >
      {/* Canvas surface with CSS transform for panning + zooming */}
      <div
        data-canvas-surface="true"
        className="absolute origin-top-left"
        style={{
          width: 0,
          height: 0,
          transform: `scale(${zoom}) translate3d(${-viewportX}px, ${-viewportY}px, 0)`,
          willChange: "transform",
        }}
      >
        {paneArray.map((pane) => (
          <CanvasPane
            key={pane.id}
            pane={pane}
            isFocused={maximizedPaneId ? pane.id === maximizedPaneId : pane.id === focusedPaneId}
            viewportX={viewportX}
            viewportY={viewportY}
            containerRef={containerRef}
            maximized={pane.id === maximizedPaneId}
          />
        ))}
        {/* Hidden terminal panes from inactive workspaces — CSS hidden, PTY stays alive */}
        {hiddenTerminalPanes.map((pane) => (
          <div key={pane.id} style={{ display: "none" }}>
            <CanvasPane
              pane={pane}
              isFocused={false}
              viewportX={viewportX}
              viewportY={viewportY}
              containerRef={containerRef}
            />
          </div>
        ))}
      </div>

      {/* Grab overlay — covers everything including pane content while grabbing */}
      {grabbing && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 9999,
            cursor: "grabbing",
            backgroundColor: "transparent",
          }}
        />
      )}

      {/* Empty state — template picker */}
      {paneArray.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: "var(--text-muted)" }}
        >
          <TemplatePicker />
        </div>
      )}

      {/* Zoom indicator — always visible, click to reset */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-0 rounded text-[10px] font-medium"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: zoomPercent === 100 ? "var(--text-muted)" : "var(--text-primary)",
          zIndex: 50,
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          className="px-1.5 py-1 hover:bg-[rgba(255,255,255,0.1)] rounded-l transition-colors"
          onClick={() => {
            const s = useCanvasStore.getState();
            s.setViewport(s.viewportX, s.viewportY, Math.max(0.1, s.zoom - 0.1));
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          className="px-1.5 py-1 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          onClick={() =>
            useCanvasStore
              .getState()
              .setViewport(
                useCanvasStore.getState().viewportX,
                useCanvasStore.getState().viewportY,
                1,
              )
          }
          title="Reset Zoom"
        >
          {zoomPercent}%
        </button>
        <button
          className="px-1.5 py-1 hover:bg-[rgba(255,255,255,0.1)] rounded-r transition-colors"
          onClick={() => {
            const s = useCanvasStore.getState();
            s.setViewport(s.viewportX, s.viewportY, Math.min(3, s.zoom + 0.1));
          }}
          title="Zoom In"
        >
          +
        </button>
      </div>

      {/* Minimap overlay */}
      <Minimap containerRef={containerRef} />

      {/* Right-click context menu */}
      {contextMenu && (
        <AddPaneMenu
          show={true}
          anchorX={contextMenu.x}
          anchorY={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Template manager overlay */}
      <TemplateManager />
    </div>
  );
}

function TemplatePreview({ panes }: { panes: Array<{ type: string; x: number; y: number; width: number; height: number }> }) {
  const previewW = 180;
  const previewH = 60;

  if (panes.length === 0) return null;

  // Find bounds
  const minX = Math.min(...panes.map(p => p.x));
  const minY = Math.min(...panes.map(p => p.y));
  const maxX = Math.max(...panes.map(p => p.x + p.width));
  const maxY = Math.max(...panes.map(p => p.y + p.height));
  const totalW = maxX - minX || 1;
  const totalH = maxY - minY || 1;

  // Map pane type to color
  const typeColor = (type: string) => {
    switch (type) {
      case "chat": return "var(--accent)";
      case "terminal": return "var(--text-muted)";
      case "unified-editor": return "var(--info, #7ca8cf)";
      case "browser": return "var(--success, #4a8c5e)";
      case "git": return "var(--warning, #c9a24d)";
      case "files": return "var(--text-secondary)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div className="relative" style={{ width: previewW, height: previewH }}>
      {panes.map((pane, i) => {
        const x = ((pane.x - minX) / totalW) * previewW;
        const y = ((pane.y - minY) / totalH) * previewH;
        const w = (pane.width / totalW) * previewW;
        const h = (pane.height / totalH) * previewH;
        return (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: x + 1,
              top: y + 1,
              width: Math.max(w - 2, 8),
              height: Math.max(h - 2, 8),
              backgroundColor: typeColor(pane.type),
              opacity: 0.6,
            }}
          />
        );
      })}
    </div>
  );
}

function TemplatePicker() {
  const templates = useTemplateStore((s) => s.templates);

  const applyTemplate = (template: (typeof templates)[0]) => {
    const store = useCanvasStore.getState();
    store.clearPanes();
    for (const pane of template.panes) {
      store.addPane(pane.type, {
        x: pane.x,
        y: pane.y,
        width: pane.width,
        height: pane.height,
        title: pane.title,
      });
    }
    store.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Heading — use display font (Instrument Serif) */}
      <div style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}>
        <h2 className="text-2xl" style={{ color: "var(--text-primary)" }}>
          What will you build today?
        </h2>
      </div>

      {/* Template grid — 2x2 cards with spatial preview diagrams */}
      <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 520 }}>
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => applyTemplate(template)}
            className="group relative flex flex-col rounded-xl border p-4 transition-all duration-200"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-muted)",
              minHeight: 120,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 16px var(--accent-dim, rgba(201,162,77,0.2))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Spatial preview — simplified block diagram */}
            <div className="flex-1 flex items-center justify-center mb-3">
              <TemplatePreview panes={template.panes} />
            </div>
            {/* Name + description */}
            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              {template.name}
            </span>
            <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {template.description}
            </span>
          </button>
        ))}
      </div>

      {/* Hint */}
      <div className="text-[10px]" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
        or press Ctrl+Shift+N to add a pane
      </div>
    </div>
  );
}

export default Canvas;
