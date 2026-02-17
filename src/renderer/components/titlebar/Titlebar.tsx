import React, { useEffect, useState } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useEditorStore } from '../../stores/editor-store'

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const projectRoot = useEditorStore((s) => s.projectRoot)

  useEffect(() => {
    window.api.window.isMaximized().then(setIsMaximized)
    const unsub = window.api.window.onMaximizeChange(setIsMaximized)
    return unsub
  }, [])

  const projectName = projectRoot?.split(/[\\/]/).pop() || ''

  return (
    <div
      className="flex items-center justify-between h-[var(--titlebar-height)] select-none shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        WebkitAppRegion: 'drag' as unknown as string
      } as React.CSSProperties}
    >
      {/* Left: App title */}
      <div className="flex items-center gap-2 pl-4" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>
          LiteEditor
        </span>
        {projectName && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>—</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {projectName}
            </span>
          </>
        )}
      </div>

      {/* Right: Window controls */}
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
