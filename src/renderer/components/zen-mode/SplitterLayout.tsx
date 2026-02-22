import { useCallback, useRef, useEffect, Fragment } from 'react'
import { PanelRenderer } from './PanelRenderer'
import { useZenStore, type ZenPanel } from '../../stores/zen-store'
import { useLayoutStore } from '../../stores/layout-store'

interface SplitterLayoutProps {
  panels: ZenPanel[]
}

export function SplitterLayout({ panels }: SplitterLayoutProps) {
  const activePanelId = useZenStore((s) => s.activePanelId)
  const setActivePanel = useZenStore((s) => s.setActivePanel)
  const splitterSizes = useLayoutStore((s) => s.splitterSizes)
  const setSplitterSizes = useLayoutStore((s) => s.setSplitterSizes)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize equal sizes when panel count changes
  useEffect(() => {
    if (splitterSizes.length !== panels.length) {
      const equalSize = 100 / panels.length
      setSplitterSizes(panels.map(() => equalSize))
    }
  }, [panels.length])

  const sizes = splitterSizes.length === panels.length
    ? splitterSizes
    : panels.map(() => 100 / panels.length)

  const handleMouseDown = useCallback((e: React.MouseEvent, splitIndex: number) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return

    const containerWidth = container.getBoundingClientRect().width
    const startX = e.clientX
    const startSizes = [...sizes]

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaPct = (deltaX / containerWidth) * 100

      const newSizes = [...startSizes]
      const leftSize = startSizes[splitIndex] + deltaPct
      const rightSize = startSizes[splitIndex + 1] - deltaPct

      const MIN_SIZE = 10
      if (leftSize >= MIN_SIZE && rightSize >= MIN_SIZE) {
        newSizes[splitIndex] = leftSize
        newSizes[splitIndex + 1] = rightSize
        setSplitterSizes(newSizes)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [sizes, setSplitterSizes])

  return (
    <div ref={containerRef} className="flex flex-row h-full">
      {panels.map((panel, index) => (
        <Fragment key={panel.id}>
          {index > 0 && (
            <div
              className="w-[3px] shrink-0 cursor-col-resize hover:bg-[var(--accent)] transition-colors"
              style={{ backgroundColor: 'var(--border)' }}
              onMouseDown={(e) => handleMouseDown(e, index - 1)}
            />
          )}
          <div
            className="flex flex-col min-w-0 overflow-hidden"
            style={{ width: `${sizes[index]}%`, backgroundColor: 'var(--bg-base)' }}
          >
            <PanelRenderer
              panel={panel}
              isActive={panel.id === activePanelId}
              onFocus={() => setActivePanel(panel.id)}
            />
          </div>
        </Fragment>
      ))}
    </div>
  )
}
