import { useEffect, useRef, useCallback, useState } from 'react'
import { useCanvasStore } from '../../stores/canvas-store'
import { useCanvasViewport } from './CanvasViewport'
import { CanvasPane } from './CanvasPane'
import { Minimap } from './Minimap'
import { AddPaneMenu } from './AddPaneMenu'

export function Canvas() {
  const panes = useCanvasStore((s) => s.panes)
  const viewportX = useCanvasStore((s) => s.viewportX)
  const viewportY = useCanvasStore((s) => s.viewportY)
  const zoom = useCanvasStore((s) => s.zoom)
  const focusedPaneId = useCanvasStore((s) => s.focusedPaneId)
  const setFocusedPane = useCanvasStore((s) => s.setFocusedPane)
  const containerRef = useRef<HTMLDivElement>(null)
  const { handleWheel, grabbing } = useCanvasViewport()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const paneArray = Array.from(panes.values())

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

  // Auto-create a terminal pane if canvas is empty
  useEffect(() => {
    const store = useCanvasStore.getState()
    if (store.panes.size === 0) {
      store.addPane('terminal', { x: 40, y: 40, width: 900, height: 600 })
    }
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
        {paneArray.map((pane) => (
          <CanvasPane
            key={pane.id}
            pane={pane}
            isFocused={pane.id === focusedPaneId}
            viewportX={viewportX}
            viewportY={viewportY}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Grab overlay — covers everything including pane content while grabbing */}
      {grabbing && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 9999,
            cursor: 'grabbing',
            // Transparent but captures all pointer events
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

      {/* Zoom indicator */}
      {zoomPercent !== 100 && (
        <div
          className="absolute bottom-4 left-4 px-2 py-1 rounded text-[10px] font-medium pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'var(--text-muted)',
            zIndex: 50
          }}
        >
          {zoomPercent}%
        </div>
      )}

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
