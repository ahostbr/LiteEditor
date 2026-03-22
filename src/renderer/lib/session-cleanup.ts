import { useTerminalStore } from '../stores/terminal-store'
import { useBrowserStore } from '../stores/browser-store'
import { logWarn } from '../stores/error-store'

interface CleanupTarget {
  type: string
  terminalSessionId?: string
  terminalSessionIds?: string[]
  browserSessionId?: string
  claudeSessionId?: string
  codexSessionId?: string
}

/**
 * Clean up backend sessions for a pane/panel being removed.
 * Shared between canvas-store.removePane() and zen-store.removePanel().
 */
export function cleanupPaneSession(pane: CleanupTarget): void {
  if (pane.type === 'terminal') {
    const sessions = pane.terminalSessionIds || (pane.terminalSessionId ? [pane.terminalSessionId] : [])
    for (const sid of sessions) {
      try {
        useTerminalStore.getState().removeTerminal(sid)
      } catch (err) {
        logWarn('session-cleanup', `Failed to remove terminal session ${sid}`, err)
      }
    }
  }

  if (pane.type === 'browser' && pane.browserSessionId) {
    try {
      window.api.browser.destroyView(pane.browserSessionId)
      useBrowserStore.getState().removeSession(pane.browserSessionId)
    } catch (err) {
      logWarn('session-cleanup', `Failed to destroy browser session ${pane.browserSessionId}`, err)
    }
  }

  if (pane.type === 'claude' && pane.claudeSessionId) {
    try {
      window.api.claude.destroySession(pane.claudeSessionId)
    } catch (err) {
      logWarn('session-cleanup', `Failed to destroy Claude session ${pane.claudeSessionId}`, err)
    }
  }

  if (pane.type === 'codex' && pane.codexSessionId) {
    try {
      window.api.codex.destroySession(pane.codexSessionId)
    } catch (err) {
      logWarn('session-cleanup', `Failed to destroy Codex session ${pane.codexSessionId}`, err)
    }
  }
}
