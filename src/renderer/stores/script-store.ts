import { create } from 'zustand'
import { logWarn } from './error-store'

export interface DetectedScript {
  name: string
  command: string
  isDevServer: boolean
}

export interface RunningScript {
  sessionId: string
  projectId: string
  scriptName: string
  pid: number
  detectedPort: number | null
}

interface ScriptStoreState {
  /** Detected scripts per project (keyed by projectId) */
  scripts: Map<string, DetectedScript[]>
  /** Currently running scripts */
  running: RunningScript[]
  /** Whether detection is in progress per project */
  detecting: Set<string>

  /** Detect scripts for a project from package.json */
  detectScripts: (projectId: string, rootPath: string) => Promise<void>
  /** Start a script */
  startScript: (projectId: string, scriptName: string, cwd: string) => Promise<string | null>
  /** Stop a running script */
  stopScript: (sessionId: string) => Promise<void>
  /** Refresh running scripts list */
  refreshRunning: () => Promise<void>
  /** Get scripts for a project */
  getProjectScripts: (projectId: string) => DetectedScript[]
  /** Check if a script is running */
  isScriptRunning: (projectId: string, scriptName: string) => RunningScript | undefined
  /** Get detected port for a running script */
  getDetectedPort: (projectId: string, scriptName: string) => number | null
}

export const useScriptStore = create<ScriptStoreState>((set, get) => ({
  scripts: new Map(),
  running: [],
  detecting: new Set(),

  detectScripts: async (projectId, rootPath) => {
    const detecting = new Set(get().detecting)
    if (detecting.has(projectId)) return
    detecting.add(projectId)
    set({ detecting })

    try {
      const detected = (await window.api.scripts.detect(rootPath)) as DetectedScript[]
      const scripts = new Map(get().scripts)
      scripts.set(projectId, detected)
      set({ scripts })
    } catch (err) {
      logWarn('script-store', `Failed to detect scripts for project ${projectId}`, err)
    } finally {
      const d = new Set(get().detecting)
      d.delete(projectId)
      set({ detecting: d })
    }
  },

  startScript: async (projectId, scriptName, cwd) => {
    try {
      const sessionId = (await window.api.scripts.start(projectId, scriptName, cwd)) as string
      await get().refreshRunning()
      return sessionId
    } catch (err) {
      logWarn('script-store', `Failed to start script ${scriptName}`, err)
      return null
    }
  },

  stopScript: async (sessionId) => {
    try {
      await window.api.scripts.stop(sessionId)
      await get().refreshRunning()
    } catch (err) {
      logWarn('script-store', `Failed to stop script ${sessionId}`, err)
    }
  },

  refreshRunning: async () => {
    try {
      const running = (await window.api.scripts.running()) as RunningScript[]
      set({ running })
    } catch (err) {
      logWarn('script-store', 'Failed to refresh running scripts', err)
    }
  },

  getProjectScripts: (projectId) => {
    return get().scripts.get(projectId) || []
  },

  isScriptRunning: (projectId, scriptName) => {
    return get().running.find(
      (r) => r.projectId === projectId && r.scriptName === scriptName
    )
  },

  getDetectedPort: (projectId, scriptName) => {
    const running = get().running.find(
      (r) => r.projectId === projectId && r.scriptName === scriptName
    )
    return running?.detectedPort ?? null
  }
}))
