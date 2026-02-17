import React, { useEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'

interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const info = window.api.appInfo

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const infoString = [
    `v${info.version}`,
    info.commitHash,
    info.buildDate,
    `Electron ${info.electronVersion}`,
    `Node ${info.nodeVersion}`,
    info.platform
  ].join(' \u00b7 ')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        className="rounded-lg shadow-2xl min-w-[380px] max-w-[480px]"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="px-5 pt-5 pb-4 flex flex-col items-center gap-3">
          <span className="font-bold text-2xl" style={{ color: 'var(--accent)' }}>
            LiteEditor
          </span>
          <p
            className="text-xs text-center leading-relaxed select-text"
            style={{ color: 'var(--text-muted)' }}
          >
            {infoString}
          </p>
        </div>
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <AboutLink href="https://github.com/ahostbr/LiteSpeak" label="GitHub" />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function AboutLink({ href, label }: { href: string; label: string }) {
  return (
    <button
      onClick={() => window.api.shell.openExternal(href)}
      className="flex items-center gap-1 text-xs transition-colors hover:underline"
      style={{ color: 'var(--accent)' }}
    >
      <ExternalLink size={11} />
      {label}
    </button>
  )
}
