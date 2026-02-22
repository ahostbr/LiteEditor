import { create } from 'zustand'
import { useTerminalStore } from './terminal-store'
import { useEditorStore } from './editor-store'
import { useBrowserStore } from './browser-store'

export type ZenPanelType = 'terminal' | 'editor' | 'browser'

export interface ZenPanel {
  id: string
  type: ZenPanelType
  title: string
  // Terminal panels
  terminalSessionId?: string
  // Editor panels
  filePath?: string
  isDirty?: boolean
  // Browser panels
  browserSessionId?: string
  browserUrl?: string
}

interface ZenState {
  panels: ZenPanel[]
  activePanelId: string | null

  addTerminalPanel: (shell?: string, cwd?: string) => Promise<void>
  addEditorPanel: (filePath: string, content: string) => void
  addBrowserPanel: (url?: string) => void
  removePanel: (id: string) => void
  setActivePanel: (id: string) => void
  reorderPanels: (fromIndex: number, toIndex: number) => void
  markPanelDirty: (id: string, dirty: boolean) => void
  renamePanel: (id: string, title: string) => void
}

let panelCounter = 0

export const useZenStore = create<ZenState>((set, get) => ({
  panels: [],
  activePanelId: null,

  addTerminalPanel: async (shell?: string, cwd?: string) => {
    const fallbackCwd = cwd || useEditorStore.getState().projectRoot || undefined
    try {
      const sessionId = await window.api.pty.create(shell || undefined, fallbackCwd)
      useTerminalStore.getState().createSession(sessionId, shell, fallbackCwd)
      const id = `zen-term-${++panelCounter}`
      const termCount = get().panels.filter((p) => p.type === 'terminal').length + 1
      set((state) => ({
        panels: [...state.panels, {
          id,
          type: 'terminal',
          title: `Terminal ${termCount}`,
          terminalSessionId: sessionId
        }],
        activePanelId: id
      }))
    } catch (err) {
      console.error('Failed to create zen terminal panel:', err)
    }
  },

  addBrowserPanel: (url?: string) => {
    const id = `zen-browser-${++panelCounter}`
    const browserCount = get().panels.filter((p) => p.type === 'browser').length + 1
    set((state) => ({
      panels: [...state.panels, {
        id,
        type: 'browser',
        title: `Browser ${browserCount}`,
        browserUrl: url || 'https://www.google.com'
      }],
      activePanelId: id
    }))
  },

  addEditorPanel: (filePath: string, content: string) => {
    // Check if panel with this path already exists
    const existing = get().panels.find((p) => p.type === 'editor' && p.filePath === filePath)
    if (existing) {
      set({ activePanelId: existing.id })
      return
    }

    // Create/get Monaco model so content is loaded
    const monaco = (window as any).__monaco
    if (monaco) {
      const uri = monaco.Uri.file(filePath)
      let model = monaco.editor.getModel(uri)
      if (!model) {
        const language = getLanguageFromExtension(filePath)
        model = monaco.editor.createModel(content, language, uri)
      }
    }

    const id = `zen-editor-${++panelCounter}`
    const fileName = filePath.replace(/^.*[\\/]/, '')
    set((state) => ({
      panels: [...state.panels, {
        id,
        type: 'editor',
        title: fileName,
        filePath,
        isDirty: false
      }],
      activePanelId: id
    }))
  },

  removePanel: (id: string) => {
    const panel = get().panels.find((p) => p.id === id)
    if (!panel) return

    if (panel.type === 'terminal' && panel.terminalSessionId) {
      useTerminalStore.getState().removeTerminal(panel.terminalSessionId)
    }

    if (panel.type === 'browser' && panel.browserSessionId) {
      window.api.browser.unregister(panel.browserSessionId)
      useBrowserStore.getState().removeSession(panel.browserSessionId)
    }

    set((state) => {
      const panels = state.panels.filter((p) => p.id !== id)
      let activePanelId = state.activePanelId
      if (activePanelId === id) {
        activePanelId = panels.length > 0 ? panels[panels.length - 1].id : null
      }
      return { panels, activePanelId }
    })
  },

  setActivePanel: (id: string) => set({ activePanelId: id }),

  reorderPanels: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const panels = [...state.panels]
      const [moved] = panels.splice(fromIndex, 1)
      panels.splice(toIndex, 0, moved)
      return { panels }
    })
  },

  markPanelDirty: (id: string, dirty: boolean) => {
    set((state) => ({
      panels: state.panels.map((p) => p.id === id ? { ...p, isDirty: dirty } : p)
    }))
  },

  renamePanel: (id: string, title: string) => {
    set((state) => ({
      panels: state.panels.map((p) => p.id === id ? { ...p, title } : p)
    }))
  }
}))

function getLanguageFromExtension(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescriptreact',
    js: 'javascript', jsx: 'javascriptreact',
    json: 'json', html: 'html', css: 'css',
    scss: 'scss', less: 'less', md: 'markdown',
    py: 'python', rs: 'rust', go: 'go',
    java: 'java', c: 'c', cpp: 'cpp', h: 'c',
    yml: 'yaml', yaml: 'yaml', xml: 'xml',
    sh: 'shell', bash: 'shell', sql: 'sql'
  }
  return ext ? map[ext] : undefined
}
