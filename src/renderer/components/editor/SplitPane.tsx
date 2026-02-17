import React from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { EditorPane } from './EditorPane'
import { useEditorStore } from '../../stores/editor-store'

export function SplitPane() {
  const isSplit = useEditorStore((s) => s.isSplit)

  if (!isSplit) {
    return <EditorPane paneIndex={0} />
  }

  return (
    <PanelGroup direction="horizontal">
      <Panel minSize={20}>
        <EditorPane paneIndex={0} />
      </Panel>
      <PanelResizeHandle
        className="w-1 hover:bg-[var(--accent)] transition-colors"
        style={{ backgroundColor: 'var(--border)' }}
      />
      <Panel minSize={20}>
        <EditorPane paneIndex={1} />
      </Panel>
    </PanelGroup>
  )
}
