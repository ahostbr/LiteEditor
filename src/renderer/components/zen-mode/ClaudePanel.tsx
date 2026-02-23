import { useNativePanelView } from './useNativePanelView'

interface ClaudePanelProps {
  panelId: string
  visible?: boolean
}

export function ClaudePanel({ panelId, visible = true }: ClaudePanelProps) {
  const { containerRef } = useNativePanelView({
    panelId,
    sessionField: 'claudeSessionId',
    visible,
    driver: {
      createSession: () => window.api.claude.createSession(),
      destroySession: (sessionId: string) => window.api.claude.destroySession(sessionId),
      setBounds: (sessionId: string, bounds) => window.api.claude.setBounds(sessionId, bounds),
      showView: (sessionId: string) => window.api.claude.showView(sessionId),
      hideView: (sessionId: string) => window.api.claude.hideView(sessionId)
    }
  })

  return <div ref={containerRef} className="w-full h-full" />
}
