import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { FileIcon } from '../shared/FileIcon'
import type { Tab as TabType } from '../../stores/editor-store'

interface TabProps {
  tab: TabType
  isActive: boolean
  onClick: () => void
  onClose: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function Tab({ tab, isActive, onClick, onClose, onContextMenu }: TabProps) {
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        'flex items-center gap-1.5 h-full px-3 cursor-pointer shrink-0 transition-colors relative',
        'border-r border-r-[var(--border)]',
        isActive
          ? 'bg-[var(--bg-base)]'
          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-overlay)]'
      )}
    >
      {isActive && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
      <FileIcon name={tab.title} />
      <span
        className="text-xs whitespace-nowrap max-w-[120px] truncate"
        style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
      >
        {tab.title}
      </span>
      {tab.isDirty && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="ml-1 p-0.5 rounded hover:bg-[var(--bg-muted)] opacity-60 hover:opacity-100 transition-opacity"
        title="Close Tab"
      >
        <X size={12} />
      </button>
    </div>
  )
}
