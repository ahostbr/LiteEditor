import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronRight, ChevronDown, GitBranch, GitPullRequest, X, Pin, Plus } from 'lucide-react'
import { useProjectStore, type ProjectState, type AgentStatus } from '../../stores/project-store'
import { useWorkspaceStore } from '../../stores/workspace-store'
import { useEditorStore } from '../../stores/editor-store'
import { WorkspaceEntry } from './WorkspaceEntry'
import { ScriptsSection } from './ScriptsSection'
import { StatusDot, aggregateStatus, type StatusDotState } from './StatusDot'
import { ProjectIcon, ProjectIconPicker } from './ProjectIcon'
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
    case 'working': return '#0ea5e9'   // sky-500
    case 'waiting': return '#f59e0b'   // amber-500
    case 'error': return '#ef4444'     // rose-500
  }
}

function getAgentStatusLabel(status: AgentStatus): string {
  switch (status) {
    case 'idle': return ''
    case 'working': return 'Working'
    case 'waiting': return 'Waiting'
    case 'error': return 'Error'
  }
}

function getPrColor(state: string): string {
  switch (state) {
    case 'open': case 'draft': return 'text-emerald-400'
    case 'merged': return 'text-violet-400'
    case 'closed': return 'text-rose-400'
    default: return 'text-[var(--text-muted)]'
  }
}

export function ProjectEntry({ project, isActive, onSelect, onCreateWorkspace, onOpenSettings }: ProjectEntryProps) {
  const [expanded, setExpanded] = useState(isActive)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const iconPickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const removeProject = useProjectStore((s) => s.removeProject)
  const renameProject = useProjectStore((s) => s.renameProject)
  const togglePin = useProjectStore((s) => s.togglePin)
  const updateProject = useProjectStore((s) => s.updateProject)

  const handleSetIcon = useCallback(async (icon: string) => {
    updateProject(project.id, { icon } as any)
    await window.api.project.update(project.id, { icon })
  }, [project.id, updateProject])

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

  // Git dirty state
  const [gitDirtyCount, setGitDirtyCount] = useState(0)

  // Fetch git branch for project on mount and when project becomes active
  useEffect(() => {
    if (!project.rootPath) return
    window.api.git.currentBranchForPath(project.rootPath)
      .then((result: unknown) => {
        const branch = result as { name: string } | null
        if (branch?.name) {
          updateProject(project.id, { gitBranch: branch.name })
        }
      })
      .catch(() => { /* not a git repo, ignore */ })

    // Check dirty state via status-porcelain (works on any path via git init)
    window.api.git.statusPorcelainForPath(project.rootPath)
      .then((result: unknown) => {
        const output = result as string
        // Each modified file = one non-empty line
        const lines = output ? output.split('\n').filter((l: string) => l.trim()) : []
        setGitDirtyCount(lines.length)
      })
      .catch(() => setGitDirtyCount(0))
  }, [project.rootPath, project.id, updateProject])

  // Fetch PR status for project on mount (if it's a git repo with gh cli)
  useEffect(() => {
    if (!project.rootPath || !project.gitBranch) return
    // Set GitHub cwd and fetch PR list for current branch
    window.api.github.setCwd(project.rootPath)
      .then(() => window.api.github.prList('all'))
      .then((prs: unknown[]) => {
        // Find PR matching current branch
        const matching = (prs as Array<{ number: number; state: string; headRefName: string }>)
          .find(pr => pr.headRefName === project.gitBranch)
        if (matching) {
          const state = matching.state === 'MERGED' ? 'merged'
            : matching.state === 'CLOSED' ? 'closed'
            : 'open'
          updateProject(project.id, {
            prStatus: { number: matching.number, state: state as 'open' | 'merged' | 'closed' }
          })
        }
      })
      .catch(() => { /* gh not installed or not a GitHub repo */ })
  }, [project.rootPath, project.gitBranch, project.id, updateProject])

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
    <div className="group/project">
      {/* Project header row */}
      <div
        className={cn(
          'relative flex items-center gap-1.5 px-2 py-1 my-0.5 cursor-pointer transition-all duration-200 overflow-hidden',
          isActive
            ? 'bg-[var(--bg-overlay)]/40'
            : 'hover:bg-[var(--bg-muted)]'
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault()
          setContextMenuPos({ x: e.clientX, y: e.clientY })
        }}
      >
        {isActive && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-[2px] shadow-[0_0_8px_var(--accent)] transition-opacity"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        )}
        {/* Project icon (click to expand, right-click for icon picker) */}
        <div className="relative shrink-0" ref={iconPickerRef}>
          <button
            onClick={handleExpand}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setShowIconPicker(true) }}
            className="p-0 transition-transform hover:scale-110"
            title="Right-click to change icon"
          >
            {project.icon ? (
              <ProjectIcon icon={project.icon} size={16} />
            ) : (
              expanded ? <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={11} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
          {showIconPicker && (
            <div className="absolute left-0 top-5 z-50">
              <ProjectIconPicker
                currentIcon={project.icon}
                onSelect={handleSetIcon}
                onClose={() => setShowIconPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Project name + branch (stacked) */}
        <div className="flex flex-col min-w-0 flex-1 gap-0 leading-none">
          <div className="flex items-center gap-1 min-w-0">
            {project.pinned && <Pin size={9} style={{ color: 'var(--accent)' }} className="shrink-0" />}
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
                className="text-xs font-medium truncate"
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {project.name}
              </span>
            )}
          </div>
          {/* Git branch under name */}
          {project.gitBranch && !isEditing && (
            <div className="flex items-center gap-0.5 min-w-0">
              <GitBranch size={8} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
              <span className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                {project.gitBranch}
              </span>
              {gitDirtyCount > 0 && (
                <span
                  className="text-[7px] px-0.5 rounded shrink-0"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
                  title={`${gitDirtyCount} modified file${gitDirtyCount === 1 ? '' : 's'}`}
                >
                  {gitDirtyCount}M
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status signals: PR icon + status dot + status text */}
        <div className="flex items-center gap-1 shrink-0">
          {/* PR status icon */}
          {project.prStatus && (
            <span title={`PR #${project.prStatus.number} (${project.prStatus.state})`} className="flex items-center">
              <GitPullRequest
                size={11}
                className={cn('shrink-0', getPrColor(project.prStatus.state))}
              />
            </span>
          )}

          {/* Agent status dot + text */}
          {project.agentStatus !== 'idle' && (
            <span className="flex items-center gap-0.5">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  project.agentStatus === 'working' && 'animate-pulse'
                )}
                style={{ backgroundColor: getAgentStatusColor(project.agentStatus) }}
              />
              <span className="text-[9px] hidden md:inline" style={{ color: getAgentStatusColor(project.agentStatus) }}>
                {project.agentStatusText || getAgentStatusLabel(project.agentStatus)}
              </span>
            </span>
          )}

          {/* Idle dot (subtle) */}
          {project.agentStatus === 'idle' && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: getAgentStatusColor(project.agentStatus) }}
            />
          )}

          {/* Notification badge */}
          {project.notificationCount > 0 && (
            <span
              className="text-[8px] px-1 py-0 rounded-full font-medium shrink-0 leading-tight"
              style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            >
              {project.notificationCount}
            </span>
          )}
        </div>

        {/* Close button — hover-only via group */}
        <button
          onClick={(e) => { e.stopPropagation(); removeProject(project.id) }}
          className="shrink-0 p-0 rounded transition-all duration-200 opacity-0 group-hover/project:opacity-100 hover:scale-110 active:scale-95"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          title="Close Project"
        >
          <X size={12} />
        </button>

        {/* Context menu */}
        {contextMenuPos && (
          <div
            className="fixed z-50 rounded border shadow-lg py-0.5 min-w-[140px]"
            style={{ left: contextMenuPos.x, top: contextMenuPos.y, backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            onMouseLeave={() => setContextMenuPos(null)}
          >
            <ContextMenuItem
              label="Rename"
              onClick={() => { setContextMenuPos(null); handleDoubleClick() }}
            />
            <ContextMenuItem
              label={project.pinned ? 'Unpin' : 'Pin to Top'}
              onClick={() => { setContextMenuPos(null); togglePin(project.id) }}
            />
            <ContextMenuItem
              label="Change Icon"
              onClick={() => { setContextMenuPos(null); setShowIconPicker(true) }}
            />
            <ContextMenuItem
              label="Settings"
              onClick={() => { setContextMenuPos(null); onOpenSettings() }}
            />
            <ContextMenuItem
              label="New Workspace"
              onClick={() => { setContextMenuPos(null); onCreateWorkspace() }}
            />
            <ContextMenuItem
              label="Open in Explorer"
              onClick={() => {
                setContextMenuPos(null)
                window.api.shell.openPath(project.rootPath)
              }}
            />
            <ContextMenuItem
              label="Copy Path"
              onClick={() => {
                setContextMenuPos(null)
                navigator.clipboard.writeText(project.rootPath)
              }}
            />
            <div className="my-0.5" style={{ borderTop: '1px solid var(--border)' }} />
            <ContextMenuItem
              label="Close Project"
              danger
              onClick={() => { setContextMenuPos(null); removeProject(project.id) }}
            />
          </div>
        )}
      </div>

      {/* Expanded: workspace list */}
      {expanded && isActive && (
        <div className="py-0">
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
          <ScriptsSection projectId={project.id} projectRootPath={project.rootPath} />

          {/* Add workspace button */}
          <button
            onClick={(e) => { e.stopPropagation(); onCreateWorkspace() }}
            className="flex items-center gap-1 w-full px-2 py-0.5 text-[10px] transition-colors hover:bg-[var(--bg-muted)]"
            style={{ paddingLeft: '24px', color: 'var(--text-muted)' }}
          >
            <Plus size={10} />
            New Workspace
          </button>
        </div>
      )}
    </div>
  )
}

function ContextMenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="flex items-center w-full px-3 py-0.5 text-[11px] hover:bg-[var(--bg-overlay)] transition-colors"
      style={{ color: danger ? '#ef4444' : 'var(--text-primary)' }}
    >
      {label}
    </button>
  )
}
