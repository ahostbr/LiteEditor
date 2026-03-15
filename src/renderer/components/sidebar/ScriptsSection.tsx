import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronDown, Play, Hammer, FlaskConical, CheckCircle, Settings, Bug, Rocket, Terminal } from 'lucide-react'
import { useCanvasStore } from '../../stores/canvas-store'

interface DetectedScript {
  id: string
  name: string
  command: string
  source: string
  icon: string
  autoDetected: boolean
}

interface ScriptsSectionProps {
  projectRootPath: string
}

const iconMap: Record<string, React.ReactNode> = {
  play: <Play size={11} />,
  build: <Hammer size={11} />,
  test: <FlaskConical size={11} />,
  lint: <CheckCircle size={11} />,
  configure: <Settings size={11} />,
  debug: <Bug size={11} />,
  rocket: <Rocket size={11} />,
  custom: <Terminal size={11} />
}

export function ScriptsSection({ projectRootPath }: ScriptsSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [scripts, setScripts] = useState<DetectedScript[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (expanded && scripts.length === 0) {
      setLoading(true)
      window.api.project.detectScripts(projectRootPath)
        .then((result) => setScripts(result as DetectedScript[]))
        .catch(() => setScripts([]))
        .finally(() => setLoading(false))
    }
  }, [expanded, projectRootPath, scripts.length])

  const runScript = useCallback((script: DetectedScript) => {
    // Create a terminal pane with the script command
    useCanvasStore.getState().addPane('terminal', {
      title: script.name
    })
    // The terminal auto-creates a session — we'll need to send the command after it initializes
    // Use a small delay to let the PTY session start, then write the command
    setTimeout(() => {
      const panes = useCanvasStore.getState().panes
      // Find the most recently added terminal pane
      let latest: { id: string; terminalSessionId?: string } | null = null
      for (const [, pane] of panes) {
        if (pane.type === 'terminal' && pane.terminalSessionId) {
          latest = pane
        }
      }
      if (latest?.terminalSessionId) {
        window.api.pty.write(latest.terminalSessionId, `${script.command}\r`)
      }
    }, 500)
  }, [])

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 w-full px-2 py-1 text-[11px] transition-colors hover:bg-[var(--bg-muted)]"
        style={{ paddingLeft: '24px', color: 'var(--text-muted)' }}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Terminal size={12} />
        <span className="font-medium">Scripts</span>
        {scripts.length > 0 && (
          <span className="text-[9px] ml-1">({scripts.length})</span>
        )}
      </button>

      {expanded && (
        <div style={{ paddingLeft: '40px' }}>
          {loading ? (
            <div className="text-[10px] py-1" style={{ color: 'var(--text-muted)' }}>Detecting...</div>
          ) : scripts.length === 0 ? (
            <div className="text-[10px] py-1" style={{ color: 'var(--text-muted)' }}>No scripts found</div>
          ) : (
            scripts.map((script) => (
              <button
                key={script.id}
                onClick={() => runScript(script)}
                className="flex items-center gap-1.5 w-full px-1 py-0.5 text-[11px] transition-colors hover:bg-[var(--bg-muted)] rounded"
                style={{ color: 'var(--text-secondary)' }}
                title={script.command}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  {iconMap[script.icon] || iconMap.custom}
                </span>
                <span className="truncate">{script.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
