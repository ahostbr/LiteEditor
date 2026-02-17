import { useEffect } from 'react'
import { useEditorStore } from '../stores/editor-store'
import { useUiStore } from '../stores/ui-store'

export function useKeyboardShortcuts() {
  const openFile = useEditorStore((s) => s.openFile)
  const closeTab = useEditorStore((s) => s.closeTab)
  const setActiveTab = useEditorStore((s) => s.setActiveTab)
  const splitPane = useEditorStore((s) => s.splitPane)
  const setProjectRoot = useEditorStore((s) => s.setProjectRoot)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setActiveSidebarPanel = useUiStore((s) => s.setActiveSidebarPanel)

  useEffect(() => {
    const saveZoom = (level: number) => {
      window.api.workspace.load().then((data: unknown) => {
        const ws = (data && typeof data === 'object') ? data as Record<string, unknown> : {}
        ws.zoomLevel = level
        window.api.workspace.save(JSON.stringify(ws))
      }).catch(() => {})
    }

    const handler = async (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // Ctrl+S: Save active file
      if (ctrl && !shift && e.key === 's') {
        e.preventDefault()
        const state = useEditorStore.getState()
        const pane = state.panes[state.activePaneIndex]
        if (!pane) return
        const tab = pane.tabs[pane.activeTabIndex]
        if (tab?.type === 'file' && tab.path && tab.isDirty && tab.content !== undefined) {
          await window.api.fs.writeFile(tab.path, tab.content)
          state.markSaved(state.activePaneIndex, pane.activeTabIndex)
        }
      }

      // Ctrl+W: Close active tab
      if (ctrl && !shift && e.key === 'w') {
        e.preventDefault()
        const state = useEditorStore.getState()
        const pane = state.panes[state.activePaneIndex]
        if (pane && pane.activeTabIndex >= 0) {
          closeTab(state.activePaneIndex, pane.activeTabIndex)
        }
      }

      // Ctrl+\: Split pane
      if (ctrl && e.key === '\\') {
        e.preventDefault()
        splitPane()
      }

      // Ctrl+=: Zoom in
      if (ctrl && !shift && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        const level = window.api.window.zoomIn()
        saveZoom(level)
      }

      // Ctrl+-: Zoom out
      if (ctrl && !shift && e.key === '-') {
        e.preventDefault()
        const level = window.api.window.zoomOut()
        saveZoom(level)
      }

      // Ctrl+0: Reset zoom
      if (ctrl && !shift && e.key === '0') {
        e.preventDefault()
        const level = window.api.window.zoomReset()
        saveZoom(level)
      }

      // Ctrl+B: Toggle sidebar
      if (ctrl && !shift && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      // Ctrl+Shift+F: Search
      if (ctrl && shift && e.key === 'F') {
        e.preventDefault()
        setActiveSidebarPanel('search')
      }

      // Ctrl+Shift+O: Open folder
      if (ctrl && shift && e.key === 'O') {
        e.preventDefault()
        const path = await window.api.dialog.openFolder()
        if (path) {
          setProjectRoot(path)
        }
      }

      // Ctrl+Tab / Ctrl+Shift+Tab: Next/Prev tab
      if (ctrl && e.key === 'Tab') {
        e.preventDefault()
        const state = useEditorStore.getState()
        const pane = state.panes[state.activePaneIndex]
        if (!pane || pane.tabs.length <= 1) return
        const dir = shift ? -1 : 1
        const next = (pane.activeTabIndex + dir + pane.tabs.length) % pane.tabs.length
        setActiveTab(state.activePaneIndex, next)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
