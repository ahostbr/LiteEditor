import { useState, useEffect, useCallback } from 'react'
import { X, GitBranch, Trash2, FolderOpen } from 'lucide-react'
import { useProjectStore, type ProjectState } from '../../stores/project-store'
import { useWorkspaceStore } from '../../stores/workspace-store'

interface ProjectSettingsDialogProps {
  project: ProjectState
  onClose: () => void
}

interface WorktreeInfo {
  path: string
  branch: string
  head: string
  bare: boolean
}

export function ProjectSettingsDialog({ project, onClose }: ProjectSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'worktrees'>('general')
  const [name, setName] = useState(project.name)
  const [worktrees, setWorktrees] = useState<WorktreeInfo[]>([])
  const [loadingWorktrees, setLoadingWorktrees] = useState(false)

  const renameProject = useProjectStore((s) => s.renameProject)
  const removeProject = useProjectStore((s) => s.removeProject)

  useEffect(() => {
    if (activeTab === 'worktrees') {
      setLoadingWorktrees(true)
      window.api.git.worktreeList()
        .then((list) => setWorktrees(list as WorktreeInfo[]))
        .catch(() => setWorktrees([]))
        .finally(() => setLoadingWorktrees(false))
    }
  }, [activeTab])

  const handleSaveName = useCallback(() => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== project.name) {
      renameProject(project.id, trimmed)
    }
  }, [name, project, renameProject])

  const handleDeleteProject = useCallback(async () => {
    const result = await window.api.dialog.showMessageBox({
      type: 'warning',
      title: 'Remove Project',
      message: `Remove "${project.name}" from LiteEditor?`,
      detail: 'This will unregister the project. Your files will not be deleted.',
      buttons: ['Remove', 'Cancel'],
      defaultId: 1,
      cancelId: 1
    })
    if (result === 0) {
      await removeProject(project.id)
      onClose()
    }
  }, [project, removeProject, onClose])

  const handleRemoveWorktree = useCallback(async (wt: WorktreeInfo) => {
    const result = await window.api.dialog.showMessageBox({
      type: 'warning',
      title: 'Remove Worktree',
      message: `Remove worktree for branch "${wt.branch}"?`,
      detail: `Path: ${wt.path}\nThis will delete the working directory.`,
      buttons: ['Remove', 'Cancel'],
      defaultId: 1,
      cancelId: 1
    })
    if (result === 0) {
      try {
        await window.api.git.worktreeRemove(wt.path)
        setWorktrees((prev) => prev.filter((w) => w.path !== wt.path))
      } catch (e) {
        console.error('Failed to remove worktree:', e)
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-[500px] max-h-[70vh] flex flex-col rounded-lg shadow-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Project Settings — {project.name}
          </span>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-2 gap-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {(['general', 'worktrees'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2 text-xs font-medium capitalize transition-colors"
              style={{
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Project name */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Project Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)'
                    }}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                  />
                </div>
              </div>

              {/* Root path (read-only) */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Root Path
                </label>
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <span className="truncate flex-1">{project.rootPath}</span>
                  <button
                    onClick={() => window.api.shell.openPath(project.rootPath)}
                    className="shrink-0 p-0.5 rounded"
                    style={{ color: 'var(--text-muted)' }}
                    title="Open in Explorer"
                  >
                    <FolderOpen size={14} />
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs font-medium" style={{ color: '#ef4444' }}>Danger Zone</span>
                <button
                  onClick={handleDeleteProject}
                  className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  <Trash2 size={12} />
                  Remove Project
                </button>
              </div>
            </div>
          )}

          {activeTab === 'worktrees' && (
            <div className="space-y-2">
              {loadingWorktrees ? (
                <div className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                  Loading worktrees...
                </div>
              ) : worktrees.length === 0 ? (
                <div className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                  No worktrees found. Create one from the sidebar.
                </div>
              ) : (
                worktrees.map((wt) => (
                  <div
                    key={wt.path}
                    className="flex items-center gap-2 px-2 py-2 rounded"
                    style={{ backgroundColor: 'var(--bg-muted)' }}
                  >
                    <GitBranch size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {wt.branch || '(detached)'}
                      </div>
                      <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {wt.path}
                      </div>
                    </div>
                    {!wt.bare && (
                      <button
                        onClick={() => handleRemoveWorktree(wt)}
                        className="shrink-0 p-1 rounded transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                        title="Remove worktree"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
