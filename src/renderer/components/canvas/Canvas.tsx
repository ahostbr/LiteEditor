import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useCanvasStore } from '../../stores/canvas-store'
import { useWorkspaceStore } from '../../stores/workspace-store'
import { useCanvasViewport } from './CanvasViewport'
import { CanvasPane } from './CanvasPane'
import { Minimap } from './Minimap'
import { AddPaneMenu } from './AddPaneMenu'
import { useTerminalNotifications } from '../../hooks/useTerminalNotifications'

export function Canvas() {
  const panes = useCanvasStore((s) => s.panes)
  const viewportX = useCanvasStore((s) => s.viewportX)
  const viewportY = useCanvasStore((s) => s.viewportY)
  const zoom = useCanvasStore((s) => s.zoom)
  const focusedPaneId = useCanvasStore((s) => s.focusedPaneId)
  const maximizedPaneId = useCanvasStore((s) => s.maximizedPaneId)
  const setFocusedPane = useCanvasStore((s) => s.setFocusedPane)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const containerRef = useRef<HTMLDivElement>(null)
  const { handleWheel, grabbing } = useCanvasViewport()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  useTerminalNotifications()

  // Active workspace panes (visible)
  const visiblePanes = useMemo(
    () => useCanvasStore.getState().getVisiblePanes(activeWorkspaceId),
    [panes, activeWorkspaceId]
  )
  // Hidden terminal panes from other workspaces (kept mounted for PTY persistence)
  const hiddenTerminalPanes = useMemo(
    () => useCanvasStore.getState().getHiddenTerminalPanes(activeWorkspaceId),
    [panes, activeWorkspaceId]
  )
  const paneArray = visiblePanes

  // Click on empty canvas space deselects focused pane
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasSurface) {
      setFocusedPane(null)
      setContextMenu(null)
    }
  }, [setFocusedPane])

  // Right-click on empty canvas space shows add-pane menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasSurface) {
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY })
    }
  }, [])

  // Auto-create a terminal pane if canvas is empty (delayed to let restore run first)
  useEffect(() => {
    const timer = setTimeout(() => {
      const store = useCanvasStore.getState()
      if (store.panes.size === 0) {
        store.addPane('terminal', { x: 40, y: 40, width: 900, height: 600 })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full overflow-hidden"
      data-canvas-container
      style={{ backgroundColor: 'var(--bg-base)', contain: 'strict' }}
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
          willChange: 'transform'
        }}
      >
        {paneArray.filter((pane) => pane.id !== maximizedPaneId).map((pane) => (
          <CanvasPane
            key={pane.id}
            pane={pane}
            isFocused={pane.id === focusedPaneId}
            viewportX={viewportX}
            viewportY={viewportY}
            containerRef={containerRef}
          />
        ))}
        {/* Hidden terminal panes from inactive workspaces — CSS hidden, PTY stays alive */}
        {hiddenTerminalPanes.map((pane) => (
          <div key={pane.id} style={{ display: 'none' }}>
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

      {/* Maximized pane overlay */}
      {maximizedPaneId && (() => {
        const maxPane = paneArray.find((p) => p.id === maximizedPaneId)
        if (!maxPane) return null
        return (
          <CanvasPane
            key={maxPane.id}
            pane={maxPane}
            isFocused={true}
            viewportX={0}
            viewportY={0}
            containerRef={containerRef}
            maximized
          />
        )
      })()}

      {/* Grab overlay — covers everything including pane content while grabbing */}
      {grabbing && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 9999,
            cursor: 'grabbing',
            backgroundColor: 'transparent'
          }}
        />
      )}

      {/* Empty state */}
      {paneArray.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-sm">Press Ctrl+Shift+N to add a pane</span>
        </div>
      )}

      {/* Zoom indicator — always visible, click to reset */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-0 rounded text-[10px] font-medium"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: zoomPercent === 100 ? 'var(--text-muted)' : 'var(--text-primary)',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <button
          className="px-1.5 py-1 hover:bg-[rgba(255,255,255,0.1)] rounded-l transition-colors"
          onClick={() => {
            const s = useCanvasStore.getState()
            s.setViewport(s.viewportX, s.viewportY, Math.max(0.1, s.zoom - 0.1))
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          className="px-1.5 py-1 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          onClick={() => useCanvasStore.getState().setViewport(
            useCanvasStore.getState().viewportX,
            useCanvasStore.getState().viewportY,
            1
          )}
          title="Reset Zoom"
        >
          {zoomPercent}%
        </button>
        <button
          className="px-1.5 py-1 hover:bg-[rgba(255,255,255,0.1)] rounded-r transition-colors"
          onClick={() => {
            const s = useCanvasStore.getState()
            s.setViewport(s.viewportX, s.viewportY, Math.min(3, s.zoom + 0.1))
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
    </div>
  )
}

export default Canvas
