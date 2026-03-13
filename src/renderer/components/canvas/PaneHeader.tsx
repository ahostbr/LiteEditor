import { useState, useRef, useEffect } from 'react'
import { GripHorizontal, X, Minus, Terminal, FileCode, Globe, LayoutGrid, GripVertical, Layers, PanelTop, ChevronDown } from 'lucide-react'
import { useCanvasStore, type CanvasPaneState, type PaneLayoutMode } from '../../stores/canvas-store'
import { cn } from '../../lib/cn'

interface PaneHeaderProps {
  pane: CanvasPaneState
  isFocused: boolean
  onDragStart: (e: React.PointerEvent) => void
}

const LAYOUT_OPTIONS: { mode: PaneLayoutMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'single', icon: null, label: 'Single' },
  { mode: 'grid', icon: <LayoutGrid size={12} />, label: 'Grid' },
  { mode: 'splitter', icon: <GripVertical size={12} />, label: 'Splitter' },
  { mode: 'window', icon: <Layers size={12} />, label: 'Floating' },
  { mode: 'tabs', icon: <PanelTop size={12} />, label: 'Tabs' }
]

function getPaneTypeIcon(type: string) {
  switch (type) {
    case 'terminal': return <Terminal size={13} />
    case 'editor':
    case 'unified-editor': return <FileCode size={13} />
    case 'browser': return <Globe size={13} />
    case 'claude': return <span className="text-[11px] font-bold">C</span>
    case 'codex': return <span className="text-[11px] font-bold">X</span>
    default: return null
  }
}

export function PaneHeader({ pane, isFocused, onDragStart }: PaneHeaderProps) {
  const removePane = useCanvasStore((s) => s.removePane)
  const updatePane = useCanvasStore((s) => s.updatePane)
  const [showLayoutMenu, setShowLayoutMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!showLayoutMenu) return
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setShowLayoutMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showLayoutMenu])

  return (
    <div
      className={cn(
        'flex items-center justify-between px-2 h-[32px] shrink-0 select-none',
        isFocused ? 'border-t-2' : 'border-t-2 border-transparent'
      )}
      style={{
        backgroundColor: isFocused ? 'var(--bg-muted)' : 'var(--bg-surface)',
        borderTopColor: isFocused ? 'var(--accent)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        cursor: 'grab'
      }}
      onPointerDown={onDragStart}
    >
      {/* Left: drag handle + type icon + title */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <GripHorizontal size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {getPaneTypeIcon(pane.type)}
        </span>
        <span
          className="text-xs truncate"
          style={{ color: isFocused ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {pane.title}
        </span>
        {pane.isDirty && (
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
        )}
        {pane.hasNotification && (
          <span
            className="text-[10px] px-1 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            {pane.notificationCount || '!'}
          </span>
        )}
      </div>

      {/* Right: layout picker + minimize + close */}
      <div
        className="flex items-center gap-0.5 shrink-0"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag from buttons
      >
        {/* Layout mode picker */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setShowLayoutMenu((v) => !v)}
            className="flex items-center gap-0.5 px-1 h-[20px] rounded text-[10px] transition-colors"
            style={{
              color: 'var(--text-muted)',
              background: showLayoutMenu ? 'var(--bg-overlay)' : 'transparent'
            }}
            onMouseEnter={(e) => { if (!showLayoutMenu) e.currentTarget.style.background = 'var(--bg-overlay)' }}
            onMouseLeave={(e) => { if (!showLayoutMenu) e.currentTarget.style.background = 'transparent' }}
            title="Layout Mode"
          >
            {pane.layoutMode === 'single' ? 'Single' : pane.layoutMode.charAt(0).toUpperCase() + pane.layoutMode.slice(1)}
            <ChevronDown size={10} />
          </button>
          {showLayoutMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 z-50 rounded border shadow-lg py-1 min-w-[120px]"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              {LAYOUT_OPTIONS.map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => {
                    updatePane(pane.id, { layoutMode: mode })
                    setShowLayoutMenu(false)
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-1 text-xs transition-colors',
                    pane.layoutMode === mode ? 'bg-[var(--bg-overlay)]' : 'hover:bg-[var(--bg-overlay)]'
                  )}
                  style={{
                    color: pane.layoutMode === mode ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Minimize */}
        <button
          onClick={() => updatePane(pane.id, { minimized: !pane.minimized })}
          className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          title={pane.minimized ? 'Restore' : 'Minimize'}
        >
          <Minus size={12} />
        </button>

        {/* Close */}
        <button
          onClick={() => removePane(pane.id)}
          className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.3)'
            e.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
          title="Close Pane"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
