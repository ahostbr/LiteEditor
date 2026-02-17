import React from 'react'
import { Search } from 'lucide-react'
import { useEditorStore } from '../../stores/editor-store'

export function CommandCenter() {
  const projectRoot = useEditorStore((s) => s.projectRoot)
  const projectName = projectRoot?.split(/[\\/]/).pop() || 'LiteEditor'

  return (
    <button
      className="flex items-center gap-2 px-3 rounded-md transition-colors cursor-default"
      style={{
        border: '1px solid var(--border)',
        borderRadius: '6px',
        height: '22px',
        width: '38vw',
        maxWidth: '600px',
        color: 'var(--text-secondary)',
        background: 'transparent',
        WebkitAppRegion: 'no-drag'
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-overlay)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
      onClick={() => {
        // Future: open command palette
      }}
    >
      <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      <span className="text-[12px] truncate">{projectName}</span>
    </button>
  )
}
