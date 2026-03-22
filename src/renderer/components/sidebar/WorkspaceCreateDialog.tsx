import { useState, useEffect, useCallback } from 'react'
import { X, GitBranch, Folder } from 'lucide-react'
import { useWorkspaceStore } from '../../stores/workspace-store'
import { useProjectStore } from '../../stores/project-store'

interface WorkspaceCreateDialogProps {
  projectId: string
  onClose: () => void
}

interface BranchInfo {
  name: string
  isRemote: boolean
}

export function WorkspaceCreateDialog({ projectId, onClose }: WorkspaceCreateDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'local' | 'worktree'>('local')
  const [branchMode, setBranchMode] = useState<'new' | 'existing'>('new')
  const [branchName, setBranchName] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId))

  useEffect(() => {
    if (type === 'worktree') {
      window.api.git.branchList().then((list) => {
        setBranches(list as BranchInfo[])
      }).catch(() => setBranches([]))
    }
  }, [type])

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !project) return
    setError('')
    setCreating(true)

    try {
      if (type === 'worktree') {
        const branch = branchMode === 'new' ? branchName.trim() : selectedBranch
        if (!branch) {
          setError('Branch name is required')
          setCreating(false)
          return
        }

        const sep = project.rootPath.includes('\\') ? '\\' : '/'
        const worktreePath = `${project.rootPath}${sep}.worktrees${sep}${name.trim()}`
        await window.api.git.worktreeAdd(worktreePath, branch, branchMode === 'new')
        await createWorkspace(projectId, name.trim(), 'worktree', branch, worktreePath)

        // Auto-add .worktrees/ to .gitignore if not already present
        try {
          const gitignorePath = `${project.rootPath}${sep}.gitignore`
          const content = await window.api.fs.readFile(gitignorePath).catch(() => '')
          if (typeof content === 'string' && !content.includes('.worktrees')) {
            const newContent = content.endsWith('\n') ? `${content}.worktrees/\n` : `${content}\n.worktrees/\n`
            await window.api.fs.writeFile(gitignorePath, newContent)
          }
        } catch { /* gitignore update is best-effort */ }
      } else {
        await createWorkspace(projectId, name.trim(), 'local')
      }
      onClose()
    } catch (e) {
      setError(String(e))
    } finally {
      setCreating(false)
    }
  }, [name, type, branchMode, branchName, selectedBranch, project, projectId, createWorkspace, onClose])

  const localBranches = branches.filter((b) => !b.isRemote)

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-[420px] rounded-lg shadow-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            New Workspace
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. feature-auth"
              autoFocus
              className="w-full px-2 py-1.5 rounded text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleCreate() }}
            />
          </div>

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('local')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  backgroundColor: type === 'local' ? 'var(--accent)' : 'var(--bg-overlay)',
                  color: type === 'local' ? 'white' : 'var(--text-secondary)'
                }}
              >
                <Folder size={12} />
                Local
              </button>
              <button
                onClick={() => setType('worktree')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  backgroundColor: type === 'worktree' ? 'var(--accent)' : 'var(--bg-overlay)',
                  color: type === 'worktree' ? 'white' : 'var(--text-secondary)'
                }}
              >
                <GitBranch size={12} />
                Git Worktree
              </button>
            </div>
          </div>

          {/* Worktree options */}
          {type === 'worktree' && (
            <div className="space-y-2">
              {/* Branch mode */}
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input
                    type="radio"
                    checked={branchMode === 'new'}
                    onChange={() => setBranchMode('new')}
                  />
                  New branch from HEAD
                </label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  <input
                    type="radio"
                    checked={branchMode === 'existing'}
                    onChange={() => setBranchMode('existing')}
                  />
                  Existing branch
                </label>
              </div>

              {branchMode === 'new' ? (
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Branch name"
                  className="w-full px-2 py-1.5 rounded text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)'
                  }}
                />
              ) : (
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-2 py-1.5 rounded text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <option value="">Select branch...</option>
                  {localBranches.map((b) => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-xs px-2 py-1 rounded" style={{ color: 'var(--status-error)', backgroundColor: 'rgba(255,0,0,0.1)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-4 py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-overlay)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
