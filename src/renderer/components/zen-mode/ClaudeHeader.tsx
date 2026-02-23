import { GripHorizontal, X, Sparkles } from 'lucide-react'
import { useZenStore } from '../../stores/zen-store'
import { cn } from '../../lib/cn'

interface ClaudeHeaderProps {
  panelId: string
  title: string
  isActive: boolean
  onFocus: () => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

export function ClaudeHeader({
  panelId,
  title,
  isActive,
  onFocus,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}: ClaudeHeaderProps) {
  const removePanel = useZenStore((s) => s.removePanel)

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 h-[36px] shrink-0 cursor-default',
        isActive ? 'border-t-2' : 'border-t-2 border-transparent'
      )}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTopColor: isActive ? 'var(--accent)' : 'transparent',
        borderBottom: '1px solid var(--border)'
      }}
      onClick={onFocus}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <GripHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
        <Sparkles size={14} style={{ color: 'var(--accent)' }} />
        <span
          className="text-sm truncate"
          style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          {title}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          removePanel(panelId)
        }}
        className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
        title="Close Claude Panel"
      >
        <X size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  )
}
