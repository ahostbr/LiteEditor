import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editor-store'
import { useUiStore } from '../stores/ui-store'

const DEBOUNCE_MS = 1000

export function useWorkspacePersistence() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function save() {
      const projectRoot = useEditorStore.getState().projectRoot
      if (!projectRoot) return

      const editorState = useEditorStore.getState().getWorkspaceState()
      const uiState = useUiStore.getState().getUIState()

      const workspace = { editor: editorState, ui: uiState }

      window.api.workspace.saveState(projectRoot, JSON.stringify(workspace, null, 2)).catch(() => {})
    }

    function debouncedSave() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(save, DEBOUNCE_MS)
    }

    // Subscribe to editor store changes (tabs, panes, cursor, scroll)
    const unsubEditor = useEditorStore.subscribe(debouncedSave)

    // Subscribe to UI store changes (sidebar, terminal, app mode)
    const unsubUI = useUiStore.subscribe(debouncedSave)

    return () => {
      unsubEditor()
      unsubUI()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
