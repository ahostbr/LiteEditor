import React, { useEffect } from 'react'
import { useGitStore } from '../../stores/git-store'
import { useEditorStore } from '../../stores/editor-store'
import { GitChanges } from './GitChanges'
import { GitCommitForm } from './GitCommitForm'
import { GitToolbar } from './GitToolbar'
import { GitBranches } from './GitBranches'
import { GitHistory } from './GitHistory'

export function GitPanel() {
  const projectRoot = useEditorStore((s) => s.projectRoot)
  const { refreshStatus, loadBranches, loadHistory, isLoading } = useGitStore()

  useEffect(() => {
    if (projectRoot) {
      refreshStatus()
      loadBranches()
      loadHistory()
    }
  }, [projectRoot])

  if (!projectRoot) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          Open a folder to use source control
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Source Control
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <GitToolbar />
        <GitCommitForm />
        <GitChanges />
        <GitBranches />
        <GitHistory />
      </div>
    </div>
  )
}
