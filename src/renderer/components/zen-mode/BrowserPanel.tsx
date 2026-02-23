import { useEffect } from 'react'
import { useBrowserStore } from '../../stores/browser-store'
import { useZenStore } from '../../stores/zen-store'
import { useNativePanelView } from './useNativePanelView'

interface BrowserPanelProps {
  panelId: string
  initialUrl: string
  visible?: boolean
}

export function BrowserPanel({ panelId, initialUrl, visible = true }: BrowserPanelProps) {
  const registerSession = useBrowserStore((s) => s.registerSession)
  const updateSession = useBrowserStore((s) => s.updateSession)

  const { containerRef, sessionIdRef } = useNativePanelView({
    panelId,
    sessionField: 'browserSessionId',
    visible,
    driver: {
      createSession: () => window.api.browser.createView(initialUrl),
      destroySession: (sessionId: string) => window.api.browser.destroyView(sessionId),
      setBounds: (sessionId: string, bounds) => window.api.browser.setBounds(sessionId, bounds),
      showView: (sessionId: string) => window.api.browser.showView(sessionId),
      hideView: (sessionId: string) => window.api.browser.hideView(sessionId)
    },
    onSessionReady: (sessionId: string) => {
      registerSession(sessionId, initialUrl)
    }
  })

  useEffect(() => {
    const unsub = window.api.browser.onStateUpdate((_event, data) => {
      if (data.sessionId !== sessionIdRef.current) return

      updateSession(data.sessionId, data)
      if (data.title) {
        useZenStore.setState((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId ? { ...panel, title: data.title! } : panel
          )
        }))
      }
    })

    return () => {
      unsub()
    }
  }, [panelId, updateSession])

  return <div ref={containerRef} className="w-full h-full" />
}
