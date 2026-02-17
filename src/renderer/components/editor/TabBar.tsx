import React, { useState, useRef } from 'react'
import { Tab } from './Tab'
import { ContextMenu, type ContextMenuItem } from '../shared/ContextMenu'
import { useEditorStore, type Tab as TabType } from '../../stores/editor-store'

interface TabBarProps {
  paneIndex: number
}

export function TabBar({ paneIndex }: TabBarProps) {
  const pane = useEditorStore((s) => s.panes[paneIndex])
  const setActiveTab = useEditorStore((s) => s.setActiveTab)
  const closeTab = useEditorStore((s) => s.closeTab)
  const closeOtherTabs = useEditorStore((s) => s.closeOtherTabs)
  const closeAllTabs = useEditorStore((s) => s.closeAllTabs)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabIndex: number } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!pane || pane.tabs.length === 0) return null

  const handleContextMenu = (e: React.MouseEvent, tabIndex: number) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tabIndex })
  }

  const contextItems: ContextMenuItem[] = contextMenu
    ? [
        { label: 'Close', onClick: () => closeTab(paneIndex, contextMenu.tabIndex) },
        { label: 'Close Others', onClick: () => closeOtherTabs(paneIndex, contextMenu.tabIndex) },
        { label: 'Close All', onClick: () => closeAllTabs(paneIndex) }
      ]
    : []

  return (
    <>
      <div
        ref={scrollRef}
        className="flex items-center h-[var(--tab-height)] overflow-x-auto shrink-0"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          scrollbarWidth: 'none'
        }}
      >
        {pane.tabs.map((tab, i) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={i === pane.activeTabIndex}
            onClick={() => setActiveTab(paneIndex, i)}
            onClose={() => closeTab(paneIndex, i)}
            onContextMenu={(e) => handleContextMenu(e, i)}
          />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
