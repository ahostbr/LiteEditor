import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Settings, Copy, Clipboard } from 'lucide-react'
import { useTerminalStore } from '../../stores/terminal-store'
import { useZenStore } from '../../stores/zen-store'
import { cn } from '../../lib/cn'
import type { Terminal } from '@xterm/xterm'

interface TerminalHeaderProps {
  sessionId: string
  panelId: string
  title: string
  isActive: boolean
  onFocus: () => void
  termRef?: Terminal | null
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

export function TerminalHeader({
  sessionId,
  panelId,
  title,
  isActive,
  onFocus,
  termRef,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}: TerminalHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const [showCogMenu, setShowCogMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cogMenuRef = useRef<HTMLDivElement>(null)
  const cogButtonRef = useRef<HTMLButtonElement>(null)
  const renamePanel = useZenStore((s) => s.renamePanel)
  const removePanel = useZenStore((s) => s.removePanel)
  const renameSession = useTerminalStore((s) => s.renameSession)
  const restartTerminal = useTerminalStore((s) => s.restartTerminal)
  const cwd = useTerminalStore((s) => s.sessions.find((sess) => sess.id === sessionId)?.cwd)
  const shell = useTerminalStore((s) => s.sessions.find((sess) => sess.id === sessionId)?.shell)

  const shellName = shell
    ? shell.split(/[\\/]/).pop()?.replace(/\.(exe|cmd)$/i, '') ?? shell
    : null

  const handleCopyId = () => {
    navigator.clipboard.writeText(sessionId)
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!showCogMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        cogMenuRef.current && !cogMenuRef.current.contains(e.target as Node) &&
        cogButtonRef.current && !cogButtonRef.current.contains(e.target as Node)
      ) {
        setShowCogMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCogMenu])

  const handleDoubleClick = () => {
    setEditValue(title)
    setIsEditing(true)
  }

  const handleCommit = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== title) {
      renamePanel(panelId, trimmed)
      renameSession(sessionId, trimmed)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCommit()
    if (e.key === 'Escape') setIsEditing(false)
  }

  const handleChangeDirectory = useCallback(async () => {
    const folder = await window.api.dialog.openFolder()
    if (folder && folder !== cwd) {
      await restartTerminal(sessionId, folder)
    }
    setShowCogMenu(false)
  }, [sessionId, cwd, restartTerminal])

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 h-[60px] shrink-0 cursor-default',
        isActive ? 'border-t-2' : 'border-t-2 border-transparent'
      )}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTopColor: isActive ? 'var(--accent)' : 'transparent',
        borderBottom: '1px solid var(--border)'
      }}
      onClick={onFocus}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-start justify-center min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className="text-lg bg-transparent border border-[var(--accent)] rounded px-1.5 py-0 outline-none w-36"
            style={{ color: 'var(--text-primary)' }}
          />
        ) : (
          <span
            className="text-lg truncate"
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
            onDoubleClick={handleDoubleClick}
          >
            {title}
          </span>
        )}
        <div
          className="flex items-center gap-1.5 text-[15px] leading-none mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <span
            className="font-mono truncate cursor-pointer hover:text-[var(--text-primary)] transition-colors"
            title={`Session ID: ${sessionId} (click to copy)`}
            onClick={(e) => { e.stopPropagation(); handleCopyId() }}
          >
            {sessionId}
          </span>
          {shellName && (
            <>
              <span className="opacity-40">·</span>
              <span className="truncate">{shellName}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (termRef) {
              const selection = termRef.getSelection()
              if (selection) navigator.clipboard.writeText(selection)
            }
          }}
          className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
          title="Copy selection"
        >
          <Copy size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button
          onClick={async (e) => {
            e.stopPropagation()
            try {
              const text = await navigator.clipboard.readText()
              if (text) window.api.pty.write(sessionId, text)
            } catch {}
          }}
          className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
          title="Paste"
        >
          <Clipboard size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="relative">
          <button
            ref={cogButtonRef}
            onClick={(e) => {
              e.stopPropagation()
              setShowCogMenu((v) => !v)
            }}
            className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
            title="Terminal Settings"
          >
            <Settings size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          {showCogMenu && (
            <div
              ref={cogMenuRef}
              className="absolute right-0 top-full mt-1 z-50 rounded border shadow-lg py-2 px-3 min-w-[270px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="text-[15px] mb-1.5 truncate"
                style={{ color: 'var(--text-muted)' }}
                title={cwd || 'Default'}
              >
                {cwd || 'Default'}
              </div>
              <button
                onClick={handleChangeDirectory}
                className="text-lg w-full text-left px-2 py-1.5 rounded hover:bg-[var(--bg-muted)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                Change directory...
              </button>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            removePanel(panelId)
          }}
          className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
          title="Close Terminal Panel"
        >
          <X size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </div>
  )
}
