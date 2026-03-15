import { useEffect } from 'react'
import { useRepositoryStore } from '../../stores/repository-store'
import type { Commit } from '../../types/repository'

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return d.toLocaleDateString()
  } catch {
    return dateStr
  }
}

export function HistoryPanel() {
  const commits = useRepositoryStore((s) => s.commits)
  const selectedCommit = useRepositoryStore((s) => s.selectedCommit)
  const selectCommit = useRepositoryStore((s) => s.selectCommit)
  const loadHistory = useRepositoryStore((s) => s.loadHistory)

  useEffect(() => {
    if (commits.length === 0) loadHistory()
  }, [commits.length, loadHistory])

  return (
    <div className="h-full overflow-y-auto">
      {commits.map((commit) => (
        <CommitRow
          key={commit.hash}
          commit={commit}
          isSelected={commit.hash === selectedCommit}
          onClick={() => selectCommit(commit.hash === selectedCommit ? null : commit.hash)}
        />
      ))}
      {commits.length === 0 && (
        <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
          <span className="text-xs">No commits</span>
        </div>
      )}
    </div>
  )
}

function CommitRow({ commit, isSelected, onClick }: { commit: Commit; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      className="px-2 py-1.5 cursor-pointer transition-colors border-b"
      style={{
        backgroundColor: isSelected ? 'var(--bg-overlay)' : undefined,
        borderColor: 'var(--border)'
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>
          {commit.message}
        </span>
        <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
          {commit.shortHash}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
          {commit.authorName}
        </span>
        <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
          {formatDate(commit.date)}
        </span>
      </div>
    </div>
  )
}
