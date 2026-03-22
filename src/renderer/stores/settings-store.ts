import { create } from 'zustand'
import { DEFAULT_SETTINGS } from '../lib/constants'
import { logWarn, logError } from './error-store'

type AutoSave = 'off' | 'afterDelay' | 'onFocusChange'
type WordWrap = 'on' | 'off'
type LineNumbers = 'on' | 'off' | 'relative'
type ZenEditorMode = 'separate' | 'unified'

// Keys that can be overridden per-workspace
type SettingKey = keyof typeof DEFAULT_SETTINGS

interface SettingsState {
  fontSize: number
  fontFamily: string
  tabSize: number
  wordWrap: WordWrap
  minimap: boolean
  lineNumbers: LineNumbers
  accentColor: string
  terminalShell: string
  terminalFontSize: number
  autoSave: AutoSave
  autoSaveDelay: number
  defaultTerminalCwd: string
  zenEditorMode: ZenEditorMode
  particleDensity: number
  particleSpeed: number
  particleLifespan: number
  glassBlur: number
  reduceMotion: boolean
  particleColor: string
  glowColor: string
  isLoaded: boolean

  // Workspace settings overlay
  workspaceOverrides: Record<string, unknown>
  activeProjectRoot: string | null

  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
  loadWorkspaceSettings: (projectRoot: string) => Promise<void>
  clearWorkspaceSettings: () => void
  setWorkspaceSetting: (key: string, value: unknown) => void
  removeWorkspaceSetting: (key: string) => void
  getEffective: (key: string) => unknown
  hasWorkspaceOverride: (key: string) => boolean
}

function getGlobalSettingsObject(state: SettingsState): Record<string, unknown> {
  return {
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    tabSize: state.tabSize,
    wordWrap: state.wordWrap,
    minimap: state.minimap,
    lineNumbers: state.lineNumbers,
    accentColor: state.accentColor,
    terminalShell: state.terminalShell,
    terminalFontSize: state.terminalFontSize,
    autoSave: state.autoSave,
    autoSaveDelay: state.autoSaveDelay,
    defaultTerminalCwd: state.defaultTerminalCwd,
    zenEditorMode: state.zenEditorMode,
    particleDensity: state.particleDensity,
    particleSpeed: state.particleSpeed,
    particleLifespan: state.particleLifespan,
    glassBlur: state.glassBlur,
    reduceMotion: state.reduceMotion,
    particleColor: state.particleColor,
    glowColor: state.glowColor
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,
  workspaceOverrides: {},
  activeProjectRoot: null,

  setSetting: (key, value) => {
    set({ [key]: value } as Partial<SettingsState>)
    get().saveSettings()
  },

  loadSettings: async () => {
    try {
      const parsed = await window.api.settings.load()
      if (parsed && typeof parsed === 'object') {
        set({ ...(parsed as Record<string, unknown>), isLoaded: true })
      } else {
        set({ isLoaded: true })
      }
    } catch (err) {
      logWarn('settings', 'Failed to load settings', err)
      set({ isLoaded: true })
    }
  },

  saveSettings: async () => {
    const state = get()
    const toSave = getGlobalSettingsObject(state)
    try {
      await window.api.settings.save(JSON.stringify(toSave, null, 2))
    } catch (err) { logError('settings', 'Failed to save settings', err) }
  },

  loadWorkspaceSettings: async (projectRoot: string) => {
    try {
      const parsed = await window.api.workspace.loadSettings(projectRoot) as Record<string, unknown> | null
      if (parsed && typeof parsed === 'object') {
        // Apply overrides on top of current global settings
        const overrides: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(parsed)) {
          if (key in DEFAULT_SETTINGS) {
            overrides[key] = value
          }
        }
        // Merge overrides into store state so components read effective values
        set({ workspaceOverrides: overrides, activeProjectRoot: projectRoot, ...overrides } as Partial<SettingsState>)
      } else {
        set({ workspaceOverrides: {}, activeProjectRoot: projectRoot })
      }
    } catch (err) {
      logWarn('settings', 'Failed to load workspace settings', err)
      set({ workspaceOverrides: {}, activeProjectRoot: projectRoot })
    }
  },

  clearWorkspaceSettings: () => {
    const state = get()
    // Restore global values for keys that were overridden
    const restoreGlobal: Record<string, unknown> = {}
    // Reload global values by re-reading settings without overrides
    // We simply reset overridden keys to DEFAULT_SETTINGS, then re-loadSettings will fix it
    set({ workspaceOverrides: {}, activeProjectRoot: null })
    // Reload global settings to restore actual global values
    get().loadSettings()
  },

  setWorkspaceSetting: (key: string, value: unknown) => {
    const state = get()
    const projectRoot = state.activeProjectRoot
    if (!projectRoot) return

    const newOverrides = { ...state.workspaceOverrides, [key]: value }
    set({ workspaceOverrides: newOverrides, [key]: value } as Partial<SettingsState>)

    // Persist to project's settings.json
    window.api.workspace.saveSettings(projectRoot, JSON.stringify(newOverrides, null, 2)).catch(() => {})
  },

  removeWorkspaceSetting: (key: string) => {
    const state = get()
    const projectRoot = state.activeProjectRoot
    if (!projectRoot) return

    const newOverrides = { ...state.workspaceOverrides }
    delete newOverrides[key]

    // Restore global value for this key
    const globalValue = (DEFAULT_SETTINGS as Record<string, unknown>)[key]
    set({ workspaceOverrides: newOverrides, [key]: globalValue } as Partial<SettingsState>)

    // Re-load global settings to get the actual saved global value
    window.api.settings.load().then((parsed: unknown) => {
      if (parsed && typeof parsed === 'object') {
        const global = parsed as Record<string, unknown>
        if (key in global) {
          set({ [key]: global[key] } as Partial<SettingsState>)
        }
      }
    }).catch(() => {})

    // Persist updated overrides
    if (Object.keys(newOverrides).length > 0) {
      window.api.workspace.saveSettings(projectRoot, JSON.stringify(newOverrides, null, 2)).catch(() => {})
    } else {
      window.api.workspace.saveSettings(projectRoot, '{}').catch(() => {})
    }
  },

  getEffective: (key: string): unknown => {
    const state = get()
    if (key in state.workspaceOverrides) {
      return state.workspaceOverrides[key]
    }
    return (state as unknown as Record<string, unknown>)[key]
  },

  hasWorkspaceOverride: (key: string): boolean => {
    return key in get().workspaceOverrides
  }
}))
