import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Loader2 } from 'lucide-react'
import { useTerminalStore } from '../../stores/terminal-store'
import { useCanvasStore, type CanvasPaneState } from '../../stores/canvas-store'
import { useSettingsStore } from '../../stores/settings-store'
import { useEditorStore } from '../../stores/editor-store'
import { useBrowserStore } from '../../stores/browser-store'
import { TerminalInstance } from '../zen-mode/TerminalInstance'
import { ZenMonacoEditor } from '../zen-mode/ZenMonacoEditor'
import { ZenUnifiedEditor } from '../zen-mode/ZenUnifiedEditor'
import { BrowserPanel } from '../zen-mode/BrowserPanel'
import { ClaudePanel } from '../zen-mode/ClaudePanel'
import { CodexPanel } from '../zen-mode/CodexPanel'
import { RepositoryView } from '../git/RepositoryView'

interface CanvasPanelRendererProps {
  pane: CanvasPaneState
  isFocused: boolean
}

export function CanvasPanelRenderer({ pane, isFocused }: CanvasPanelRendererProps) {
  const maximizedPaneId = useCanvasStore((s) => s.maximizedPaneId)
  const isVisible = !maximizedPaneId || maximizedPaneId === pane.id
  const sessionCreatedRef = useRef(false)

  // Auto-create terminal session if needed
  useEffect(() => {
    if (pane.type === 'terminal' && !pane.terminalSessionId && !sessionCreatedRef.current) {
      sessionCreatedRef.current = true
      const projectRoot = useEditorStore.getState().projectRoot
      const configuredCwd = useSettingsStore.getState().defaultTerminalCwd.trim()
      const cwd = configuredCwd || projectRoot || undefined

      window.api.pty.create(undefined, cwd).then((sessionId: string) => {
        useTerminalStore.getState().createSession(sessionId, undefined, cwd)
        useCanvasStore.getState().updatePane(pane.id, {
          terminalSessionId: sessionId,
          terminalSessionIds: [sessionId],
          activeTerminalIndex: 0,
          title: `Terminal`
        })
      }).catch((err: unknown) => {
        console.error('Failed to create terminal for canvas pane:', err)
      })
    }
  }, [pane.id, pane.type, pane.terminalSessionId])

  if (pane.type === 'terminal') {
    if (!pane.terminalSessionId) {
      return (
        <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
          <span className="text-sm">Starting terminal...</span>
        </div>
      )
    }
    // Render the active terminal session (supports multi-tab)
    const sessions = pane.terminalSessionIds || [pane.terminalSessionId]
    const activeIndex = pane.activeTerminalIndex ?? 0
    const activeSessionId = sessions[activeIndex] || pane.terminalSessionId
    return <TerminalInstance sessionId={activeSessionId} />
  }

  if (pane.type === 'editor' && pane.filePath) {
    return <ZenMonacoEditor filePath={pane.filePath} panelId={pane.id} />
  }

  if (pane.type === 'unified-editor') {
    return <ZenUnifiedEditor />
  }

  if (pane.type === 'browser') {
    return (
      <div className="flex flex-col h-full">
        <BrowserNavBar paneId={pane.id} browserSessionId={pane.browserSessionId} />
        <div className="flex-1 min-h-0">
          <BrowserPanel panelId={pane.id} initialUrl={pane.browserUrl || 'https://www.google.com'} visible={isVisible} />
        </div>
      </div>
    )
  }

  if (pane.type === 'claude') {
    return <ClaudePanel panelId={pane.id} visible={isVisible} />
  }

  if (pane.type === 'codex') {
    return <CodexPanel panelId={pane.id} visible={isVisible} />
  }

  if (pane.type === 'git') {
    return <RepositoryView />
  }

  return null
}

function BrowserNavBar({ paneId, browserSessionId }: { paneId: string; browserSessionId?: string }) {
  const [urlInput, setUrlInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const session = useBrowserStore((s) => browserSessionId ? s.sessions.get(browserSessionId) : undefined)

  const canGoBack = session?.canGoBack ?? false
  const canGoForward = session?.canGoForward ?? false
  const isLoading = session?.isLoading ?? false
  const currentUrl = session?.url ?? ''
  const displayUrl = isFocused ? urlInput : currentUrl

  const handleUrlSubmit = () => {
    const value = urlInput.trim()
    if (!value || !browserSessionId) return
    let targetUrl = value
    if (/^[\w-]+(\.[\w-]+)+/.test(value) && !value.includes(' ')) {
      if (!/^https?:\/\//i.test(value)) targetUrl = 'https://' + value
    } else if (!/^https?:\/\//i.test(value) && !/^file:\/\//i.test(value)) {
      targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(value)
    }
    window.api.browser.navigate(browserSessionId, targetUrl)
    inputRef.current?.blur()
  }

  return (
    <div
      className="flex items-center gap-1 px-2 h-[32px] shrink-0"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      <button
        onClick={() => browserSessionId && window.api.browser.goBack(browserSessionId)}
        disabled={!canGoBack}
        className="p-0.5 rounded hover:bg-[var(--bg-muted)] disabled:opacity-25"
        title="Back"
      >
        <ArrowLeft size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
      <button
        onClick={() => browserSessionId && window.api.browser.goForward(browserSessionId)}
        disabled={!canGoForward}
        className="p-0.5 rounded hover:bg-[var(--bg-muted)] disabled:opacity-25"
        title="Forward"
      >
        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
      <button
        onClick={() => {
          if (!browserSessionId) return
          isLoading ? window.api.browser.stop(browserSessionId) : window.api.browser.reload(browserSessionId)
        }}
        className="p-0.5 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100"
        title={isLoading ? 'Stop' : 'Reload'}
      >
        {isLoading
          ? <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          : <RotateCw size={14} style={{ color: 'var(--text-muted)' }} />
        }
      </button>
      <input
        ref={inputRef}
        value={displayUrl}
        onChange={(e) => setUrlInput(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') handleUrlSubmit()
          if (e.key === 'Escape') { setUrlInput(currentUrl); inputRef.current?.blur() }
        }}
        onFocus={() => { setUrlInput(currentUrl); setIsFocused(true); setTimeout(() => inputRef.current?.select(), 0) }}
        onBlur={() => setIsFocused(false)}
        placeholder="Search or enter URL"
        className="flex-1 min-w-0 h-[22px] px-2 rounded text-[11px] outline-none border"
        style={{
          backgroundColor: 'var(--bg-overlay)',
          borderColor: isFocused ? 'var(--accent)' : 'var(--border)',
          color: 'var(--text-primary)'
        }}
      />
    </div>
  )
}
