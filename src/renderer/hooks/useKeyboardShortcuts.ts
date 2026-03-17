import { useEffect } from 'react'
import { useEditorStore, getMonacoContent } from '../stores/editor-store'
import { useUiStore } from '../stores/ui-store'
import { useZenStore } from '../stores/zen-store'
import { useCanvasStore } from '../stores/canvas-store'
import { confirmAndSaveTab } from '../lib/close-helpers'

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

      // Ctrl+N: New file
      if (ctrl && !shift && e.key === 'n') {
        e.preventDefault()
        useEditorStore.getState().newFile()
        return
      }

      // Ctrl+S: Save active file
      if (ctrl && !shift && e.key === 's') {
        e.preventDefault()
        const state = useEditorStore.getState()
        const pane = state.panes[state.activePaneIndex]
        if (!pane) return
        const tab = pane.tabs[pane.activeTabIndex]
        if (!tab || tab.type !== 'file') return

        // Untitled file — redirect to Save As
        if (!tab.path) {
          const modelKey = `untitled:${tab.title}`
          const content = getMonacoContent(modelKey)
          if (content === undefined) return
          const filePath = await window.api.dialog.saveFile(tab.title)
          if (!filePath) return
          await window.api.fs.writeFile(filePath, content)
          state.setTabPath(state.activePaneIndex, pane.activeTabIndex, filePath)
          state.markSaved(state.activePaneIndex, pane.activeTabIndex)
          return
        }

        if (tab.isDirty) {
          const content = getMonacoContent(tab.path)
          if (content === undefined) return
          await window.api.fs.writeFile(tab.path, content)
          state.markSaved(state.activePaneIndex, pane.activeTabIndex)
        }
      }

      // Ctrl+W: Close active tab (editor mode) or focused pane (canvas mode)
      if (ctrl && !shift && e.key === 'w') {
        e.preventDefault()
        if (useUiStore.getState().appMode === 'canvas') {
          const cs = useCanvasStore.getState()
          if (cs.focusedPaneId) cs.removePane(cs.focusedPaneId)
        } else {
          const state = useEditorStore.getState()
          const pane = state.panes[state.activePaneIndex]
          if (pane && pane.activeTabIndex >= 0) {
            const tab = pane.tabs[pane.activeTabIndex]
            if (tab && (await confirmAndSaveTab(tab))) {
              closeTab(state.activePaneIndex, pane.activeTabIndex)
            }
          }
        }
      }

      // Ctrl+\: Split pane (mode-aware)
      if (ctrl && e.key === '\\') {
        e.preventDefault()
        const mode = useUiStore.getState().appMode
        if (mode === 'canvas') {
          useCanvasStore.getState().addPane('editor')
        } else if (mode === 'zen') {
          const zenEditorMode = (await import('../stores/settings-store')).useSettingsStore.getState().zenEditorMode
          if (zenEditorMode === 'unified') {
            splitPane()
          } else {
            useZenStore.getState().addUnifiedEditorPanel()
          }
        } else {
          splitPane()
        }
        return
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

      // Ctrl+Shift+O: Open folder → register as project
      if (ctrl && shift && e.key === 'O') {
        e.preventDefault()
        const path = await window.api.dialog.openFolder()
        if (path) {
          const { useProjectStore } = await import('../stores/project-store')
          await useProjectStore.getState().addProject(path)
          setProjectRoot(path)
        }
      }

      // Ctrl+Shift+L: Toggle column layout
      if (ctrl && shift && e.key === 'L') {
        e.preventDefault()
        const { useCanvasStore } = await import('../stores/canvas-store')
        useCanvasStore.getState().toggleLayoutMode()
        return
      }

      // Ctrl+Shift+T: Toggle zen mode
      if (ctrl && shift && e.key === 'T') {
        e.preventDefault()
        useUiStore.getState().toggleAppMode()
        return
      }

      // Ctrl+Shift+B: New browser panel (zen mode or canvas mode)
      if (ctrl && shift && e.key === 'B') {
        e.preventDefault()
        const mode = useUiStore.getState().appMode
        if (mode === 'zen') {
          useZenStore.getState().addBrowserPanel()
        } else if (mode === 'canvas') {
          const { useCanvasStore } = require('../stores/canvas-store')
          useCanvasStore.getState().addPane('browser')
        }
        return
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

      // === Canvas Mode Shortcuts ===
      const isCanvas = useUiStore.getState().appMode === 'canvas'

      // Ctrl+1-9: Focus canvas pane by index
      if (isCanvas && ctrl && !shift && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const index = parseInt(e.key) - 1
        const pane = useCanvasStore.getState().getPaneByIndex(index)
        if (pane) useCanvasStore.getState().setFocusedPane(pane.id)
        return
      }

      // Ctrl+Shift+N: Add terminal pane
      if (isCanvas && ctrl && shift && e.key === 'N') {
        e.preventDefault()
        useCanvasStore.getState().addPane('terminal')
        return
      }

      // Ctrl+M: Toggle minimap
      if (isCanvas && ctrl && !shift && e.key === 'm') {
        e.preventDefault()
        window.dispatchEvent(new Event('canvas:toggle-minimap'))
        return
      }

      // Ctrl+Alt+Arrow: Navigate between canvas panes
      if (isCanvas && ctrl && e.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        const dir = e.key.replace('Arrow', '').toLowerCase() as 'left' | 'right' | 'up' | 'down'
        const nextId = useCanvasStore.getState().findNearestPane(dir)
        if (nextId) useCanvasStore.getState().setFocusedPane(nextId)
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
