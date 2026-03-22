import { useState, useEffect, useRef } from 'react'
import { Save, FolderOpen, X, Trash2 } from 'lucide-react'
import { useCanvasStore, type CanvasPaneState } from '../../stores/canvas-store'
import { logWarn, logError } from '../../stores/error-store'

interface TemplateData {
  name: string
  panes: Array<{
    type: CanvasPaneState['type']
    x: number
    y: number
    width: number
    height: number
    layoutMode: CanvasPaneState['layoutMode']
    title: string
    browserUrl?: string
  }>
}

export function TemplateManager() {
  const [show, setShow] = useState(false)
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [saveName, setSaveName] = useState('')
  const [mode, setMode] = useState<'save' | 'load'>('load')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setShow((v) => !v)
    window.addEventListener('canvas:toggle-templates', handler)
    return () => window.removeEventListener('canvas:toggle-templates', handler)
  }, [])

  // Load templates list
  useEffect(() => {
    if (!show) return
    loadTemplates()
  }, [show])

  async function loadTemplates() {
    try {
      const list = await window.api.fs.readDir(getTemplatesDir())
      const loaded: TemplateData[] = []
      for (const entry of list as any[]) {
        if (entry.name?.endsWith('.json')) {
          try {
            const content = await window.api.fs.readFile(`${getTemplatesDir()}/${entry.name}`)
            loaded.push(JSON.parse(content))
          } catch (err) { logError('TemplateManager', `Failed to parse template: ${entry.name}`, err) }
        }
      }
      setTemplates(loaded)
    } catch (err) {
      logWarn('TemplateManager', 'Templates directory not found or unreadable', err)
      setTemplates([])
    }
  }

  function getTemplatesDir(): string {
    // Templates stored alongside settings
    return `${process.env.USERPROFILE || process.env.HOME || '~'}/.liteeditor/templates`
  }

  async function saveTemplate() {
    const name = saveName.trim()
    if (!name) return

    const store = useCanvasStore.getState()
    const paneArray = Array.from(store.panes.values())
    const template: TemplateData = {
      name,
      panes: paneArray.map((p) => ({
        type: p.type,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        layoutMode: p.layoutMode,
        title: p.title,
        browserUrl: p.browserUrl
      }))
    }

    try {
      const dir = getTemplatesDir()
      await window.api.fs.ensureDir(dir)
      const fileName = name.replace(/[^a-zA-Z0-9-_]/g, '_') + '.json'
      await window.api.fs.writeFile(`${dir}/${fileName}`, JSON.stringify(template, null, 2))
      setSaveName('')
      setMode('load')
      await loadTemplates()
    } catch (err) {
      console.error('Failed to save template:', err)
    }
  }

  function loadTemplate(template: TemplateData) {
    const store = useCanvasStore.getState()
    store.clearPanes()
    for (const pane of template.panes) {
      store.addPane(pane.type, {
        x: pane.x,
        y: pane.y,
        width: pane.width,
        height: pane.height,
        layoutMode: pane.layoutMode,
        title: pane.title,
        browserUrl: pane.browserUrl
      })
    }
    store.scrollTo(0, 0)
    setShow(false)
  }

  async function deleteTemplate(template: TemplateData) {
    try {
      const dir = getTemplatesDir()
      const fileName = template.name.replace(/[^a-zA-Z0-9-_]/g, '_') + '.json'
      await window.api.fs.deleteFile(`${dir}/${fileName}`)
      await loadTemplates()
    } catch (err) { logError('TemplateManager', 'Failed to delete template', err) }
  }

  if (!show) return null

  return (
    <div
      ref={panelRef}
      className="absolute top-12 right-4 z-50 rounded-lg border shadow-xl min-w-[280px]"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          Canvas Templates
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('save')}
            className="p-1 rounded transition-colors"
            style={{ color: mode === 'save' ? 'var(--accent)' : 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            title="Save Current Layout"
          >
            <Save size={13} />
          </button>
          <button
            onClick={() => setShow(false)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Save mode */}
      {mode === 'save' && (
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTemplate() }}
            placeholder="Template name..."
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
          <button
            onClick={saveTemplate}
            className="px-2 py-1 rounded text-[10px] font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            Save
          </button>
        </div>
      )}

      {/* Template list */}
      <div className="max-h-[300px] overflow-y-auto py-1">
        {templates.length === 0 && (
          <div className="px-3 py-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            No saved templates
          </div>
        )}
        {templates.map((template) => (
          <div
            key={template.name}
            className="flex items-center justify-between px-3 py-1.5 hover:bg-[var(--bg-overlay)] cursor-pointer transition-colors group"
            onClick={() => loadTemplate(template)}
          >
            <div>
              <div className="text-xs" style={{ color: 'var(--text-primary)' }}>{template.name}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {template.panes.length} panes
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteTemplate(template) }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
