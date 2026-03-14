import { useEffect, useRef } from 'react'
import { useTerminalStore } from '../../stores/terminal-store'
import { useCanvasStore, type CanvasPaneState } from '../../stores/canvas-store'
import { useSettingsStore } from '../../stores/settings-store'
import { useEditorStore } from '../../stores/editor-store'
import { TerminalInstance } from '../zen-mode/TerminalInstance'
import { ZenMonacoEditor } from '../zen-mode/ZenMonacoEditor'
import { ZenUnifiedEditor } from '../zen-mode/ZenUnifiedEditor'
import { BrowserPanel } from '../zen-mode/BrowserPanel'
import { ClaudePanel } from '../zen-mode/ClaudePanel'
import { CodexPanel } from '../zen-mode/CodexPanel'

interface CanvasPanelRendererProps {
  pane: CanvasPaneState
  isFocused: boolean
}

export function CanvasPanelRenderer({ pane, isFocused }: CanvasPanelRendererProps) {
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
    return <BrowserPanel panelId={pane.id} initialUrl={pane.browserUrl || 'https://www.google.com'} visible={true} />
  }

  if (pane.type === 'claude') {
    return <ClaudePanel panelId={pane.id} visible={true} />
  }

  if (pane.type === 'codex') {
    return <CodexPanel panelId={pane.id} visible={true} />
  }

  return null
}
