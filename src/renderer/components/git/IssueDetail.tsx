import { useState } from 'react'
import { GitBranch, X, Send } from 'lucide-react'
import { useGitHubStore } from '../../stores/github-store'
import { useDialogStore } from '../../stores/dialog-store'

export function IssueDetail() {
  const issueDetail = useGitHubStore((s) => s.issueDetail)
  const issueComments = useGitHubStore((s) => s.issueComments)
  const commentOnIssue = useGitHubStore((s) => s.commentOnIssue)
  const closeIssue = useGitHubStore((s) => s.closeIssue)
  const reopenIssue = useGitHubStore((s) => s.reopenIssue)
  const createBranchFromIssue = useGitHubStore((s) => s.createBranchFromIssue)
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!issueDetail) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
        <span className="text-xs">Select an issue to view details</span>
      </div>
    )
  }

  const handleClose = async () => {
    const result = await useDialogStore.getState().showDialog({
      title: 'Close Issue',
      message: `Close issue #${issueDetail.number} "${issueDetail.title}"?`,
      buttons: [
        { label: 'Close Issue', variant: 'destructive' },
        { label: 'Cancel', variant: 'muted' }
      ],
      cancelIndex: 1
    })
    if (result === 0) await closeIssue(issueDetail.number)
  }

  const handleReopen = async () => {
    await reopenIssue(issueDetail.number)
  }

  const handleComment = async () => {
    if (!commentBody.trim()) return
    setSubmitting(true)
    await commentOnIssue(issueDetail.number, commentBody.trim())
    setCommentBody('')
    setSubmitting(false)
  }

  const handleCreateBranch = async () => {
    await createBranchFromIssue(issueDetail.number, issueDetail.title)
  }

  const stateColor = issueDetail.state === 'open' ? '#22c55e' : '#a855f7'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
            #{issueDetail.number} {issueDetail.title}
          </span>
          <span className="text-[9px] px-1.5 rounded font-medium capitalize" style={{ backgroundColor: `${stateColor}20`, color: stateColor }}>
            {issueDetail.state}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>{issueDetail.author.login}</span>
          <span>·</span>
          <span>{new Date(issueDetail.createdAt).toLocaleDateString()}</span>
          {issueDetail.labels.map((l) => (
            <span key={l.name} className="text-[8px] px-1 rounded" style={{ backgroundColor: `#${l.color}30`, color: `#${l.color}` }}>
              {l.name}
            </span>
          ))}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={handleCreateBranch}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
          >
            <GitBranch size={10} />
            Create Branch
          </button>
          <div className="flex-1" />
          {issueDetail.state === 'open' ? (
            <button
              onClick={handleClose}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium"
              style={{ color: '#ef4444' }}
            >
              <X size={10} /> Close
            </button>
          ) : (
            <button
              onClick={handleReopen}
              className="px-2 py-1 rounded text-[10px] font-medium"
              style={{ color: '#22c55e' }}
            >
              Reopen
            </button>
          )}
        </div>
      </div>

      {/* Body + Comments */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {/* Issue body */}
        {issueDetail.body && (
          <div className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {issueDetail.body}
          </div>
        )}

        {/* Divider */}
        {issueComments.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)' }} />
        )}

        {/* Comments */}
        {issueComments.map((c) => (
          <div key={c.id} className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{c.author.login}</span>
              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-[11px] whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
              {c.body}
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      <div className="flex items-center gap-1.5 px-3 py-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <input
          type="text"
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-2 py-1.5 rounded text-[11px] outline-none"
          style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          onKeyDown={(e) => { if (e.key === 'Enter' && commentBody.trim()) handleComment() }}
        />
        <button
          onClick={handleComment}
          disabled={!commentBody.trim() || submitting}
          className="p-1.5 rounded transition-colors disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  )
}
