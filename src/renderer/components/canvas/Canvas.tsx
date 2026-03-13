import { useEffect, useRef, useCallback } from 'react'
import { useCanvasStore, type CanvasPaneType } from '../../stores/canvas-store'
import { useCanvasViewport } from './CanvasViewport'
import { CanvasPane } from './CanvasPane'
import { AddPaneMenu } from './AddPaneMenu'
import { Minimap } from './Minimap'

export function Canvas() {
  const panes = useCanvasStore((s) => s.panes)
  const viewportX = useCanvasStore((s) => s.viewportX)
  const viewportY = useCanvasStore((s) => s.viewportY)
  const focusedPaneId = useCanvasStore((s) => s.focusedPaneId)
  const setFocusedPane = useCanvasStore((s) => s.setFocusedPane)
  const containerRef = useRef<HTMLDivElement>(null)
  const { handleWheel } = useCanvasViewport()

  const paneArray = Array.from(panes.values())

  // Click on empty canvas space deselects focused pane
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasSurface) {
      setFocusedPane(null)
    }
  }, [setFocusedPane])

  // Auto-create a terminal pane if canvas is empty
  useEffect(() => {
    if (panes.size === 0) {
      const store = useCanvasStore.getState()
      store.addPane('terminal', { x: 0, y: 0, width: 900, height: 600 })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
    >
      {/* Canvas surface with CSS transform for panning */}
      <div
        data-canvas-surface="true"
        className="absolute"
        style={{
          transform: `translate3d(${-viewportX}px, ${-viewportY}px, 0)`,
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

      {/* Empty state */}
      {paneArray.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-sm">Press Ctrl+Shift+N to add a pane</span>
        </div>
      )}

      {/* Minimap overlay */}
      <Minimap containerRef={containerRef} />
    </div>
  )
}

export default Canvas
