import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronRight, ChevronDown, GitBranch, X, Pin, Plus } from 'lucide-react'
import { useProjectStore, type ProjectState, type AgentStatus } from '../../stores/project-store'
import { useWorkspaceStore, type Workspace } from '../../stores/workspace-store'
import { useEditorStore } from '../../stores/editor-store'
import { WorkspaceEntry } from './WorkspaceEntry'
import { ScriptsSection } from './ScriptsSection'
import { cn } from '../../lib/cn'

interface ProjectEntryProps {
  project: ProjectState
  isActive: boolean
  onSelect: () => void
  onCreateWorkspace: () => void
  onOpenSettings: () => void
}

function getAgentStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'idle': return 'var(--text-muted)'
    case 'working': return '#22c55e'
    case 'waiting': return 'var(--accent)'
    case 'error': return '#ef4444'
  }
}

export function ProjectEntry({ project, isActive, onSelect, onCreateWorkspace, onOpenSettings }: ProjectEntryProps) {
  const [expanded, setExpanded] = useState(isActive)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const removeProject = useProjectStore((s) => s.removeProject)
  const renameProject = useProjectStore((s) => s.renameProject)
  const togglePin = useProjectStore((s) => s.togglePin)

  // Workspace state
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId)
  const loadWorkspacesForProject = useWorkspaceStore((s) => s.loadWorkspacesForProject)

  // Load workspaces when project is expanded
  useEffect(() => {
    if (expanded && isActive) {
      loadWorkspacesForProject(project.id)
    }
  }, [expanded, isActive, project.id, loadWorkspacesForProject])

  // Auto-expand when project becomes active
  useEffect(() => {
    if (isActive) setExpanded(true)
  }, [isActive])

  const handleClick = useCallback(() => {
    onSelect()
    setExpanded(true)
  }, [onSelect])

  const handleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded((prev) => !prev)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
    setEditName(project.name)
    setTimeout(() => inputRef.current?.select(), 0)
  }, [project.name])

  const handleRenameSubmit = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== project.name) {
      renameProject(project.id, trimmed)
    }
    setIsEditing(false)
  }, [editName, project.id, project.name, renameProject])

  // Filter workspaces for this project
  const projectWorkspaces = workspaces.filter((w) => w.projectId === project.id)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowContextMenu(false) }}
    >
      {/* Project header row */}
      <div
        className={cn(
          'relative flex items-center gap-1 px-2 py-1.5 cursor-pointer transition-colors',
          isActive ? 'bg-[var(--bg-overlay)]' : 'hover:bg-[var(--bg-muted)]'
        )}
        style={{
          borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent'
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowContextMenu(true)
        }}
      >
        {/* Expand/collapse chevron */}
        <button
          onClick={handleExpand}
          className="shrink-0 p-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Project name */}
        {project.pinned && <Pin size={10} style={{ color: 'var(--accent)' }} />}
        {isEditing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            className="flex-1 bg-transparent border-b text-xs outline-none min-w-0"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--accent)' }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-xs font-medium truncate flex-1"
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {project.name}
          </span>
        )}

        {/* Status dot */}
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: getAgentStatusColor(project.agentStatus) }}
        />

        {/* Notification badge */}
        {project.notificationCount > 0 && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            {project.notificationCount}
          </span>
        )}

        {/* Close button on hover */}
        {hovered && !isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); removeProject(project.id) }}
            className="shrink-0 p-0.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            title="Close Project"
          >
            <X size={11} />
          </button>
        )}

        {/* Context menu */}
        {showContextMenu && (
          <div
            className="absolute right-2 top-full z-50 rounded border shadow-lg py-1 min-w-[140px]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <ContextMenuItem
              label="Rename"
              onClick={() => { setShowContextMenu(false); handleDoubleClick() }}
            />
            <ContextMenuItem
              label={project.pinned ? 'Unpin' : 'Pin to Top'}
              onClick={() => { setShowContextMenu(false); togglePin(project.id) }}
            />
            <ContextMenuItem
              label="Settings"
              onClick={() => { setShowContextMenu(false); onOpenSettings() }}
            />
            <ContextMenuItem
              label="New Workspace"
              onClick={() => { setShowContextMenu(false); onCreateWorkspace() }}
            />
            <ContextMenuItem
              label="Open in Explorer"
              onClick={() => {
                setShowContextMenu(false)
                window.api.shell.openPath(project.rootPath)
              }}
            />
            <ContextMenuItem
              label="Copy Path"
              onClick={() => {
                setShowContextMenu(false)
                navigator.clipboard.writeText(project.rootPath)
              }}
            />
            <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
            <ContextMenuItem
              label="Close Project"
              danger
              onClick={() => { setShowContextMenu(false); removeProject(project.id) }}
            />
          </div>
        )}
      </div>

      {/* Expanded: workspace list + git info */}
      {expanded && isActive && (
        <div>
          {/* Workspace entries */}
          {projectWorkspaces.map((ws) => (
            <WorkspaceEntry
              key={ws.id}
              workspace={ws}
              isActive={ws.id === activeWorkspaceId}
              projectRootPath={project.rootPath}
            />
          ))}

          {/* Scripts section */}
          <ScriptsSection projectRootPath={project.rootPath} />

          {/* Add workspace button */}
          <button
            onClick={(e) => { e.stopPropagation(); onCreateWorkspace() }}
            className="flex items-center gap-1.5 w-full px-2 py-1 text-[11px] transition-colors hover:bg-[var(--bg-muted)]"
            style={{ paddingLeft: '24px', color: 'var(--text-muted)' }}
          >
            <Plus size={11} />
            New Workspace
          </button>
        </div>
      )}

      {/* Collapsed: show git branch hint */}
      {expanded && !isActive && project.gitBranch && (
        <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: '32px' }}>
          <GitBranch size={10} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{project.gitBranch}</span>
        </div>
      )}
    </div>
  )
}

function ContextMenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="flex items-center w-full px-3 py-1 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
      style={{ color: danger ? '#ef4444' : 'var(--text-primary)' }}
    >
      {label}
    </button>
  )
}
