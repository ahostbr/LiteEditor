import React, { useEffect, useRef, useCallback } from 'react'
import * as monaco from 'monaco-editor'
import { getLanguageFromPath } from '../../lib/language-map'
import { useSettingsStore } from '../../stores/settings-store'
import { useEditorStore } from '../../stores/editor-store'

// Configure Monaco workers
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') {
      return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), { type: 'module' })
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url), { type: 'module' })
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url), { type: 'module' })
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), { type: 'module' })
    }
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' })
  }
}

interface MonacoEditorProps {
  content: string
  path: string
  paneIndex: number
  tabIndex: number
}

export function MonacoEditor({ content, path, paneIndex, tabIndex }: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const modelRef = useRef<monaco.editor.ITextModel | null>(null)
  const settings = useSettingsStore()
  const updateContent = useEditorStore((s) => s.updateContent)
  const markDirty = useEditorStore((s) => s.markDirty)

  // Create editor
  useEffect(() => {
    if (!containerRef.current) return

    const language = getLanguageFromPath(path)

    // Create or get model
    const uri = monaco.Uri.file(path)
    let model = monaco.editor.getModel(uri)
    if (!model) {
      model = monaco.editor.createModel(content, language, uri)
    } else {
      // Update content only if different
      if (model.getValue() !== content) {
        model.setValue(content)
      }
    }
    modelRef.current = model

    const editor = monaco.editor.create(containerRef.current, {
      model,
      theme: 'vs-dark',
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap,
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      padding: { top: 8 }
    })
    editorRef.current = editor

    // Listen for content changes
    const disposable = editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue()
      updateContent(paneIndex, tabIndex, newContent)
    })

    return () => {
      disposable.dispose()
      editor.dispose()
      // Don't dispose model here — might be reused
    }
  }, [path])

  // Update editor options when settings change
  useEffect(() => {
    editorRef.current?.updateOptions({
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap,
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers
    })
  }, [settings.fontSize, settings.fontFamily, settings.tabSize, settings.wordWrap, settings.minimap, settings.lineNumbers])

  return (
    <div ref={containerRef} className="w-full h-full" />
  )
}
