import { useState, useEffect, useRef } from 'react'
import { Terminal, FileCode, Globe, X } from 'lucide-react'
import { useCanvasStore, type CanvasPaneType } from '../../stores/canvas-store'
import claudeIcon from '../../../../assets/img/claude.png'
import codexIcon from '../../../../assets/img/codex.png'

interface AddPaneMenuProps {
  show?: boolean
  onClose?: () => void
  anchorX?: number
  anchorY?: number
}

export function AddPaneMenu({ show: externalShow, onClose, anchorX, anchorY }: AddPaneMenuProps) {
  const [internalShow, setInternalShow] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const show = externalShow ?? internalShow

  // Listen for keyboard shortcut event
  useEffect(() => {
    const handler = () => setInternalShow(true)
    window.addEventListener('canvas:add-pane-menu', handler)
    return () => window.removeEventListener('canvas:add-pane-menu', handler)
  }, [])

  useEffect(() => {
    if (!show) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setInternalShow(false)
        onClose?.()
      }
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInternalShow(false)
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [show, onClose])

  if (!show) return null

  const addPaneOfType = (type: CanvasPaneType, extra?: Record<string, unknown>) => {
    useCanvasStore.getState().addPane(type, extra as any)
    setInternalShow(false)
    onClose?.()
  }

  const handleAddEditor = async () => {
    try {
      const path = await window.api.dialog.openFile()
      if (path) {
        const content = await window.api.fs.readFile(path)
        // Create Monaco model
        const monaco = (window as any).__monaco
        if (monaco) {
          const uri = monaco.Uri.file(path)
          if (!monaco.editor.getModel(uri)) {
            monaco.editor.createModel(content, undefined, uri)
          }
        }
        const fileName = path.replace(/^.*[\\/]/, '')
        addPaneOfType('editor', { filePath: path, title: fileName })
      }
    } catch { /* ignore */ }
    setInternalShow(false)
    onClose?.()
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded-lg border shadow-xl py-1.5 min-w-[180px]"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        top: anchorY ?? '50%',
        left: anchorX ?? '50%',
        transform: anchorX ? undefined : 'translate(-50%, -50%)'
      }}
    >
      <div className="px-3 py-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Add Pane
      </div>
      <MenuItem icon={<Terminal size={14} />} label="New Terminal" onClick={() => addPaneOfType('terminal')} />
      <MenuItem icon={<FileCode size={14} />} label="Open File Editor" onClick={handleAddEditor} />
      <MenuItem icon={<FileCode size={14} />} label="Unified Editor" onClick={() => addPaneOfType('unified-editor')} />
      <MenuItem icon={<Globe size={14} />} label="New Browser" onClick={() => addPaneOfType('browser')} />
      <MenuItem
        icon={<img src={claudeIcon} alt="" width={14} height={14} style={{ imageRendering: 'pixelated' }} />}
        label="Claude Code"
        onClick={() => addPaneOfType('claude')}
      />
      <MenuItem
        icon={<img src={codexIcon} alt="" width={14} height={14} style={{ imageRendering: 'pixelated' }} />}
        label="Codex"
        onClick={() => addPaneOfType('codex')}
      />
    </div>
  )
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-1.5 text-xs hover:bg-[var(--bg-overlay)] transition-colors"
      style={{ color: 'var(--text-primary)' }}
    >
      {icon}
      {label}
    </button>
  )
}
