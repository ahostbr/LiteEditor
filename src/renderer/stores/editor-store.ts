import { create } from 'zustand'

/** Build the correct Monaco URI for a given path or synthetic untitled key. */
function toMonacoUri(key: string): any {
  const monaco = (window as any).__monaco
  if (!monaco) return null
  return key.startsWith('untitled:') ? monaco.Uri.parse(key) : monaco.Uri.file(key)
}

/** Get the Monaco model key for a tab (file path or synthetic untitled URI). */
function tabModelKey(tab: Tab): string | undefined {
  return tab.path || (tab.type === 'file' ? `untitled:${tab.title}` : undefined)
}

/** Read current file content from Monaco model (source of truth).
 *  Returns undefined if Monaco hasn't loaded yet or model not found. */
export function getMonacoContent(filePath: string): string | undefined {
  try {
    const monaco = (window as any).__monaco
    if (!monaco) return undefined
    const uri = toMonacoUri(filePath)
    if (!uri) return undefined
    const model = monaco.editor.getModel(uri)
    return model?.getValue()
  } catch { return undefined }
}

/** Dispose a Monaco model if no remaining tab references it. */
function disposeMonacoModel(key: string, allPanes: [PaneState, PaneState | null]): void {
  for (const pane of allPanes) {
    if (!pane) continue
    if (pane.tabs.some(t => tabModelKey(t) === key)) return
  }
  try {
    const monaco = (window as any).__monaco
    if (!monaco) return
    const uri = toMonacoUri(key)
    if (!uri) return
    const model = monaco.editor.getModel(uri)
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
  cursorLine?: number
  cursorColumn?: number
  scrollTop?: number
  needsLoad?: boolean
}

export interface PaneState {
  tabs: Tab[]
  activeTabIndex: number
}

export interface WorkspaceEditorState {
  panes: Array<{
    tabs: Array<{
      path: string
      type: TabType
      cursorLine?: number
      cursorColumn?: number
      scrollTop?: number
    }>
    activeTabIndex: number
  }>
  activePaneIndex: number
  isSplit: boolean
}

interface EditorState {
  panes: [PaneState, PaneState | null]
  activePaneIndex: 0 | 1
  isSplit: boolean
  projectRoot: string | null
  untitledCounter: number

  newFile: () => void
  setTabPath: (paneIndex: number, tabIndex: number, path: string) => void
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
  updateCursorPosition: (paneIndex: number, tabIndex: number, line: number, column: number) => void
  updateScrollPosition: (paneIndex: number, tabIndex: number, scrollTop: number) => void
  getWorkspaceState: () => WorkspaceEditorState
  restoreWorkspaceState: (state: WorkspaceEditorState, readFile: (path: string) => Promise<string>) => Promise<void>
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
  untitledCounter: 0,

  newFile: () => {
    set((state) => {
      const counter = state.untitledCounter + 1
      const pi = state.activePaneIndex
      const pane = state.panes[pi]
      if (!pane) return { untitledCounter: counter }

      const tab: Tab = {
        id: generateId(),
        type: 'file',
        title: `Untitled-${counter}`,
        isDirty: false,
        content: ''
      }

      const newTabs = [...pane.tabs, tab]
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[pi] = { tabs: newTabs, activeTabIndex: newTabs.length - 1 }
      return { panes: newPanes, untitledCounter: counter }
    })
  },

  setTabPath: (paneIndex, tabIndex, path) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane || !pane.tabs[tabIndex]) return state

      const oldTab = pane.tabs[tabIndex]
      const oldKey = tabModelKey(oldTab)

      const newTabs = [...pane.tabs]
      newTabs[tabIndex] = { ...newTabs[tabIndex], path, title: getFileName(path) }
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { ...pane, tabs: newTabs }

      // Dispose old untitled model since the tab now has a real path
      if (oldKey && oldKey.startsWith('untitled:')) {
        disposeMonacoModel(oldKey, newPanes)
      }

      return { panes: newPanes }
    })
  },

  openFile: (path, content, paneIndex) => {
    set((state) => {
      const pi = paneIndex ?? state.activePaneIndex
      const pane = state.panes[pi]
      if (!pane) return state

      // Check if file already open in this pane
      const existingIndex = pane.tabs.findIndex((t) => t.type === 'file' && t.path === path)
      if (existingIndex >= 0) {
        const newPanes = [...state.panes] as [PaneState, PaneState | null]
        const newTabs = [...pane.tabs]
        // Clear needsLoad if it was set
        if (newTabs[existingIndex].needsLoad) {
          newTabs[existingIndex] = { ...newTabs[existingIndex], content, needsLoad: false }
        }
        newPanes[pi] = { ...pane, tabs: newTabs, activeTabIndex: existingIndex }
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
      const closedKey = closedTab ? tabModelKey(closedTab) : undefined
      if (paneIndex === 1 && newTabs.length === 0) {
        const result = { panes: [newPanes[0]!, null] as [PaneState, PaneState | null], isSplit: false, activePaneIndex: 0 as const }
        if (closedKey) disposeMonacoModel(closedKey, result.panes)
        return result
      }

      if (closedKey) disposeMonacoModel(closedKey, newPanes)
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
        const key = tabModelKey(tab)
        if (key) disposeMonacoModel(key, newPanes)
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
          const key = tabModelKey(tab)
          if (key) disposeMonacoModel(key, result.panes)
        }
        return result
      }

      for (const tab of closedTabs) {
        const key = tabModelKey(tab)
        if (key) disposeMonacoModel(key, newPanes)
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
  },

  updateCursorPosition: (paneIndex, tabIndex, line, column) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane || !pane.tabs[tabIndex]) return state

      const newTabs = [...pane.tabs]
      newTabs[tabIndex] = { ...newTabs[tabIndex], cursorLine: line, cursorColumn: column }
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { ...pane, tabs: newTabs }
      return { panes: newPanes }
    })
  },

  updateScrollPosition: (paneIndex, tabIndex, scrollTop) => {
    set((state) => {
      const pane = state.panes[paneIndex]
      if (!pane || !pane.tabs[tabIndex]) return state

      const newTabs = [...pane.tabs]
      newTabs[tabIndex] = { ...newTabs[tabIndex], scrollTop }
      const newPanes = [...state.panes] as [PaneState, PaneState | null]
      newPanes[paneIndex] = { ...pane, tabs: newTabs }
      return { panes: newPanes }
    })
  },

  getWorkspaceState: (): WorkspaceEditorState => {
    const state = get()
    const panes = state.panes
      .filter((p): p is PaneState => p !== null)
      .map((pane) => ({
        tabs: pane.tabs
          .filter((t) => t.path && t.type === 'file')
          .map((t) => ({
            path: t.path!,
            type: t.type,
            cursorLine: t.cursorLine,
            cursorColumn: t.cursorColumn,
            scrollTop: t.scrollTop
          })),
        activeTabIndex: pane.activeTabIndex
      }))

    return {
      panes,
      activePaneIndex: state.activePaneIndex,
      isSplit: state.isSplit
    }
  },

  restoreWorkspaceState: async (wsState, readFile) => {
    // Dispose all existing Monaco models
    const currentState = get()
    for (const pane of currentState.panes) {
      if (!pane) continue
      for (const tab of pane.tabs) {
        if (tab.path) {
          try {
            const monaco = (window as any).__monaco
            if (monaco) {
              const model = monaco.editor.getModel(monaco.Uri.file(tab.path))
              model?.dispose()
            }
          } catch { /* ignore */ }
        }
      }
    }

    // Build panes from workspace state
    const restoredPanes: [PaneState, PaneState | null] = [createEmptyPane(), null]

    for (let pi = 0; pi < wsState.panes.length && pi < 2; pi++) {
      const savedPane = wsState.panes[pi]
      const tabs: Tab[] = []

      for (const savedTab of savedPane.tabs) {
        if (!savedTab.path) continue

        const isActive = tabs.length === savedPane.activeTabIndex
        let content: string | undefined
        let needsLoad = true

        // Only load active tab content immediately
        if (isActive) {
          try {
            content = await readFile(savedTab.path)
            needsLoad = false
          } catch {
            // File no longer exists — skip this tab
            continue
          }
        }

        tabs.push({
          id: generateId(),
          type: savedTab.type || 'file',
          path: savedTab.path,
          title: getFileName(savedTab.path),
          isDirty: false,
          content,
          cursorLine: savedTab.cursorLine,
          cursorColumn: savedTab.cursorColumn,
          scrollTop: savedTab.scrollTop,
          needsLoad
        })
      }

      // Clamp activeTabIndex
      const activeIdx = Math.min(savedPane.activeTabIndex, tabs.length - 1)
      restoredPanes[pi] = { tabs, activeTabIndex: tabs.length > 0 ? Math.max(0, activeIdx) : -1 }
    }

    set({
      panes: restoredPanes,
      activePaneIndex: (wsState.activePaneIndex === 1 && restoredPanes[1]) ? 1 : 0,
      isSplit: wsState.isSplit && restoredPanes[1] !== null && restoredPanes[1].tabs.length > 0
    })
  }
}))
