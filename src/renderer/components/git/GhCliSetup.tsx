import { useState } from 'react'
import { Download, ExternalLink, RefreshCw } from 'lucide-react'
import { useGitHubStore } from '../../stores/github-store'

export function GhCliSetup() {
  const ghCliInstalled = useGitHubStore((s) => s.ghCliInstalled)
  const ghCliAuthenticated = useGitHubStore((s) => s.ghCliAuthenticated)
  const checkGhCli = useGitHubStore((s) => s.checkGhCli)
  const installGhCli = useGitHubStore((s) => s.installGhCli)
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState('')

  const handleInstall = async () => {
    setInstalling(true)
    setError('')
    const result = await installGhCli()
    if (!result.success) {
      setError(result.error || 'Installation failed')
    }
    setInstalling(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
      {!ghCliInstalled ? (
        <>
          <Download size={32} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            GitHub CLI not found
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Install the GitHub CLI (gh) to enable PR and Issue management.
          </span>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            >
              <Download size={12} />
              {installing ? 'Installing...' : 'Install Now (winget)'}
            </button>
            <button
              onClick={() => window.api.shell.openExternal('https://cli.github.com')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
            >
              <ExternalLink size={12} />
              Download Page
            </button>
          </div>
          <button
            onClick={() => checkGhCli()}
            className="flex items-center gap-1 mt-2 text-[10px] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={10} />
            Re-check
          </button>
        </>
      ) : !ghCliAuthenticated ? (
        <>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            GitHub CLI not authenticated
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Run <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-overlay)' }}>gh auth login</code> in your terminal to authenticate.
          </span>
          <button
            onClick={() => checkGhCli()}
            className="flex items-center gap-1 mt-2 px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            <RefreshCw size={12} />
            Re-check
          </button>
        </>
      ) : null}
      {error && (
        <span className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{error}</span>
      )}
    </div>
  )
}
