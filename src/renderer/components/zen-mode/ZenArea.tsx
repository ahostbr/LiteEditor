import { useEffect, useRef } from 'react'
import { useZenStore } from '../../stores/zen-store'
import { useLayoutStore } from '../../stores/layout-store'
import { useEditorStore, getMonacoContent } from '../../stores/editor-store'
import { useSettingsStore } from '../../stores/settings-store'
import { GridLayout } from './GridLayout'
import { SplitterLayout } from './SplitterLayout'
import { WindowLayout } from './WindowLayout'
import { TabLayout } from './TabLayout'
import { PanelRenderer } from './PanelRenderer'

export function ZenArea() {
  const panels = useZenStore((s) => s.panels)
  const maximizedPanelId = useZenStore((s) => s.maximizedPanelId)
  const setActivePanel = useZenStore((s) => s.setActivePanel)
  const addTerminalPanel = useZenStore((s) => s.addTerminalPanel)
  const addEditorPanel = useZenStore((s) => s.addEditorPanel)
  const addUnifiedEditorPanel = useZenStore((s) => s.addUnifiedEditorPanel)
  const clearEditorPanels = useZenStore((s) => s.clearEditorPanels)
  const layoutMode = useLayoutStore((s) => s.layoutMode)
  const zenEditorMode = useSettingsStore((s) => s.zenEditorMode)
  const initializedRef = useRef(false)

  // Auto-create panels on mount based on zenEditorMode setting
  useEffect(() => {
    if (panels.length === 0) {
      initializedRef.current = true
      if (zenEditorMode === 'unified') {
        addUnifiedEditorPanel()
      } else {
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
      }
      addTerminalPanel()
    }
  }, [])

  // Live toggle: swap editor panels when setting changes after initial mount
  useEffect(() => {
    if (!initializedRef.current) return
    clearEditorPanels()
    if (zenEditorMode === 'unified') {
      addUnifiedEditorPanel()
    } else {
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
    }
  }, [zenEditorMode])

  if (panels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full"
           style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-muted)' }}>
        <span className="text-sm">Starting terminal...</span>
      </div>
    )
  }

  // Maximized panel takes full area
  if (maximizedPanelId) {
    const maxPanel = panels.find((p) => p.id === maximizedPanelId)
    if (maxPanel) {
      return (
        <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: 'var(--bg-base)' }}>
          <PanelRenderer
            panel={maxPanel}
            isActive={true}
            onFocus={() => setActivePanel(maxPanel.id)}
            visible={true}
          />
        </div>
      )
    }
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
