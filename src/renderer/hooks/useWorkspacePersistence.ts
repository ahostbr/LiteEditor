import { useEffect, useRef } from 'react'
import { useCanvasStore } from '../stores/canvas-store'
import { useWorkspaceStore } from '../stores/workspace-store'

const DEBOUNCE_MS = 1000

export function useWorkspacePersistence() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function save() {
      const { activeWorkspaceId, activeProjectId } = useWorkspaceStore.getState()
      if (!activeWorkspaceId || !activeProjectId) return

      useWorkspaceStore.getState().saveCurrentWorkspace().catch(() => {})
    }

    function debouncedSave() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(save, DEBOUNCE_MS)
    }

    // Subscribe to canvas store changes (pane positions, viewport, zoom)
    const unsubCanvas = useCanvasStore.subscribe(debouncedSave)

    return () => {
      unsubCanvas()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
