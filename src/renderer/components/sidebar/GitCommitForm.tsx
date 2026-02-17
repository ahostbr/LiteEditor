import React from 'react'
import { useGitStore } from '../../stores/git-store'

export function GitCommitForm() {
  const {
    commitSummary, setCommitSummary,
    commitDescription, setCommitDescription,
    createCommit, changedFiles
  } = useGitStore()

  const stagedCount = changedFiles.filter((f) => f.staged).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (commitSummary.trim() && stagedCount > 0) {
      createCommit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 py-2"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <input
        value={commitSummary}
        onChange={(e) => setCommitSummary(e.target.value)}
        placeholder="Commit message"
        className="w-full px-2 py-1.5 text-sm rounded outline-none"
        style={{
          backgroundColor: 'var(--bg-overlay)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)'
        }}
      />
      <textarea
        value={commitDescription}
        onChange={(e) => setCommitDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full px-2 py-1 text-xs rounded outline-none mt-1 resize-none"
        style={{
          backgroundColor: 'var(--bg-overlay)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)'
        }}
      />
      <button
        type="submit"
        disabled={!commitSummary.trim() || stagedCount === 0}
        className="w-full mt-1 py-1.5 text-sm rounded transition-colors disabled:opacity-40"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--bg-base)'
        }}
      >
        Commit ({stagedCount} staged)
      </button>
    </form>
  )
}
