import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './app.css'
import { useEditorStore } from './stores/editor-store'
import { useDialogStore } from './stores/dialog-store'
import { useUiStore } from './stores/ui-store'

// Expose stores for E2E tests (same pattern as __monaco in MonacoEditor.tsx)
// Uses window.api check since NODE_ENV is inlined by Vite at build time
;(window as any).__test = {
  editorStore: useEditorStore,
  dialogStore: useDialogStore,
  uiStore: useUiStore
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
