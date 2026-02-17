import React from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { Plus, X } from 'lucide-react'
import { TerminalTab } from '../editor/TerminalTab'
import { useTerminalStore } from '../../stores/terminal-store'
import { useUiStore } from '../../stores/ui-store'
import { cn } from '../../lib/cn'

export function TerminalPanel() {
  const sessions = useTerminalStore((s) => s.sessions)
  const activeSessionId = useTerminalStore((s) => s.activeSessionId)
  const addTerminal = useTerminalStore((s) => s.addTerminal)
  const removeTerminal = useTerminalStore((s) => s.removeTerminal)
  const setActiveSession = useTerminalStore((s) => s.setActiveSession)
  const toggleTerminalPanel = useUiStore((s) => s.toggleTerminalPanel)

  const sessionList = sessions

  // Auto-create a terminal if panel is open but empty
  React.useEffect(() => {
    if (sessionList.length === 0) {
      addTerminal()
    }
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-9 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Terminal
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => addTerminal()}
            className="p-1 rounded hover:bg-[var(--bg-muted)] transition-colors"
            title="New Terminal"
          >
            <Plus size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={toggleTerminalPanel}
            className="p-1 rounded hover:bg-[var(--bg-muted)] transition-colors"
            title="Close Panel"
          >
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Session tabs */}
      {sessionList.length > 1 && (
        <div
          className="flex items-center gap-0.5 px-2 h-8 shrink-0 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {sessionList.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors',
                activeSessionId === session.id
                  ? 'bg-[var(--bg-base)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
              )}
            >
              <span className="whitespace-nowrap">{session.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeTerminal(session.id)
                }}
                className="p-0.5 rounded hover:bg-[var(--bg-muted)] opacity-60 hover:opacity-100"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Terminal content */}
      <div className="flex-1 overflow-hidden">
        {sessionList.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--text-muted)' }}>
            No terminals open
          </div>
        ) : sessionList.length === 1 ? (
          <TerminalTab key={sessionList[0].id} sessionId={sessionList[0].id} />
        ) : (
          <PanelGroup direction="horizontal">
            {sessionList.map((session, i) => (
              <React.Fragment key={session.id}>
                {i > 0 && (
                  <PanelResizeHandle
                    className="w-1 shrink-0 hover:bg-[var(--accent)] transition-colors"
                    style={{ backgroundColor: 'var(--border)' }}
                  />
                )}
                <Panel minSize={10}>
                  <TerminalTab sessionId={session.id} />
                </Panel>
              </React.Fragment>
            ))}
          </PanelGroup>
        )}
      </div>
    </div>
  )
}
