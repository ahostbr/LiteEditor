import React, { useState } from 'react'
import { GitBranch, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useGitStore } from '../../stores/git-store'

export function GitBranches() {
  const { branches, currentBranch, switchBranch, createBranch, deleteBranch, loadBranches } = useGitStore()
  const [isOpen, setIsOpen] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const handleCreate = () => {
    if (newBranchName.trim()) {
      createBranch(newBranchName.trim())
      setNewBranchName('')
      setShowCreate(false)
    }
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) loadBranches() }}
        className="flex items-center gap-1 px-3 py-1.5 cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <GitBranch size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Branches
        </span>
      </div>
      {isOpen && (
        <div className="pb-1">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className="flex items-center gap-2 px-6 py-0.5 hover:bg-[var(--bg-overlay)] cursor-pointer transition-colors"
              onClick={() => !branch.current && switchBranch(branch.name)}
            >
              <span
                className="text-xs flex-1 truncate"
                style={{
                  color: branch.current ? 'var(--accent)' : 'var(--text-primary)',
                  fontWeight: branch.current ? 600 : 400
                }}
              >
                {branch.name}
              </span>
              {!branch.current && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBranch(branch.name)
                  }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-muted)]"
                  title="Delete branch"
                >
                  <Trash2 size={12} style={{ color: 'var(--error)' }} />
                </button>
              )}
            </div>
          ))}
          {showCreate ? (
            <div className="flex items-center gap-1 px-6 py-1">
              <input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Branch name"
                className="flex-1 px-1 py-0.5 text-xs rounded outline-none"
                style={{
                  backgroundColor: 'var(--bg-overlay)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)'
                }}
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 px-6 py-0.5 text-xs hover:bg-[var(--bg-overlay)] w-full transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <Plus size={12} /> New Branch
            </button>
          )}
        </div>
      )}
    </div>
  )
}
