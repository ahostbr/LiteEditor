import { create } from 'zustand'
import { DEFAULT_SETTINGS } from '../lib/constants'

type AutoSave = 'off' | 'afterDelay' | 'onFocusChange'
type WordWrap = 'on' | 'off'
type LineNumbers = 'on' | 'off' | 'relative'

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
  isLoaded: boolean

  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

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
    } catch {
      set({ isLoaded: true })
    }
  },

  saveSettings: async () => {
    const state = get()
    const toSave = {
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
      autoSaveDelay: state.autoSaveDelay
    }
    try {
      await window.api.settings.save(JSON.stringify(toSave, null, 2))
    } catch { /* ignore */ }
  }
}))
