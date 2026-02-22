import { useCallback, useRef, useEffect, useState } from 'react'
import { PanelRenderer } from './PanelRenderer'
import { useZenStore, type ZenPanel } from '../../stores/zen-store'
import { useLayoutStore } from '../../stores/layout-store'

type DropZone = 'top' | 'bottom' | 'left' | 'right' | 'center' | null

interface WindowLayoutProps {
  panels: ZenPanel[]
}

export function WindowLayout({ panels }: WindowLayoutProps) {
  const activePanelId = useZenStore((s) => s.activePanelId)
  const setActivePanel = useZenStore((s) => s.setActivePanel)
  const windowStates = useLayoutStore((s) => s.windowStates)
  const updateWindowState = useLayoutStore((s) => s.updateWindowState)
  const bringToFront = useLayoutStore((s) => s.bringToFront)
  const initWindowState = useLayoutStore((s) => s.initWindowState)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeDropZone, setActiveDropZone] = useState<DropZone>(null)
  const draggingIdRef = useRef<string | null>(null)

  // Initialize window states for new panels
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    panels.forEach((panel, index) => {
      if (!windowStates[panel.id]) {
        initWindowState(panel.id, rect.width, rect.height, index)
      }
    })
  }, [panels, windowStates, initWindowState])

  const detectDropZone = useCallback((clientX: number, clientY: number): DropZone => {
    const container = containerRef.current
    if (!container) return null
    const rect = container.getBoundingClientRect()
    const relX = (clientX - rect.left) / rect.width
    const relY = (clientY - rect.top) / rect.height
    const edgeThreshold = 0.12

    if (relY < edgeThreshold) return 'top'
    if (relY > 1 - edgeThreshold) return 'bottom'
    if (relX < edgeThreshold) return 'left'
    if (relX > 1 - edgeThreshold) return 'right'
    if (relX > 0.35 && relX < 0.65 && relY > 0.35 && relY < 0.65) return 'center'
    return null
  }, [])

  const applyDropZone = useCallback((panelId: string, zone: DropZone) => {
    const container = containerRef.current
    if (!container || !zone) return
    const rect = container.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    const snaps: Record<string, { x: number; y: number; width: number; height: number }> = {
      top: { x: 0, y: 0, width: w, height: h / 2 },
      bottom: { x: 0, y: h / 2, width: w, height: h / 2 },
      left: { x: 0, y: 0, width: w / 2, height: h },
      right: { x: w / 2, y: 0, width: w / 2, height: h },
      center: { x: 0, y: 0, width: w, height: h }
    }

    const snap = snaps[zone]
    if (snap) {
      updateWindowState(panelId, snap)
    }
  }, [updateWindowState])

  const handleWindowMouseDown = useCallback((e: React.MouseEvent, panelId: string) => {
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    e.preventDefault()
    bringToFront(panelId)
    setActivePanel(panelId)
    draggingIdRef.current = panelId

    const ws = windowStates[panelId]
    if (!ws) return

    const startX = e.clientX
    const startY = e.clientY
    const startWX = ws.x
    const startWY = ws.y

    setIsDragging(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      updateWindowState(panelId, { x: startWX + dx, y: startWY + dy })

      const zone = detectDropZone(moveEvent.clientX, moveEvent.clientY)
      setActiveDropZone(zone)
    }

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setIsDragging(false)

      const zone = detectDropZone(upEvent.clientX, upEvent.clientY)
      if (zone) {
        applyDropZone(panelId, zone)
      }
      setActiveDropZone(null)
      draggingIdRef.current = null
    }

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [windowStates, bringToFront, setActivePanel, updateWindowState, detectDropZone, applyDropZone])

  const handleResizeMouseDown = useCallback((
    e: React.MouseEvent,
    panelId: string,
    direction: 'e' | 's' | 'se'
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const ws = windowStates[panelId]
    if (!ws) return

    const startX = e.clientX
    const startY = e.clientY
    const startW = ws.width
    const startH = ws.height

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      const updates: Partial<typeof ws> = {}

      if (direction === 'e' || direction === 'se') {
        updates.width = Math.max(200, startW + dx)
      }
      if (direction === 's' || direction === 'se') {
        updates.height = Math.max(150, startH + dy)
      }

      updateWindowState(panelId, updates)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    const cursorMap = { e: 'ew-resize', s: 'ns-resize', se: 'nwse-resize' }
    document.body.style.cursor = cursorMap[direction]
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [windowStates, updateWindowState])

  return (
    <div ref={containerRef} className="relative flex-1 h-full overflow-hidden"
         style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Drop zone overlays */}
      {isDragging && (
        <>
          <DropZoneIndicator zone="top" active={activeDropZone === 'top'} />
          <DropZoneIndicator zone="bottom" active={activeDropZone === 'bottom'} />
          <DropZoneIndicator zone="left" active={activeDropZone === 'left'} />
          <DropZoneIndicator zone="right" active={activeDropZone === 'right'} />
          <DropZoneIndicator zone="center" active={activeDropZone === 'center'} />
        </>
      )}

      {panels.map((panel) => {
        const ws = windowStates[panel.id]
        if (!ws) return null

        return (
          <div
            key={panel.id}
            className="absolute flex flex-col rounded-sm overflow-hidden"
            style={{
              left: ws.x,
              top: ws.y,
              width: ws.width,
              height: ws.height,
              zIndex: ws.zIndex,
              border: panel.id === activePanelId
                ? '1px solid var(--accent)'
                : '1px solid var(--border)'
            }}
            onMouseDown={() => {
              bringToFront(panel.id)
              setActivePanel(panel.id)
            }}
          >
            <div onMouseDown={(e) => handleWindowMouseDown(e, panel.id)}>
              <PanelRenderer
                panel={panel}
                isActive={panel.id === activePanelId}
                onFocus={() => setActivePanel(panel.id)}
              />
            </div>

            {/* Resize handles */}
            <div
              className="absolute right-0 top-0 bottom-0 w-[4px] cursor-ew-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, panel.id, 'e')}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-[4px] cursor-ns-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, panel.id, 's')}
            />
            <div
              className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, panel.id, 'se')}
            />
          </div>
        )
      })}
    </div>
  )
}

function DropZoneIndicator({ zone, active }: { zone: string; active: boolean }) {
  const positionMap: Record<string, string> = {
    top: 'top-0 left-0 right-0 h-[12%]',
    bottom: 'bottom-0 left-0 right-0 h-[12%]',
    left: 'top-0 left-0 bottom-0 w-[12%]',
    right: 'top-0 right-0 bottom-0 w-[12%]',
    center: 'top-[35%] left-[35%] w-[30%] h-[30%]'
  }

  return (
    <div
      className={`absolute ${positionMap[zone]} pointer-events-none transition-opacity z-[9999] rounded-sm`}
      style={{
        backgroundColor: active ? 'rgba(212, 160, 57, 0.2)' : 'transparent',
        border: active ? '2px dashed var(--accent)' : '2px dashed transparent'
      }}
    />
  )
}
