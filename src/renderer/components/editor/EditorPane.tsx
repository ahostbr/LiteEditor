import React from 'react'
import { TabBar } from './TabBar'
import { MonacoEditor } from './MonacoEditor'
import { DiffViewer } from './DiffViewer'
import { TerminalTab } from './TerminalTab'
import { EmptyState } from './EmptyState'
import { useEditorStore } from '../../stores/editor-store'
import { cn } from '../../lib/cn'

interface EditorPaneProps {
  paneIndex: number
}

export function EditorPane({ paneIndex }: EditorPaneProps) {
  const pane = useEditorStore((s) => s.panes[paneIndex])
  const activePaneIndex = useEditorStore((s) => s.activePaneIndex)
  const setActivePane = useEditorStore((s) => s.setActivePane)

  if (!pane) return null

  const activeTab = pane.activeTabIndex >= 0 ? pane.tabs[pane.activeTabIndex] : null
  const isActive = activePaneIndex === paneIndex

  return (
    <div
      className="flex flex-col h-full w-full"
      onClick={() => setActivePane(paneIndex as 0 | 1)}
      style={{
        outline: isActive ? '1px solid var(--accent)' : 'none',
        outlineOffset: '-1px'
      }}
    >
      <TabBar paneIndex={paneIndex} />
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
        {!activeTab && <EmptyState />}
        {activeTab?.type === 'file' && activeTab.path && (
          <MonacoEditor
            key={activeTab.id}
            content={activeTab.content || ''}
            path={activeTab.path}
            paneIndex={paneIndex}
            tabIndex={pane.activeTabIndex}
          />
        )}
        {activeTab?.type === 'diff' && activeTab.path && (
          <DiffViewer
            key={activeTab.id}
            path={activeTab.path}
            original={activeTab.originalContent || ''}
            modified={activeTab.modifiedContent || ''}
          />
        )}
        {activeTab?.type === 'terminal' && (
          <TerminalTab
            key={activeTab.id}
            sessionId={activeTab.id}
          />
        )}
      </div>
    </div>
  )
}
