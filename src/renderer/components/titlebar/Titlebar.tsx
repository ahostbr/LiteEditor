import React, { useEffect, useState } from 'react'
import { Minus, Square, X, Copy, PanelLeft, PanelBottom } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useUiStore } from '../../stores/ui-store'
import { MenuBar } from './MenuBar'
import { CommandCenter } from './CommandCenter'

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const terminalPanelVisible = useUiStore((s) => s.terminalPanelVisible)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const toggleTerminalPanel = useUiStore((s) => s.toggleTerminalPanel)

  useEffect(() => {
    window.api.window.isMaximized().then(setIsMaximized)
    const unsub = window.api.window.onMaximizeChange(setIsMaximized)
    return unsub
  }, [])

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

      {/* Right: Layout toggle icons + Window controls */}
      <div className="flex items-center shrink-0 h-full">
        {/* Layout toggles */}
        <div className="flex items-center gap-[2px] mr-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <LayoutToggleButton
            onClick={toggleSidebar}
            active={sidebarVisible}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft size={15} />
          </LayoutToggleButton>
          <LayoutToggleButton
            onClick={toggleTerminalPanel}
            active={terminalPanelVisible}
            aria-label="Toggle Terminal"
          >
            <PanelBottom size={15} />
          </LayoutToggleButton>
        </div>

        {/* Window controls */}
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <WindowButton onClick={() => window.api.window.minimize()} aria-label="Minimize">
            <Minus size={16} />
          </WindowButton>
          <WindowButton onClick={() => window.api.window.maximize()} aria-label="Maximize">
            {isMaximized ? <Copy size={14} /> : <Square size={14} />}
          </WindowButton>
          <WindowButton
            onClick={() => window.api.window.close()}
            aria-label="Close"
            isClose
          >
            <X size={16} />
          </WindowButton>
        </div>
      </div>
    </div>
  )
}

function LayoutToggleButton({
  children,
  onClick,
  active,
  ...props
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
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
  ...props
}: {
  children: React.ReactNode
  onClick: () => void
  isClose?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-12 h-full transition-colors',
        isClose ? 'hover:bg-red-600' : 'hover:bg-[var(--bg-overlay)]'
      )}
      style={{ color: 'var(--text-secondary)' }}
      {...props}
    >
      {children}
    </button>
  )
}
