import { useEffect, useRef } from 'react'
import { useCanvasStore } from '../stores/canvas-store'

/**
 * Watches for PTY data on all canvas terminal panes.
 * When a non-focused terminal receives output, its notification badge increments.
 * Notifications clear when a pane becomes focused.
 */
export function useTerminalNotifications() {
  const unsubsRef = useRef<Map<string, () => void>>(new Map())
  const lastFocusedRef = useRef<string | null>(null)

  useEffect(() => {
    // Periodic sync: subscribe to PTY data for all terminal session IDs
    function syncSubscriptions() {
      const store = useCanvasStore.getState()
      const currentSubs = unsubsRef.current
      const neededSessions = new Set<string>()
      const sessionToPaneId = new Map<string, string>()

      for (const pane of store.panes.values()) {
        if (pane.type !== 'terminal') continue
        const sessions = pane.terminalSessionIds || (pane.terminalSessionId ? [pane.terminalSessionId] : [])
        for (const sid of sessions) {
          if (sid) {
            neededSessions.add(sid)
            sessionToPaneId.set(sid, pane.id)
          }
        }
      }

      // Remove subscriptions for sessions that no longer exist
      for (const [sid, unsub] of currentSubs) {
        if (!neededSessions.has(sid)) {
          unsub()
          currentSubs.delete(sid)
        }
      }

      // Add subscriptions for new sessions
      for (const sid of neededSessions) {
        if (currentSubs.has(sid)) continue
        const unsub = window.api.pty.onData(sid, () => {
          const s = useCanvasStore.getState()
          const paneId = sessionToPaneId.get(sid)
          if (!paneId || s.focusedPaneId === paneId) return

          const pane = s.panes.get(paneId)
          if (!pane) return

          s.updatePane(paneId, {
            hasNotification: true,
            notificationCount: (pane.notificationCount ?? 0) + 1
          })
        })
        currentSubs.set(sid, unsub)
      }
    }

    // Watch for focus changes to clear notifications + sync subscriptions
    const unsubStore = useCanvasStore.subscribe((state) => {
      // Clear notifications when focus changes
      const focusedId = state.focusedPaneId
      if (focusedId && focusedId !== lastFocusedRef.current) {
        lastFocusedRef.current = focusedId
        const pane = state.panes.get(focusedId)
        if (pane && (pane.hasNotification || (pane.notificationCount ?? 0) > 0)) {
          // Defer to avoid updating during subscribe callback
          queueMicrotask(() => {
            useCanvasStore.getState().updatePane(focusedId, {
              hasNotification: false,
              notificationCount: 0
            })
          })
        }
      }

      // Sync PTY subscriptions when panes change
      syncSubscriptions()
    })

    // Initial sync
    syncSubscriptions()

    return () => {
      unsubStore()
      for (const unsub of unsubsRef.current.values()) unsub()
      unsubsRef.current.clear()
    }
  }, [])
}
