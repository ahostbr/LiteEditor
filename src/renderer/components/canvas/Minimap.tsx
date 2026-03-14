import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { X } from 'lucide-react'
import { useCanvasStore } from '../../stores/canvas-store'

interface MinimapProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

const MINIMAP_WIDTH = 240
const MINIMAP_HEIGHT = 180
const PADDING = 40

function getPaneTypeColor(type: string): string {
  switch (type) {
    case 'terminal': return '#22c55e'
    case 'editor':
    case 'unified-editor': return '#3b82f6'
    case 'browser': return '#f97316'
    case 'claude': return '#d4a039'
    case 'codex': return '#a855f7'
    default: return '#6b7280'
  }
}

export function Minimap({ containerRef }: MinimapProps) {
  const [visible, setVisible] = useState(false)
  // Subscribe to individual primitives so Zustand detects changes properly
  const panes = useCanvasStore((s) => s.panes)
  const viewportX = useCanvasStore((s) => s.viewportX)
  const viewportY = useCanvasStore((s) => s.viewportY)
  const zoom = useCanvasStore((s) => s.zoom)
  const isDragging = useRef(false)

  // Convert Map to array reactively
  const paneArray = useMemo(() => Array.from(panes.values()), [panes])

  // Toggle via Ctrl+M
  useEffect(() => {
    const handler = () => setVisible((v) => !v)
    window.addEventListener('canvas:toggle-minimap', handler)
    return () => window.removeEventListener('canvas:toggle-minimap', handler)
  }, [])

  if (!visible || paneArray.length === 0) return null

  // Compute bounds from all panes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const pane of paneArray) {
    minX = Math.min(minX, pane.x)
    minY = Math.min(minY, pane.y)
    maxX = Math.max(maxX, pane.x + pane.width)
    maxY = Math.max(maxY, pane.y + pane.height)
  }

  // Add padding around the content area + viewport
  const container = containerRef.current
  const screenW = container?.clientWidth || 800
  const screenH = container?.clientHeight || 600
  // Visible area in canvas space (accounts for zoom)
  const vw = screenW / zoom
  const vh = screenH / zoom

  // Include viewport in the bounds calculation so the viewport rect is always visible
  minX = Math.min(minX, viewportX) - PADDING
  minY = Math.min(minY, viewportY) - PADDING
  maxX = Math.max(maxX, viewportX + vw) + PADDING
  maxY = Math.max(maxY, viewportY + vh) + PADDING

  const totalW = maxX - minX
  const totalH = maxY - minY

  // Scale to fit minimap
  const scale = Math.min(
    (MINIMAP_WIDTH - 16) / totalW,
    (MINIMAP_HEIGHT - 16) / totalH
  )

  const offsetX = 8 // inner padding
  const offsetY = 8

  const handleMinimapClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const localX = e.clientX - rect.left - offsetX
    const localY = e.clientY - rect.top - offsetY
    const canvasX = localX / scale + minX
    const canvasY = localY / scale + minY
    useCanvasStore.getState().scrollTo(canvasX - vw / 2, canvasY - vh / 2)
  }

  const handleViewportDragStart = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.current = true
    const minimapEl = e.currentTarget.closest('[data-minimap]') as HTMLElement
    if (!minimapEl) return

    const handleMove = (ev: PointerEvent) => {
      if (!isDragging.current) return
      const rect = minimapEl.getBoundingClientRect()
      const localX = ev.clientX - rect.left - offsetX
      const localY = ev.clientY - rect.top - offsetY
      const canvasX = localX / scale + minX
      const canvasY = localY / scale + minY
      useCanvasStore.getState().scrollTo(canvasX - vw / 2, canvasY - vh / 2)
    }

    const handleUp = () => {
      isDragging.current = false
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <div
      data-minimap
      className="absolute bottom-4 right-4 rounded-lg border shadow-xl"
      style={{
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
        backgroundColor: 'rgba(12, 12, 18, 0.9)',
        borderColor: 'var(--border)',
        zIndex: 50,
        backdropFilter: 'blur(8px)',
        overflow: 'hidden'
      }}
      onClick={handleMinimapClick}
    >
      {/* Close button */}
      <button
        className="absolute top-1 right-1 z-10 p-0.5 rounded transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onClick={(e) => { e.stopPropagation(); setVisible(false) }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <X size={10} />
      </button>

      {/* Pane rectangles */}
      {paneArray.map((pane) => {
        const rx = offsetX + (pane.x - minX) * scale
        const ry = offsetY + (pane.y - minY) * scale
        const rw = pane.width * scale
        const rh = pane.height * scale
        const isFocused = pane.id === useCanvasStore.getState().focusedPaneId
        return (
          <div
            key={pane.id}
            className="absolute rounded-[2px]"
            style={{
              left: rx,
              top: ry,
              width: Math.max(rw, 6),
              height: Math.max(rh, 6),
              backgroundColor: getPaneTypeColor(pane.type),
              opacity: isFocused ? 0.9 : 0.6,
              border: isFocused ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.15)',
              boxSizing: 'border-box'
            }}
            title={pane.title}
          />
        )
      })}

      {/* Viewport indicator rectangle */}
      <div
        className="absolute rounded-[2px] cursor-move"
        style={{
          left: offsetX + (viewportX - minX) * scale,
          top: offsetY + (viewportY - minY) * scale,
          width: Math.max(vw * scale, 10),
          height: Math.max(vh * scale, 10),
          border: '2px solid rgba(255, 255, 255, 0.7)',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          boxSizing: 'border-box'
        }}
        onPointerDown={handleViewportDragStart}
      />

      {/* Label */}
      <div
        className="absolute bottom-1 left-2 text-[9px] pointer-events-none"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        {paneArray.length} pane{paneArray.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
