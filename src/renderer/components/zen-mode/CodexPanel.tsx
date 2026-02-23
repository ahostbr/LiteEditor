import { useNativePanelView } from './useNativePanelView'

interface CodexPanelProps {
  panelId: string
  visible?: boolean
}

export function CodexPanel({ panelId, visible = true }: CodexPanelProps) {
  const { containerRef } = useNativePanelView({
    panelId,
    sessionField: 'codexSessionId',
    visible,
    driver: {
      createSession: () => window.api.codex.createSession(),
      destroySession: (sessionId: string) => window.api.codex.destroySession(sessionId),
      setBounds: (sessionId: string, bounds) => window.api.codex.setBounds(sessionId, bounds),
      showView: (sessionId: string) => window.api.codex.showView(sessionId),
      hideView: (sessionId: string) => window.api.codex.hideView(sessionId)
    }
  })

  return <div ref={containerRef} className="w-full h-full" />
}
