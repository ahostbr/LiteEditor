import { useEditorStore } from '../stores/editor-store'
import { useUiStore } from '../stores/ui-store'
import { useZenStore } from '../stores/zen-store'
import { useCanvasStore } from '../stores/canvas-store'

/**
 * Open a file in editorStore and ensure it is visible in the current UI mode.
 * This is the single authoritative entry point for all file-opening operations.
 */
export async function openFileInCurrentMode(path: string, content?: string): Promise<void> {
  const fileContent = content ?? await window.api.fs.readFile(path)
  useEditorStore.getState().openFile(path, fileContent)
  ensureEditorVisible()
}

/**
 * Ensure the current mode has a viewer for editorStore tabs.
 * Call after openFile() or mode switches when the viewer container may not exist yet.
 */
export function ensureEditorVisible(): void {
  const mode = useUiStore.getState().appMode

  if (mode === 'zen') {
    const panels = useZenStore.getState().panels
    if (!panels.some((p) => p.type === 'unified-editor')) {
      useZenStore.getState().addUnifiedEditorPanel()
    }
    return
  }

  if (mode === 'canvas') {
    if (!useCanvasStore.getState().hasPane('unified-editor')) {
      useCanvasStore.getState().addPane('unified-editor')
    }
    return
  }

  // 'editor' mode: SplitPane always renders editorStore — nothing to do.
}
