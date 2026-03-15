import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editor-store'
import { useUiStore } from '../stores/ui-store'
import { useCanvasStore } from '../stores/canvas-store'
import { useWorkspaceStore } from '../stores/workspace-store'

const DEBOUNCE_MS = 1000

export function useWorkspacePersistence() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function save() {
      const projectRoot = useEditorStore.getState().projectRoot
      if (!projectRoot) return

      // Save via workspace store if active
      const { activeWorkspaceId, activeProjectId } = useWorkspaceStore.getState()
      if (activeWorkspaceId && activeProjectId) {
        useWorkspaceStore.getState().saveCurrentWorkspace().catch(() => {})
      }

      // Also save via legacy path (editor + UI + canvas state)
      const editorState = useEditorStore.getState().getWorkspaceState()
      const uiState = useUiStore.getState().getUIState()
      const canvasState = useCanvasStore.getState().getCanvasState()
      const workspace = { editor: editorState, ui: uiState, canvas: canvasState }
      window.api.workspace.saveState(projectRoot, JSON.stringify(workspace, null, 2)).catch(() => {})
    }

    function debouncedSave() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(save, DEBOUNCE_MS)
    }

    const unsubEditor = useEditorStore.subscribe(debouncedSave)
    const unsubUI = useUiStore.subscribe(debouncedSave)
    const unsubCanvas = useCanvasStore.subscribe(debouncedSave)

    return () => {
      unsubEditor()
      unsubUI()
      unsubCanvas()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
