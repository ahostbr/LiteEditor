import { useState, useCallback, useEffect, useRef } from 'react'
import { ChevronRight, ChevronDown, GitBranch, Folder, MoreHorizontal } from 'lucide-react'
import { useWorkspaceStore, type Workspace } from '../../stores/workspace-store'
import { useEditorStore } from '../../stores/editor-store'
import { useUiStore } from '../../stores/ui-store'
import { useZenStore } from '../../stores/zen-store'
import { TreeNode, type FileNode } from './TreeNode'

interface WorkspaceEntryProps {
  workspace: Workspace
  isActive: boolean
  projectRootPath: string
}

export function WorkspaceEntry({ workspace, isActive, projectRootPath }: WorkspaceEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const [tree, setTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const switchWorkspace = useWorkspaceStore((s) => s.switchWorkspace)
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)
  const renameWorkspace = useWorkspaceStore((s) => s.renameWorkspace)
  const [isRenaming, setIsRenaming] = useState(false)
  const [editName, setEditName] = useState(workspace.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const effectivePath = workspace.worktreePath || projectRootPath

  const handleClick = useCallback(() => {
    if (!isActive) {
      switchWorkspace(workspace.id)
    }
  }, [isActive, switchWorkspace, workspace.id])

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded((prev) => !prev)
  }, [])

  // Load file tree when expanded
  useEffect(() => {
    if (!expanded) return
    setLoading(true)
    window.api.fs.readTree(effectivePath, 2).then((nodes) => {
      setTree(nodes as FileNode[])
    }).catch(() => setTree([])).finally(() => setLoading(false))
  }, [expanded, effectivePath])

  const handleFileClick = useCallback(async (node: FileNode) => {
    if (node.isDirectory) return
    try {
      const content = await window.api.fs.readFile(node.path)
      const appMode = useUiStore.getState().appMode
      if (appMode === 'zen') {
        useZenStore.getState().addEditorPanel(node.path, content)
      } else {
        useEditorStore.getState().openFile(node.path, content)
      }
    } catch { /* ignore */ }
  }, [])

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== workspace.name) {
      renameWorkspace(workspace.projectId, workspace.id, trimmed)
    }
    setIsRenaming(false)
  }, [editName, workspace, renameWorkspace])

  const handleDelete = useCallback(async () => {
    setShowMenu(false)
    // Use native dialog for confirmation
    const result = await window.api.dialog.showMessageBox({
      type: 'warning',
      title: 'Delete Workspace',
      message: `Delete workspace "${workspace.name}"?`,
      detail: workspace.type === 'worktree'
        ? 'This will unregister the workspace. The git worktree will NOT be removed.'
        : 'This cannot be undone.',
      buttons: ['Delete', 'Cancel'],
      defaultId: 1,
      cancelId: 1
    })
    if (result === 0) {
      deleteWorkspace(workspace.projectId, workspace.id)
    }
  }, [workspace, deleteWorkspace])

  const TypeIcon = workspace.type === 'worktree' ? GitBranch : Folder

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors group"
        style={{
          paddingLeft: '24px',
          backgroundColor: isActive ? 'var(--bg-overlay)' : undefined,
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent'
        }}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true) }}
        onMouseLeave={() => setShowMenu(false)}
      >
        <button
          onClick={handleExpand}
          className="shrink-0 p-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <TypeIcon size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        {isRenaming ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') setIsRenaming(false)
            }}
            className="flex-1 bg-transparent border-b text-[11px] outline-none min-w-0"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--accent)' }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className="text-[11px] truncate flex-1"
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {workspace.name}
          </span>
        )}
        {workspace.branch && (
          <span className="text-[9px] px-1 rounded shrink-0" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-overlay)' }}>
            {workspace.branch}
          </span>
        )}

        {/* Context menu */}
        {showMenu && (
          <div
            className="absolute right-2 z-50 rounded border shadow-lg py-1 min-w-[120px]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <ContextItem label="Rename" onClick={() => {
              setShowMenu(false)
              setIsRenaming(true)
              setEditName(workspace.name)
              setTimeout(() => inputRef.current?.select(), 0)
            }} />
            <ContextItem label="Open in Explorer" onClick={() => {
              setShowMenu(false)
              window.api.shell.openPath(effectivePath)
            }} />
            <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
            <ContextItem label="Delete" danger onClick={handleDelete} />
          </div>
        )}
      </div>

      {/* Inline file tree */}
      {expanded && (
        <div style={{ paddingLeft: '36px' }}>
          {loading ? (
            <div className="text-[10px] py-1" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            tree.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                depth={0}
                onFileClick={handleFileClick}
                refreshSignal={{ dirPath: '', counter: 0 }}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ContextItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="flex items-center w-full px-3 py-1 text-[11px] hover:bg-[var(--bg-overlay)] transition-colors"
      style={{ color: danger ? '#ef4444' : 'var(--text-primary)' }}
    >
      {label}
    </button>
  )
}
