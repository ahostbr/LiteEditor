import { useState, useRef, useEffect } from 'react'
import { GripHorizontal, X, Minus, Terminal, FileCode, Globe, Plus, Settings, GitBranch, Maximize2, Minimize2, FolderOpen } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useCanvasStore, type CanvasPaneState } from '../../stores/canvas-store'
import { useTerminalStore } from '../../stores/terminal-store'
import { useSettingsStore } from '../../stores/settings-store'
import { useEditorStore } from '../../stores/editor-store'
import { useUiStore } from '../../stores/ui-store'
import { cn } from '../../lib/cn'

interface PaneHeaderProps {
  pane: CanvasPaneState
  isFocused: boolean
  onDragStart: (e: React.PointerEvent) => void
}

function getPaneTypeIcon(type: string) {
  switch (type) {
    case 'terminal': return <Terminal size={13} />
    case 'editor':
    case 'unified-editor': return <FileCode size={13} />
    case 'browser': return <Globe size={13} />
    case 'claude': return <span className="text-[11px] font-bold">C</span>
    case 'codex': return <span className="text-[11px] font-bold">X</span>
    case 'git': return <GitBranch size={13} />
    default: return null
  }
}

export function PaneHeader({ pane, isFocused, onDragStart }: PaneHeaderProps) {
  const removePane = useCanvasStore((s) => s.removePane)
  const updatePane = useCanvasStore((s) => s.updatePane)
  const maximizedPaneId = useCanvasStore((s) => s.maximizedPaneId)
  const toggleMaximizePane = useCanvasStore((s) => s.toggleMaximizePane)
  const isMaximized = maximizedPaneId === pane.id

  const activeSessionId = pane.type === 'terminal'
    ? (pane.terminalSessionIds?.[pane.activeTerminalIndex ?? 0] ?? pane.terminalSessionId)
    : null
  const cwd = useTerminalStore((s) =>
    activeSessionId ? s.sessions.find((sess) => sess.id === activeSessionId)?.cwd : undefined
  )
  const shellNames = useTerminalStore(useShallow((s) => {
    const sids = pane.type === 'terminal'
      ? (pane.terminalSessionIds || (pane.terminalSessionId ? [pane.terminalSessionId] : []))
      : []
    return sids.map(sid => {
      const sess = s.sessions.find((sess) => sess.id === sid)
      return sess?.shell
        ? sess.shell.split(/[\\\/]/).pop()?.replace(/\.(exe|cmd)$/i, '') ?? 'term'
        : 'term'
    })
  }))
  const [renamingTabIndex, setRenamingTabIndex] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const sessions = pane.type === 'terminal' ? (pane.terminalSessionIds || (pane.terminalSessionId ? [pane.terminalSessionId] : [])) : []
  const activeIndex = pane.activeTerminalIndex ?? 0
  const tabNames = pane.terminalTabNames || []

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingTabIndex !== null && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingTabIndex])

  const getTabLabel = (index: number): string => {
    if (tabNames[index]) return tabNames[index]
    const name = shellNames[index] || 'term'
    const priorSame = shellNames.slice(0, index).filter(n => n === name).length
    return priorSame > 0 ? `${name} ${priorSame + 1}` : name
  }

  const handleAddTerminalTab = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const projectRoot = useEditorStore.getState().projectRoot
    const configuredCwd = useSettingsStore.getState().defaultTerminalCwd.trim()
    const cwd = configuredCwd || projectRoot || undefined

    try {
      const sessionId = await window.api.pty.create(undefined, cwd)
      useTerminalStore.getState().createSession(sessionId, undefined, cwd)
      const currentSessions = pane.terminalSessionIds || (pane.terminalSessionId ? [pane.terminalSessionId] : [])
      const currentNames = pane.terminalTabNames || []
      const newSessions = [...currentSessions, sessionId]
      const newNames = [...currentNames]
      // Pad names array if needed
      while (newNames.length < newSessions.length) newNames.push('')
      useCanvasStore.getState().updatePane(pane.id, {
        terminalSessionIds: newSessions,
        terminalTabNames: newNames,
        activeTerminalIndex: newSessions.length - 1,
        title: `Terminal (${newSessions.length})`
      })
    } catch (err) {
      console.error('Failed to create terminal tab:', err)
    }
  }

  const handleSwitchTab = (index: number) => {
    updatePane(pane.id, { activeTerminalIndex: index })
  }

  const handleCloseTab = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    // Read fresh state from store to avoid stale closures
    const store = useCanvasStore.getState()
    const currentPane = store.panes.get(pane.id)
    if (!currentPane) return

    const currentSessions = currentPane.terminalSessionIds || (currentPane.terminalSessionId ? [currentPane.terminalSessionId] : [])
    const sessionId = currentSessions[index]
    if (!sessionId) return

    const newSessions = currentSessions.filter((_: string, i: number) => i !== index)
    const newNames = (currentPane.terminalTabNames || []).filter((_: string, i: number) => i !== index)

    if (newSessions.length === 0) {
      // Last tab closed — remove the pane, then clean up PTY
      store.removePane(pane.id)
      useTerminalStore.getState().removeTerminal(sessionId)
      return
    }

    // Update canvas store FIRST (removes tab from UI)
    const currentActive = currentPane.activeTerminalIndex ?? 0
    const newActive = Math.min(currentActive, newSessions.length - 1)
    store.updatePane(pane.id, {
      terminalSessionIds: newSessions,
      terminalTabNames: newNames,
      terminalSessionId: newSessions[newActive],
      activeTerminalIndex: newActive,
      title: newSessions.length > 1 ? `Terminal (${newSessions.length})` : 'Terminal'
    })

    // THEN clean up PTY (removeTerminal already calls pty.kill)
    useTerminalStore.getState().removeTerminal(sessionId)
  }

  const handleTabContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setRenameValue(tabNames[index] || '')
    setRenamingTabIndex(index)
  }

  const commitRename = () => {
    if (renamingTabIndex === null) return
    const newNames = [...(pane.terminalTabNames || [])]
    // Pad if needed
    while (newNames.length <= renamingTabIndex) newNames.push('')
    newNames[renamingTabIndex] = renameValue.trim()
    updatePane(pane.id, { terminalTabNames: newNames })
    setRenamingTabIndex(null)
  }

  const cancelRename = () => {
    setRenamingTabIndex(null)
  }

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation()
    const ui = useUiStore.getState()
    if (!ui.settingsPanelVisible) {
      ui.toggleSettingsPanel()
    }
  }

  const headerHeight = pane.type === 'terminal' && cwd ? 44 : 32

  return (
    <div
      className={cn(
        'flex items-center justify-between px-2 shrink-0 select-none',
        isFocused ? 'border-t-2' : 'border-t-2 border-transparent'
      )}
      style={{
        height: headerHeight,
        backgroundColor: isFocused ? 'var(--bg-muted)' : 'var(--bg-surface)',
        borderTopColor: isFocused ? 'var(--accent)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        cursor: 'grab'
      }}
      onPointerDown={onDragStart}
    >
      {/* Left: drag handle + type icon + title / terminal tabs + cwd */}
      <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        <GripHorizontal size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

        {pane.type === 'terminal' ? (
          // Terminal tabs — always show (single or multiple)
          <div className="flex items-center gap-0 min-w-0 overflow-hidden">
            {sessions.map((sid, i) => (
              <div
                key={sid}
                className={cn(
                  'flex items-center gap-1 px-1.5 h-[22px] text-[10px] rounded-t transition-colors shrink-0 cursor-pointer',
                  i === activeIndex ? 'bg-[var(--bg-overlay)]' : 'hover:bg-[var(--bg-overlay)]'
                )}
                style={{
                  color: i === activeIndex ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: i === activeIndex ? '1px solid var(--accent)' : '1px solid transparent'
                }}
                onClick={(e) => { e.stopPropagation(); handleSwitchTab(i) }}
                onPointerDown={(e) => e.stopPropagation()}
                onContextMenu={(e) => handleTabContextMenu(e, i)}
              >
                <Terminal size={10} />
                {renamingTabIndex === i ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      else if (e.key === 'Escape') cancelRename()
                    }}
                    onBlur={commitRename}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-[48px] h-[14px] text-[10px] bg-[var(--bg-base)] border border-[var(--accent)] rounded px-0.5 outline-none"
                    style={{ color: 'var(--text-primary)' }}
                    placeholder={shellNames[i] || 'term'}
                  />
                ) : (
                  getTabLabel(i)
                )}
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleCloseTab(e, i)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="ml-0.5 rounded hover:bg-[rgba(220,38,38,0.3)] hover:text-[#ef4444] transition-colors flex items-center justify-center"
                    style={{ padding: '1px', cursor: 'pointer', lineHeight: 0 }}
                    title="Close Tab"
                  >
                    <X size={8} />
                  </button>
                )}
              </div>
            ))}
            {/* Add tab button — inline with tabs on the left */}
            <button
              onClick={handleAddTerminalTab}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              title="New Terminal Tab"
            >
              <Plus size={11} />
            </button>
          </div>
        ) : (
          // Standard title
          <>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              {getPaneTypeIcon(pane.type)}
            </span>
            <span
              className="text-xs truncate"
              style={{ color: isFocused ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {pane.title}
            </span>
          </>
        )}

        {pane.isDirty && (
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
        )}
        {pane.hasNotification && (
          <span
            className="text-[10px] px-1 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            {pane.notificationCount || '!'}
          </span>
        )}
      </div>
      {pane.type === 'terminal' && cwd && (
        <div className="flex items-center gap-1 text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>
          <FolderOpen size={9} className="shrink-0 opacity-60" />
          <span className="font-mono truncate">{cwd}</span>
        </div>
      )}
      </div>

      {/* Right: add tab + settings + fullscreen + minimize + close */}
      <div
        className="flex items-center gap-0.5 shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Settings */}
        <button
          onClick={handleOpenSettings}
          className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          title="Settings"
        >
          <Settings size={11} />
        </button>

        {/* Fullscreen */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleMaximizePane(pane.id) }}
          className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          onPointerDown={(e) => e.stopPropagation()}
          title={isMaximized ? 'Restore' : 'Fullscreen'}
        >
          {isMaximized ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
        </button>

        {/* Minimize */}
        <button
          onClick={() => updatePane(pane.id, { minimized: !pane.minimized })}
          className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          title={pane.minimized ? 'Restore' : 'Minimize'}
        >
          <Minus size={12} />
        </button>

        {/* Close */}
        <button
          onClick={() => removePane(pane.id)}
          className="flex items-center justify-center w-[20px] h-[20px] rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.3)'
            e.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
          title="Close Pane"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
