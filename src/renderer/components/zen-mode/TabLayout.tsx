import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Plus, Terminal, FileCode } from 'lucide-react'
import { PanelRenderer } from './PanelRenderer'
import { useZenStore, type ZenPanel } from '../../stores/zen-store'
import { openFileInCurrentMode } from '../../lib/open-file'
import { logWarn } from '../../stores/error-store'
import { useSettingsStore } from '../../stores/settings-store'
import { useUiStore } from '../../stores/ui-store'
import { cn } from '../../lib/cn'
import type { Terminal as XTerminal } from '@xterm/xterm'
import claudeIcon from '../../../../assets/img/claude.png'
import codexIcon from '../../../../assets/img/codex.png'

interface TabLayoutProps {
  panels: ZenPanel[]
}

export function TabLayout({ panels }: TabLayoutProps) {
  const activePanelId = useZenStore((s) => s.activePanelId)
  const setActivePanel = useZenStore((s) => s.setActivePanel)
  const removePanel = useZenStore((s) => s.removePanel)
  const addTerminalPanel = useZenStore((s) => s.addTerminalPanel)
  const addEditorPanel = useZenStore((s) => s.addEditorPanel)
  const reorderPanels = useZenStore((s) => s.reorderPanels)
  const setNativeOverlayOpen = useUiStore((s) => s.setNativeOverlayOpen)
  const termRefs = useRef<Map<string, XTerminal>>(new Map())
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!showAddMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        addMenuRef.current && !addMenuRef.current.contains(e.target as Node) &&
        addBtnRef.current && !addBtnRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAddMenu])

  useEffect(() => {
    setNativeOverlayOpen(showAddMenu)
    return () => setNativeOverlayOpen(false)
  }, [showAddMenu, setNativeOverlayOpen])

  // Auto-focus active terminal when tab changes
  useEffect(() => {
    if (activePanelId) {
      const panel = panels.find((p) => p.id === activePanelId)
      if (panel?.type === 'terminal' && panel.terminalSessionId) {
        setTimeout(() => {
          const term = termRefs.current.get(panel.terminalSessionId!)
          if (term) term.focus()
        }, 0)
      }
    }
  }, [activePanelId])

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      reorderPanels(fromIndex, toIndex)
    }
  }, [reorderPanels])

  const handleCloseTab = useCallback((e: React.MouseEvent, panelId: string) => {
    e.stopPropagation()
    removePanel(panelId)
  }, [removePanel])

  const handleAddTerminal = () => {
    addTerminalPanel()
    setShowAddMenu(false)
  }

  const handleAddEditor = async () => {
    setShowAddMenu(false)
    try {
      const path = await window.api.dialog.openFile()
      if (path) await openFileInCurrentMode(path)
    } catch (err) { logWarn('TabLayout', 'File open cancelled or failed', err) }
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Tab bar */}
      <div
        className="flex items-center h-[32px] shrink-0 overflow-x-auto"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          scrollbarWidth: 'none'
        }}
      >
        <div className="flex items-end h-full flex-1 min-w-0">
          {panels.map((panel, index) => {
            const isActive = panel.id === activePanelId
            return (
              <div
                key={panel.id}
                className={cn(
                  'flex items-center gap-1.5 px-3 h-[31px] shrink-0 cursor-pointer',
                  'transition-colors group relative max-w-[180px]',
                  dragOverIndex === index && 'border-l-2 border-l-[var(--accent)]'
                )}
                style={{
                  backgroundColor: isActive ? 'var(--bg-base)' : 'transparent',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
                onClick={() => setActivePanel(panel.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <span className="text-xs truncate select-none">
                  {panel.title}
                  {panel.isDirty ? ' ●' : ''}
                </span>
                <button
                  onClick={(e) => handleCloseTab(e, panel.id)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    'p-0.5 rounded transition-opacity shrink-0',
                    'opacity-0 group-hover:opacity-60 hover:!opacity-100',
                    isActive && 'opacity-60'
                  )}
                  style={{ color: 'var(--text-muted)' }}
                  title="Close Tab"
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}
        </div>

        {/* New panel button with dropdown */}
        <div className="relative">
          <button
            ref={addBtnRef}
            onClick={() => setShowAddMenu((v) => !v)}
            onMouseDown={(e) => e.preventDefault()}
            className="flex items-center justify-center w-[28px] h-[28px] shrink-0 mx-0.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            title="Add Panel"
          >
            <Plus size={14} />
          </button>
          {showAddMenu && (
            <div
              ref={addMenuRef}
              className="absolute right-0 top-full mt-1 z-50 rounded border shadow-lg py-1 min-w-[160px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border)'
              }}
            >
              <button
                onClick={handleAddTerminal}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <Terminal size={14} /> New Terminal
              </button>
              <button
                onClick={handleAddEditor}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <FileCode size={14} /> Add Editor
              </button>
              <button
                onClick={() => { useZenStore.getState().addClaudePanel(); setShowAddMenu(false) }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <img src={claudeIcon} alt="" width={14} height={14} style={{ imageRendering: 'pixelated' }} /> Claude Code
              </button>
              <button
                onClick={() => { useZenStore.getState().addCodexPanel(); setShowAddMenu(false) }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <img src={codexIcon} alt="" width={14} height={14} style={{ imageRendering: 'pixelated' }} /> Codex
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Panel content — all mounted, only active visible */}
      <div className="flex-1 min-h-0 relative">
        {panels.map((panel) => (
          <div
            key={panel.id}
            className="absolute inset-0 flex flex-col"
            style={{
              visibility: panel.id === activePanelId ? 'visible' : 'hidden',
              zIndex: panel.id === activePanelId ? 1 : 0
            }}
          >
            <PanelRenderer
              panel={panel}
              isActive={panel.id === activePanelId}
              visible={panel.id === activePanelId}
              onFocus={() => setActivePanel(panel.id)}
              onTermRef={(ref) => {
                if (panel.terminalSessionId) {
                  if (ref) termRefs.current.set(panel.terminalSessionId, ref)
                  else termRefs.current.delete(panel.terminalSessionId)
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
