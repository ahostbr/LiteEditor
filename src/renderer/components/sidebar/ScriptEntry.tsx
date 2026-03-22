import { useCallback } from 'react'
import { Play, Square, Globe } from 'lucide-react'
import { useScriptStore, type DetectedScript } from '../../stores/script-store'
import { StatusDot } from './StatusDot'

interface ScriptEntryProps {
  script: DetectedScript
  projectId: string
  projectRootPath: string
}

export function ScriptEntry({ script, projectId, projectRootPath }: ScriptEntryProps) {
  const startScript = useScriptStore((s) => s.startScript)
  const stopScript = useScriptStore((s) => s.stopScript)
  const runningScript = useScriptStore((s) => s.isScriptRunning(projectId, script.name))
  const isRunning = !!runningScript
  const detectedPort = runningScript?.detectedPort ?? null

  const handleToggle = useCallback(async () => {
    if (isRunning && runningScript) {
      await stopScript(runningScript.sessionId)
    } else {
      await startScript(projectId, script.name, projectRootPath)
    }
  }, [isRunning, runningScript, startScript, stopScript, projectId, script.name, projectRootPath])

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 group transition-colors hover:bg-[var(--bg-overlay)]"
      style={{ paddingLeft: '32px' }}
    >
      <StatusDot
        state={isRunning ? 'running' : 'idle'}
        size="sm"
        title={isRunning ? `Running (PID ${runningScript?.pid})` : 'Stopped'}
      />
      <span
        className="text-[10px] truncate flex-1"
        style={{ color: isRunning ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {script.name}
      </span>

      {/* Port badge */}
      {detectedPort && (
        <span
          className="text-[8px] px-1 rounded shrink-0 flex items-center gap-0.5"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
        >
          <Globe size={7} />
          {detectedPort}
        </span>
      )}

      {/* Run/Stop button */}
      <button
        onClick={handleToggle}
        className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: isRunning ? '#ef4444' : 'var(--text-muted)' }}
        title={isRunning ? `Stop ${script.name}` : `Run ${script.name}`}
      >
        {isRunning ? <Square size={10} /> : <Play size={10} />}
      </button>
    </div>
  )
}
