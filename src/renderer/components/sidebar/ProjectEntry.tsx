import { useState, useRef, useCallback } from 'react'
import { GitBranch, X, Pin, FolderOpen, Copy, MoreHorizontal } from 'lucide-react'
import { useProjectStore, type ProjectState, type AgentStatus } from '../../stores/project-store'
import { cn } from '../../lib/cn'

interface ProjectEntryProps {
  project: ProjectState
  isActive: boolean
  onSelect: () => void
}

function getAgentStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'idle': return 'var(--text-muted)'
    case 'working': return '#22c55e'
    case 'waiting': return 'var(--accent)'
    case 'error': return '#ef4444'
  }
}

function getAgentStatusLabel(status: AgentStatus, text: string): string {
  if (text) return text
  switch (status) {
    case 'idle': return 'Idle'
    case 'working': return 'Working...'
    case 'waiting': return 'Waiting for input'
    case 'error': return 'Error'
  }
}

export function ProjectEntry({ project, isActive, onSelect }: ProjectEntryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const contextRef = useRef<HTMLDivElement>(null)
  const removeProject = useProjectStore((s) => s.removeProject)
  const renameProject = useProjectStore((s) => s.renameProject)
  const togglePin = useProjectStore((s) => s.togglePin)

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

  const truncatedPath = project.rootPath.length > 35
    ? '...' + project.rootPath.slice(-32)
    : project.rootPath

  return (
    <div
      className={cn(
        'relative px-3 py-2 cursor-pointer transition-colors',
        isActive ? 'bg-[var(--bg-overlay)]' : 'hover:bg-[var(--bg-muted)]'
      )}
      style={{
        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent'
      }}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowContextMenu(false) }}
      onContextMenu={(e) => {
        e.preventDefault()
        setShowContextMenu(true)
      }}
    >
      {/* Project name + notification badge */}
      <div className="flex items-center gap-1.5">
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
      </div>

      {/* Agent status */}
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: getAgentStatusColor(project.agentStatus) }}
        />
        <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
          {getAgentStatusLabel(project.agentStatus, project.agentStatusText)}
        </span>
      </div>

      {/* Git branch + path */}
      <div className="flex items-center gap-1.5 mt-0.5">
        {project.gitBranch && (
          <>
            <GitBranch size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
              {project.gitBranch}
            </span>
          </>
        )}
      </div>

      {/* PR status */}
      {project.prStatus && (
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="text-[9px] px-1 rounded"
            style={{
              backgroundColor: project.prStatus.state === 'open' ? 'rgba(34, 197, 94, 0.15)' :
                project.prStatus.state === 'draft' ? 'rgba(234, 179, 8, 0.15)' :
                  project.prStatus.state === 'merged' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: project.prStatus.state === 'open' ? '#22c55e' :
                project.prStatus.state === 'draft' ? '#eab308' :
                  project.prStatus.state === 'merged' ? '#a855f7' : '#ef4444'
            }}
          >
            PR #{project.prStatus.number} {project.prStatus.state}
          </span>
        </div>
      )}

      {/* Listening ports */}
      {project.listeningPorts.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {project.listeningPorts.map((port) => (
            <span
              key={port}
              className="text-[9px] px-1 rounded"
              style={{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
            >
              :{port}
            </span>
          ))}
        </div>
      )}

      {/* Context menu */}
      {showContextMenu && (
        <div
          ref={contextRef}
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
            label="Open in Explorer"
            onClick={() => {
              setShowContextMenu(false)
              window.api.shell.openPath(project.rootPath).catch(() => {})
            }}
          />
          <ContextMenuItem
            label="Copy Path"
            onClick={() => {
              setShowContextMenu(false)
              navigator.clipboard.writeText(project.rootPath).catch(() => {})
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
