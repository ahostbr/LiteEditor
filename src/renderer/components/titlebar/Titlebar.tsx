import React, { useEffect, useRef, useState } from 'react'
import { Minus, Square, X, Copy, PanelLeft, PanelBottom, Terminal, Code, Plus, LayoutGrid, GripVertical, Layers, PanelTop, ChevronDown, FileCode, Monitor, Globe, Sparkles } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useUiStore } from '../../stores/ui-store'
import { useLayoutStore, type LayoutMode, type GridLayout } from '../../stores/layout-store'
import { useZenStore } from '../../stores/zen-store'
import { MenuBar } from './MenuBar'
import { CommandCenter } from './CommandCenter'

const LAYOUT_OPTIONS: { mode: LayoutMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'grid', icon: <LayoutGrid size={15} />, label: 'Grid Layout' },
  { mode: 'splitter', icon: <GripVertical size={15} />, label: 'Splitter Layout' },
  { mode: 'window', icon: <Layers size={15} />, label: 'Floating Windows' },
  { mode: 'tabs', icon: <PanelTop size={15} />, label: 'Tabbed Layout' }
]

const GRID_OPTIONS: { value: GridLayout; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: '2x2', label: '2x2' },
  { value: '3x3', label: '3x3' }
]

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isSpanned, setIsSpanned] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const terminalPanelVisible = useUiStore((s) => s.terminalPanelVisible)
  const appMode = useUiStore((s) => s.appMode)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const toggleTerminalPanel = useUiStore((s) => s.toggleTerminalPanel)
  const toggleAppMode = useUiStore((s) => s.toggleAppMode)
  const layoutMode = useLayoutStore((s) => s.layoutMode)
  const gridLayout = useLayoutStore((s) => s.gridLayout)
  const setLayoutMode = useLayoutStore((s) => s.setLayoutMode)
  const setGridLayout = useLayoutStore((s) => s.setGridLayout)
  const addTerminalPanel = useZenStore((s) => s.addTerminalPanel)
  const addEditorPanel = useZenStore((s) => s.addEditorPanel)
  const addBrowserPanel = useZenStore((s) => s.addBrowserPanel)
  const addClaudePanel = useZenStore((s) => s.addClaudePanel)

  useEffect(() => {
    window.api.window.isMaximized().then(setIsMaximized)
    window.api.window.isSpanned().then(setIsSpanned)
    const unsubMax = window.api.window.onMaximizeChange(setIsMaximized)
    const unsubSpan = window.api.window.onSpanChange(setIsSpanned)
    return () => { unsubMax(); unsubSpan() }
  }, [])

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

  const handleAddTerminal = () => {
    addTerminalPanel()
    setShowAddMenu(false)
  }

  const handleAddBrowser = () => {
    addBrowserPanel()
    setShowAddMenu(false)
  }

  const handleAddClaude = () => {
    addClaudePanel()
    setShowAddMenu(false)
  }

  const handleAddEditor = async () => {
    setShowAddMenu(false)
    try {
      const path = await window.api.dialog.openFile()
      if (path) {
        const content = await window.api.fs.readFile(path)
        addEditorPanel(path, content)
      }
    } catch { /* ignore */ }
  }

  return (
    <div
      className="flex items-center h-[var(--titlebar-height)] select-none shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        WebkitAppRegion: 'drag' as unknown as string
      } as React.CSSProperties}
    >
      {/* Left: App icon + Menu bar */}
      <div className="flex items-center shrink-0 h-full">
        <div
          className="flex items-center justify-center w-[46px] h-full"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <span className="font-bold text-[13px]" style={{ color: 'var(--accent)' }}>
            LE
          </span>
        </div>
        <MenuBar />
      </div>

      {/* Center: Command center */}
      <div className="flex-1 flex items-center justify-center min-w-0 h-full">
        <CommandCenter />
      </div>

      {/* Right: Layout controls + toggle icons + Window controls */}
      <div className="flex items-center shrink-0 h-full">
        {/* Zen mode layout controls */}
        {appMode === 'zen' && (
          <div className="flex items-center gap-2 mr-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {/* Layout mode buttons */}
            <div className="flex items-center gap-[2px] bg-[var(--bg-overlay)] rounded-[4px] p-[2px]">
              {LAYOUT_OPTIONS.map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setLayoutMode(mode)}
                  className="flex items-center justify-center w-[26px] h-[22px] rounded-[3px] transition-colors"
                  style={{
                    color: layoutMode === mode ? 'var(--accent)' : 'var(--text-muted)',
                    background: layoutMode === mode ? 'var(--bg-muted)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (layoutMode !== mode) e.currentTarget.style.background = 'var(--bg-muted)'
                  }}
                  onMouseLeave={(e) => {
                    if (layoutMode !== mode) e.currentTarget.style.background = 'transparent'
                  }}
                  title={label}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Grid layout selector (only in grid mode) */}
            {layoutMode === 'grid' && (
              <div className="flex items-center gap-[2px]">
                {GRID_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setGridLayout(value)}
                    className="px-1.5 h-[22px] rounded-[3px] text-[11px] transition-colors"
                    style={{
                      color: gridLayout === value ? 'var(--accent)' : 'var(--text-muted)',
                      background: gridLayout === value ? 'var(--bg-muted)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (gridLayout !== value) e.currentTarget.style.background = 'var(--bg-overlay)'
                    }}
                    onMouseLeave={(e) => {
                      if (gridLayout !== value) e.currentTarget.style.background = 'transparent'
                    }}
                    title={`Grid preset: ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Add panel button */}
            <div className="relative">
              <button
                ref={addBtnRef}
                onClick={() => setShowAddMenu((v) => !v)}
                className="flex items-center justify-center w-[26px] h-[22px] rounded-[3px] transition-colors"
                style={{ color: 'var(--text-muted)', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                title="Add Panel"
              >
                <Plus size={15} />
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
                    onClick={handleAddBrowser}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Globe size={14} /> New Browser
                  </button>
                  <button
                    onClick={handleAddClaude}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Sparkles size={14} /> Claude Code
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Separator between zen controls and panel toggles */}
        {appMode === 'zen' && <TitlebarSeparator />}

        {/* Panel toggles */}
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <LayoutToggleButton
            onClick={toggleSidebar}
            active={sidebarVisible}
            title={sidebarVisible ? 'Hide Sidebar (Ctrl+B)' : 'Show Sidebar (Ctrl+B)'}
          >
            <PanelLeft size={15} />
          </LayoutToggleButton>
          {appMode === 'editor' && (
            <LayoutToggleButton
              onClick={toggleTerminalPanel}
              active={terminalPanelVisible}
              title={terminalPanelVisible ? 'Hide Terminal Panel' : 'Show Terminal Panel'}
            >
              <PanelBottom size={15} />
            </LayoutToggleButton>
          )}
          <LayoutToggleButton
            onClick={toggleAppMode}
            active={appMode === 'zen'}
            title={appMode === 'editor' ? 'Enter Zen Mode (Ctrl+Shift+T)' : 'Exit Zen Mode (Ctrl+Shift+T)'}
          >
            {appMode === 'editor' ? <Terminal size={15} /> : <Code size={15} />}
          </LayoutToggleButton>
        </div>

        {/* Separator between panel toggles and window controls */}
        <TitlebarSeparator />

        {/* Window controls */}
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <WindowButton onClick={() => window.api.window.minimize()} title="Minimize">
            <Minus size={16} />
          </WindowButton>
          <WindowButton onClick={() => window.api.window.maximize()} title={isMaximized ? 'Restore Down' : 'Maximize'}>
            {isMaximized ? <Copy size={14} /> : <Square size={14} />}
          </WindowButton>
          <WindowButton
            onClick={() => isSpanned ? window.api.window.restoreSpan() : window.api.window.spanAllMonitors()}
            title={isSpanned ? 'Restore from Multi-Monitor Span' : 'Span Across All Monitors'}
          >
            <Monitor size={14} style={{ color: isSpanned ? 'var(--accent)' : undefined }} />
          </WindowButton>
          <WindowButton
            onClick={() => window.api.window.close()}
            title="Close"
            isClose
          >
            <X size={16} />
          </WindowButton>
        </div>
      </div>
    </div>
  )
}

function TitlebarSeparator() {
  return (
    <div
      className="w-[1px] h-[16px] mx-[10px] shrink-0"
      style={{ backgroundColor: 'var(--border)' }}
    />
  )
}

function LayoutToggleButton({
  children,
  onClick,
  active,
  title,
  ...props
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  title?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-[26px] h-[22px] rounded-[3px] transition-colors"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        background: 'transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-overlay)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
      title={title}
      {...props}
    >
      {children}
    </button>
  )
}

function WindowButton({
  children,
  onClick,
  isClose,
  title,
  ...props
}: {
  children: React.ReactNode
  onClick: () => void
  isClose?: boolean
  title?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-12 h-full transition-colors',
        isClose ? 'hover:bg-red-600' : 'hover:bg-[var(--bg-overlay)]'
      )}
      style={{ color: 'var(--text-secondary)' }}
      title={title}
      {...props}
    >
      {children}
    </button>
  )
}
