import React from 'react'
import { FileCode } from 'lucide-react'
import { KEYBOARD_SHORTCUTS } from '../../lib/constants'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <FileCode size={64} style={{ color: 'var(--bg-muted)' }} />
      <div className="text-center space-y-1">
        <p className="text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>
          LiteEditor
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Open a file from the explorer or use keyboard shortcuts
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="text-right">Open Folder</span>
        <kbd className="font-mono">{KEYBOARD_SHORTCUTS.openFolder}</kbd>
        <span className="text-right">New Terminal</span>
        <kbd className="font-mono">{KEYBOARD_SHORTCUTS.newTerminal}</kbd>
        <span className="text-right">Search Files</span>
        <kbd className="font-mono">{KEYBOARD_SHORTCUTS.search}</kbd>
        <span className="text-right">Toggle Sidebar</span>
        <kbd className="font-mono">{KEYBOARD_SHORTCUTS.toggleSidebar}</kbd>
      </div>
    </div>
  )
}
