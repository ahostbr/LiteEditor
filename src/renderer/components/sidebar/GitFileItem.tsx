import React, { useState } from 'react'
import { useGitStore, type ChangedFile } from '../../stores/git-store'
import { useEditorStore } from '../../stores/editor-store'
import { StatusBadge } from '../shared/StatusBadge'
import { ContextMenu, type ContextMenuItem } from '../shared/ContextMenu'

export function GitFileItem({ file }: { file: ChangedFile }) {
  const { toggleStaged, discardChanges } = useGitStore()
  const openDiff = useEditorStore((s) => s.openDiff)
  const projectRoot = useEditorStore((s) => s.projectRoot)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const fileName = file.path.split(/[\\/]/).pop() || file.path

  const handleClick = async () => {
    if (!projectRoot) return
    try {
      const fullPath = `${projectRoot}/${file.path}`
      let original = ''
      try {
        original = await window.api.git.getFileAtRevision(file.path, 'HEAD')
      } catch { /* new file */ }
      const modified = await window.api.fs.readFile(fullPath)
      openDiff(file.path, original, modified)
    } catch { /* ignore */ }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const contextItems: ContextMenuItem[] = [
    { label: file.staged ? 'Unstage' : 'Stage', onClick: () => toggleStaged(file.path) },
    { label: 'Discard Changes', onClick: () => discardChanges(file.path) },
    { separator: true, label: '', onClick: () => {} },
    { label: 'Open File', onClick: handleClick }
  ]

  return (
    <>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="flex items-center gap-2 px-3 py-0.5 cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleStaged(file.path)
          }}
          className="shrink-0"
        >
          <StatusBadge status={file.status} />
        </button>
        <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
          {fileName}
        </span>
        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          {file.path}
        </span>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
