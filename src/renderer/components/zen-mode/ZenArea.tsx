import { useEffect } from 'react'
import { useZenStore } from '../../stores/zen-store'
import { useLayoutStore } from '../../stores/layout-store'
import { useEditorStore, getMonacoContent } from '../../stores/editor-store'
import { GridLayout } from './GridLayout'
import { SplitterLayout } from './SplitterLayout'
import { WindowLayout } from './WindowLayout'
import { TabLayout } from './TabLayout'

export function ZenArea() {
  const panels = useZenStore((s) => s.panels)
  const addTerminalPanel = useZenStore((s) => s.addTerminalPanel)
  const addEditorPanel = useZenStore((s) => s.addEditorPanel)
  const layoutMode = useLayoutStore((s) => s.layoutMode)

  // Auto-create editor panels from normal mode's open tabs + a terminal
  useEffect(() => {
    if (panels.length === 0) {
      const editorState = useEditorStore.getState()
      for (const pane of editorState.panes) {
        if (!pane) continue
        for (const tab of pane.tabs) {
          if (tab.path && tab.type === 'file') {
            const content = getMonacoContent(tab.path) || tab.content || ''
            addEditorPanel(tab.path, content)
          }
        }
      }
      addTerminalPanel()
    }
  }, [])

  if (panels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full"
           style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-muted)' }}>
        <span className="text-sm">Starting terminal...</span>
      </div>
    )
  }

  switch (layoutMode) {
    case 'grid':
      return <GridLayout panels={panels} />
    case 'splitter':
      return <SplitterLayout panels={panels} />
    case 'window':
      return <WindowLayout panels={panels} />
    case 'tabs':
      return <TabLayout panels={panels} />
  }
}

export default ZenArea
