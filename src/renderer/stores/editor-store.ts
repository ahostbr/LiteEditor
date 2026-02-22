import { create } from 'zustand'

/** Read current file content from Monaco model (source of truth).
 *  Returns undefined if Monaco hasn't loaded yet or model not found. */
export function getMonacoContent(filePath: string): string | undefined {
  try {
    const monaco = (window as any).__monaco
    if (!monaco) return undefined
    const model = monaco.editor.getModel(monaco.Uri.file(filePath))
    return model?.getValue()
  } catch { return undefined }
}

/** Dispose a Monaco model if no remaining tab references it. */
function disposeMonacoModel(path: string, allPanes: [PaneState, PaneState | null]): void {
  for (const pane of allPanes) {
    if (!pane) continue
    if (pane.tabs.some(t => t.path === path)) return
  }
  try {
    const monaco = (window as any).__monaco
    if (!monaco) return
    const model = monaco.editor.getModel(monaco.Uri.file(path))
    model?.dispose()
  } catch { /* ignore */ }
}

export type TabType = 'file' | 'diff'

export interface Tab {
  id: string
  type: TabType
  path?: string
  title: string
  isDirty: boolean
  content?: string
  originalContent?: string
  modifiedContent?: string
}

export interface PaneState {
  tabs: Tab[]
  activeTabIndex: number
}

interface EditorState {
  panes: [PaneState, PaneState | null]
  activePaneIndex: 0 | 1
  isSplit: boolean
  projectRoot: string | null

  openFile: (path: string, content: string, paneIndex?: number) => void
  closeTab: (paneIndex: number, tabIndex: number) => void
  closeOtherTabs: (paneIndex: number, tabIndex: number) => void
  closeAllTabs: (paneIndex: number) => void
  setActiveTab: (paneIndex: number, tabIndex: number) => void
  setActivePane: (paneIndex: 0 | 1) => void
  reorderTab: (paneIndex: number, fromIndex: number, toIndex: number) => void
  markDirty: (paneIndex: number, tabIndex: number) => void
  markSaved: (paneIndex: number, tabIndex: number) => void
  splitPane: () => void
  closeSplitPane: () => void
  openDiff: (path: string, original: string, modified: string, paneIndex?: number) => void
  setProjectRoot: (path: string) => void
  getActiveTab: () => Tab | null
  getActivePane: () => PaneState
}

function createEmptyPane(): PaneState {
  return { tabs: [], activeTabIndex: -1 }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() || path
}

export const useEditorStore = create<EditorState>((set, get) => ({
  panes: [createEmptyPane(), null],
  activePaneIndex: 0,
  isSplit: false,
  projectRoot: null,

  openFile: (path, content, paneIndex) => {
    set((state) => {
      const pi = paneIndex ?? state.activePaneIndex
      const pane = state.panes[pi]
      if (!pane) return state

      // Check if file already open in this pane
      const existingIndex = pane.tabs.findIndex((t) => t.type === 'file' && t.path === path)
      if (existingIndex >= 0) {
        const newPanes = [...state.panes] as [PaneState, PaneState | null]
        newPanes[pi] = { ...pane, activeTabIndex: existingIndex }
        return { panes: newPanes }
      }

      const tab: Tab = {
        id: generateId(),
        type: 'file',
        path,
        title: getFileName(path),
        isDirty: false,
        content
      }

      const newTabs = [...pane.tabs, tab]
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[pi] = { tabs: newTabs, activeTabIndex: newTabs.length - 1 }
      return { panes: newPanes }
    })
  },

  closeTab: (paneIndex, tabIndex) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane) return state

      const closedTab = pane.tabs[tabIndex]
      const newTabs = pane.tabs.filter((_, i) => i !== tabIndex)
      let newActiveIndex = pane.activeTabIndex

      if (newTabs.length === 0) {
        newActiveIndex = -1
      } else if (tabIndex <= pane.activeTabIndex) {
        newActiveIndex = Math.max(0, pane.activeTabIndex - 1)
      }

      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { tabs: newTabs, activeTabIndex: newActiveIndex }

      // Auto-close split if second pane is empty
      if (paneIndex === 1 && newTabs.length === 0) {
        const result = { panes: [newPanes[0]!, null] as [PaneState, PaneState | null], isSplit: false, activePaneIndex: 0 as const }
        if (closedTab?.path) disposeMonacoModel(closedTab.path, result.panes)
        return result
      }

      if (closedTab?.path) disposeMonacoModel(closedTab.path, newPanes)
      return { panes: newPanes }
    })
  },

  closeOtherTabs: (paneIndex, tabIndex) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane) return state

      const kept = [pane.tabs[tabIndex]]
      const closed = pane.tabs.filter((_, i) => i !== tabIndex)
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { tabs: kept, activeTabIndex: 0 }
      for (const tab of closed) {
        if (tab.path) disposeMonacoModel(tab.path, newPanes)
      }
      return { panes: newPanes }
    })
  },

  closeAllTabs: (paneIndex) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      const closedTabs = pane ? [...pane.tabs] : []
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = createEmptyPane()

      if (paneIndex === 1) {
        const result = { panes: [newPanes[0]!, null] as [PaneState, PaneState | null], isSplit: false, activePaneIndex: 0 as const }
        for (const tab of closedTabs) {
          if (tab.path) disposeMonacoModel(tab.path, result.panes)
        }
        return result
      }

      for (const tab of closedTabs) {
        if (tab.path) disposeMonacoModel(tab.path, newPanes)
      }
      return { panes: newPanes }
    })
  },

  setActiveTab: (paneIndex, tabIndex) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane) return state

      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { ...pane, activeTabIndex: tabIndex }
      return { panes: newPanes, activePaneIndex: paneIndex as 0 | 1 }
    })
  },

  setActivePane: (paneIndex) => set({ activePaneIndex: paneIndex }),

  reorderTab: (paneIndex, fromIndex, toIndex) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane) return state

      const newTabs = [...pane.tabs]
      const [moved] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, moved)

      let newActiveIndex = pane.activeTabIndex
      if (pane.activeTabIndex === fromIndex) {
        newActiveIndex = toIndex
      }

      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { tabs: newTabs, activeTabIndex: newActiveIndex }
      return { panes: newPanes }
    })
  },

  markDirty: (paneIndex, tabIndex) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane) return state

      const newTabs = [...pane.tabs]
      newTabs[tabIndex] = { ...newTabs[tabIndex], isDirty: true }
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { ...pane, tabs: newTabs }
      return { panes: newPanes }
    })
  },

  markSaved: (paneIndex, tabIndex) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane) return state

      const newTabs = [...pane.tabs]
      newTabs[tabIndex] = { ...newTabs[tabIndex], isDirty: false }
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { ...pane, tabs: newTabs }
      return { panes: newPanes }
    })
  },

  splitPane: () => {
    set((state) => {
      if (state.isSplit) return state
      return {
        panes: [state.panes[0], createEmptyPane()] as [PaneState, PaneState | null],
        isSplit: true
      }
    })
  },

  closeSplitPane: () => {
    set((state) => ({
      panes: [state.panes[0], null] as [PaneState, PaneState | null],
      isSplit: false,
      activePaneIndex: 0
    }))
  },

  openDiff: (path, original, modified, paneIndex) => {
    set((state) => {
      const pi = paneIndex ?? state.activePaneIndex
      const pane = state.panes[pi]
      if (!pane) return state

      // Check if diff already open
      const existingIndex = pane.tabs.findIndex(
        (t) => t.type === 'diff' && t.path === path
      )
      if (existingIndex >= 0) {
        const newPanes = [...state.panes] as [PaneState, PaneState | null]
        const newTabs = [...pane.tabs]
        newTabs[existingIndex] = { ...newTabs[existingIndex], originalContent: original, modifiedContent: modified }
        newPanes[pi] = { ...pane, tabs: newTabs, activeTabIndex: existingIndex }
        return { panes: newPanes }
      }

      const tab: Tab = {
        id: generateId(),
        type: 'diff',
        path,
        title: `${getFileName(path)} (diff)`,
        isDirty: false,
        originalContent: original,
        modifiedContent: modified
      }

      const newTabs = [...pane.tabs, tab]
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[pi] = { tabs: newTabs, activeTabIndex: newTabs.length - 1 }
      return { panes: newPanes }
    })
  },

  setProjectRoot: (path) => set({ projectRoot: path }),

  getActiveTab: () => {
    const state = get()
    const pane = state.panes[state.activePaneIndex]
    if (!pane || pane.activeTabIndex < 0) return null
    return pane.tabs[pane.activeTabIndex] || null
  },

  getActivePane: () => {
    const state = get()
    return state.panes[state.activePaneIndex] || state.panes[0]
  }
}))
