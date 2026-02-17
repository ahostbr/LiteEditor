import React from 'react'
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'
import { useGitStore } from '../../stores/git-store'

export function GitToolbar() {
  const {
    currentBranch, isPushing, isPulling, isFetching,
    pushOrigin, pullOrigin, fetchOrigin, refreshStatus
  } = useGitStore()

  return (
    <div
      className="flex items-center gap-1 px-3 py-2"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {currentBranch && (
        <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>
          {currentBranch.name}
          {(currentBranch.ahead > 0 || currentBranch.behind > 0) && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' '}({currentBranch.ahead > 0 && `↑${currentBranch.ahead}`}
              {currentBranch.behind > 0 && `↓${currentBranch.behind}`})
            </span>
          )}
        </span>
      )}
      <div className="flex-1" />
      <ToolbarBtn onClick={fetchOrigin} loading={isFetching} title="Fetch">
        <RefreshCw size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={pullOrigin} loading={isPulling} title="Pull">
        <ArrowDown size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={pushOrigin} loading={isPushing} title="Push">
        <ArrowUp size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={refreshStatus} title="Refresh">
        <RefreshCw size={14} />
      </ToolbarBtn>
    </div>
  )
}

function ToolbarBtn({
  onClick, loading, title, children
}: {
  onClick: () => void
  loading?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      className="p-1 rounded hover:bg-[var(--bg-overlay)] transition-colors disabled:opacity-40"
      style={{ color: 'var(--text-muted)' }}
    >
      <span className={loading ? 'animate-spin inline-block' : ''}>
        {children}
      </span>
    </button>
  )
}
