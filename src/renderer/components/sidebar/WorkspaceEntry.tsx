import { useState, useCallback, useEffect, useRef } from 'react'
import { ChevronRight, ChevronDown, GitBranch, Folder, Terminal } from 'lucide-react'
import { useWorkspaceStore, type Workspace } from '../../stores/workspace-store'
import { useProjectStore } from '../../stores/project-store'
import { openFileInCurrentMode } from '../../lib/open-file'
import { logError } from '../../stores/error-store'
import { useTerminalStore } from '../../stores/terminal-store'
import { TreeNode, type FileNode } from './TreeNode'
import { cn } from '../../lib/cn'

interface WorkspaceEntryProps {
  workspace: Workspace
  isActive: boolean
  projectRootPath: string
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return `${Math.floor(days / 30)}mo`
}

export function WorkspaceEntry({ workspace, isActive, projectRootPath }: WorkspaceEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const [tree, setTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const switchWorkspace = useWorkspaceStore((s) => s.switchWorkspace)
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)
  const renameWorkspace = useWorkspaceStore((s) => s.renameWorkspace)
  const [isRenaming, setIsRenaming] = useState(false)
  const [editName, setEditName] = useState(workspace.name)
  const inputRef = useRef<HTMLInputElement>(null)

  // Derive effective path from workspace entity + project-store (not stale parent prop)
  const projectRoot = useProjectStore((s) => s.projects.find((p) => p.id === workspace.projectId)?.rootPath)
  const terminalSessions = useTerminalStore((s) => s.sessions)
  const effectivePath = workspace.worktreePath || projectRoot || projectRootPath
  const hasActiveTerminal = terminalSessions.some((s) => s.cwd === effectivePath)

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
      await openFileInCurrentMode(node.path)
    } catch (err) { logError('WorkspaceEntry', `Failed to open file: ${node.path}`, err) }
  }, [])

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== workspace.name) {
      renameWorkspace(workspace.projectId, workspace.id, trimmed)
    }
    setIsRenaming(false)
  }, [editName, workspace, renameWorkspace])

  const handleDelete = useCallback(async () => {
    setMenuPos(null)

    if (workspace.type === 'worktree' && workspace.worktreePath) {
      // Worktree workspace: offer to also remove git worktree
      const result = await window.api.dialog.showMessageBox({
        type: 'warning',
        title: 'Delete Workspace',
        message: `Delete workspace "${workspace.name}"?`,
        detail: 'This workspace is backed by a git worktree. You can also remove the worktree directory.',
        buttons: ['Remove worktree too', 'Just unregister', 'Cancel'],
        defaultId: 2,
        cancelId: 2
      })
      if (result === 0) {
        // Remove worktree + workspace
        try { await window.api.git.worktreeRemove(workspace.worktreePath) } catch { /* may already be gone */ }
        await deleteWorkspace(workspace.projectId, workspace.id)
      } else if (result === 1) {
        // Just unregister workspace, keep worktree directory
        await deleteWorkspace(workspace.projectId, workspace.id)
      }
    } else {
      // Local workspace: simple delete
      const result = await window.api.dialog.showMessageBox({
        type: 'warning',
        title: 'Delete Workspace',
        message: `Delete workspace "${workspace.name}"?`,
        detail: 'This cannot be undone.',
        buttons: ['Delete', 'Cancel'],
        defaultId: 1,
        cancelId: 1
      })
      if (result === 0) {
        await deleteWorkspace(workspace.projectId, workspace.id)
      }
    }
  }, [workspace, deleteWorkspace])

  const TypeIcon = workspace.type === 'worktree' ? GitBranch : Folder

  return (
    <div>
      <div
        className={cn(
          'relative flex items-center gap-1 px-2 py-0 cursor-pointer transition-colors group h-6',
          isActive && 'ring-1 ring-[var(--border)]/50'
        )}
        style={{
          paddingLeft: '20px',
          backgroundColor: isActive ? 'var(--bg-overlay)' : undefined,
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent'
        }}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); setMenuPos({ x: e.clientX, y: e.clientY }) }}
        onMouseLeave={() => setMenuPos(null)}
      >
        <button
          onClick={handleExpand}
          className="shrink-0 p-0"
          style={{ color: 'var(--text-muted)' }}
        >
          {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        </button>
        <TypeIcon size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
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
            className="flex-1 bg-transparent border-b text-[10px] outline-none min-w-0"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--accent)' }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className="text-[10px] truncate flex-1"
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {workspace.name}
          </span>
        )}

        {/* Right-side signals */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Terminal running indicator */}
          {hasActiveTerminal && (
            <Terminal
              size={9}
              className="text-teal-400 animate-pulse shrink-0"
              title="Terminal process running"
            />
          )}

          {/* Branch badge */}
          {workspace.branch && (
            <span className="text-[8px] px-0.5 rounded shrink-0" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-overlay)' }}>
              {workspace.branch}
            </span>
          )}

          {/* Relative timestamp */}
          {workspace.lastActivity > 0 && (
            <span
              className={cn(
                'text-[8px] shrink-0',
                isActive ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
              )}
              style={{ opacity: isActive ? 0.65 : 0.4 }}
            >
              {formatRelativeTime(workspace.lastActivity)}
            </span>
          )}
        </div>

        {/* Context menu */}
        {menuPos && (
          <div
            className="fixed z-50 rounded border shadow-lg py-0.5 min-w-[120px]"
            style={{ left: menuPos.x, top: menuPos.y, backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <ContextItem label="Rename" onClick={() => {
              setMenuPos(null)
              setIsRenaming(true)
              setEditName(workspace.name)
              setTimeout(() => inputRef.current?.select(), 0)
            }} />
            <ContextItem label="Open in Explorer" onClick={() => {
              setMenuPos(null)
              window.api.shell.openPath(effectivePath)
            }} />
            <div className="my-0.5" style={{ borderTop: '1px solid var(--border)' }} />
            <ContextItem label="Delete" danger onClick={handleDelete} />
          </div>
        )}
      </div>

      {/* Inline file tree */}
      {expanded && (
        <div style={{ paddingLeft: '32px' }}>
          {loading ? (
            <div className="text-[9px] py-0.5" style={{ color: 'var(--text-muted)' }}>Loading...</div>
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
      className="flex items-center w-full px-3 py-0.5 text-[10px] hover:bg-[var(--bg-overlay)] transition-colors"
      style={{ color: danger ? '#ef4444' : 'var(--text-primary)' }}
    >
      {label}
    </button>
  )
}
