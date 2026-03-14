import { useRef, useCallback, useState } from 'react'
import { useCanvasStore, type CanvasPaneState } from '../../stores/canvas-store'
import { PaneHeader } from './PaneHeader'
import { CanvasPanelRenderer } from './CanvasPanelRenderer'
import { cn } from '../../lib/cn'

interface CanvasPaneProps {
  pane: CanvasPaneState
  isFocused: boolean
  viewportX: number
  viewportY: number
  containerRef: React.RefObject<HTMLDivElement | null>
}

const MIN_WIDTH = 300
const MIN_HEIGHT = 200

export function CanvasPane({ pane, isFocused, viewportX, viewportY, containerRef }: CanvasPaneProps) {
  const setFocusedPane = useCanvasStore((s) => s.setFocusedPane)
  const movePane = useCanvasStore((s) => s.movePane)
  const resizePane = useCanvasStore((s) => s.resizePane)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, paneX: 0, paneY: 0 })
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const handleFocus = useCallback(() => {
    setFocusedPane(pane.id)
  }, [pane.id, setFocusedPane])

  // --- Drag to move (accounts for zoom) ---
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setFocusedPane(pane.id)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      paneX: pane.x,
      paneY: pane.y
    }

    const handleMove = (ev: PointerEvent) => {
      const zoom = useCanvasStore.getState().zoom
      const dx = (ev.clientX - dragStartRef.current.x) / zoom
      const dy = (ev.clientY - dragStartRef.current.y) / zoom
      movePane(pane.id, dragStartRef.current.paneX + dx, dragStartRef.current.paneY + dy)
    }

    const handleUp = () => {
      setIsDragging(false)
      // Snap to grid (20px)
      const state = useCanvasStore.getState()
      const p = state.panes.get(pane.id)
      if (p) {
        const snappedX = Math.round(p.x / 20) * 20
        const snappedY = Math.round(p.y / 20) * 20
        movePane(pane.id, snappedX, snappedY)
      }
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [pane.id, pane.x, pane.y, movePane, setFocusedPane])

  // --- Resize (accounts for zoom) ---
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: pane.width,
      height: pane.height
    }

    const handleMove = (ev: PointerEvent) => {
      const zoom = useCanvasStore.getState().zoom
      const dx = (ev.clientX - resizeStartRef.current.x) / zoom
      const dy = (ev.clientY - resizeStartRef.current.y) / zoom
      resizePane(
        pane.id,
        Math.max(MIN_WIDTH, resizeStartRef.current.width + dx),
        Math.max(MIN_HEIGHT, resizeStartRef.current.height + dy)
      )
    }

    const handleUp = () => {
      setIsResizing(false)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }, [pane.id, pane.width, pane.height, resizePane])

  if (pane.minimized) {
    return (
      <div
        className="absolute"
        style={{
          left: pane.x,
          top: pane.y,
          width: pane.width,
          height: 36
        }}
      >
        <PaneHeader
          pane={pane}
          isFocused={isFocused}
          onDragStart={handleDragStart}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'absolute flex flex-col rounded-lg overflow-hidden shadow-lg transition-shadow',
        isFocused && 'ring-2',
        isDragging && 'opacity-90 cursor-grabbing',
        pane.hasNotification && !isFocused && 'animate-pulse'
      )}
      style={{
        left: pane.x,
        top: pane.y,
        width: pane.width,
        height: pane.height,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        ringColor: isFocused ? 'var(--accent)' : undefined,
        boxShadow: pane.hasNotification && !isFocused
          ? '0 0 12px 2px var(--accent)'
          : undefined,
        zIndex: isFocused ? 10 : 1
      }}
      onClick={handleFocus}
    >
      {/* Pane header with drag handle */}
      <PaneHeader
        pane={pane}
        isFocused={isFocused}
        onDragStart={handleDragStart}
      />

      {/* Pane content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CanvasPanelRenderer pane={pane} isFocused={isFocused} />
      </div>

      {/* Resize handle (bottom-right corner) */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onPointerDown={handleResizeStart}
        style={{ zIndex: 20 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="absolute bottom-0 right-0"
          style={{ color: 'var(--text-muted)', opacity: 0.4 }}
        >
          <path d="M14 14L6 14M14 14L14 6M14 14L10 14M14 10L14 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </div>
  )
}
