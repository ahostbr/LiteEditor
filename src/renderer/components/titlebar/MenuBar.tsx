import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useEditorStore, getMonacoContent } from '../../stores/editor-store'
import { useUiStore } from '../../stores/ui-store'
import { AboutDialog } from '../shared/AboutDialog'
import { openFileInCurrentMode } from '../../lib/open-file'
import { confirmAndSaveTab, confirmAndSaveTabs } from '../../lib/close-helpers'

interface MenuItem {
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
}

interface MenuDefinition {
  label: string
  items: MenuItem[]
}

function useMenuActions(onShowAbout: () => void) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setActiveSidebarPanel = useUiStore((s) => s.setActiveSidebarPanel)
  const toggleTerminalPanel = useUiStore((s) => s.toggleTerminalPanel)
  const setProjectRoot = useEditorStore((s) => s.setProjectRoot)

  const saveAs = useCallback(async () => {
    const state = useEditorStore.getState()
    const pane = state.panes[state.activePaneIndex]
    if (!pane) return
    const tab = pane.tabs[pane.activeTabIndex]
    if (!tab || tab.type !== 'file') return

    const modelKey = tab.path || `untitled:${tab.title}`
    const content = getMonacoContent(modelKey)
    if (content === undefined) return

    const defaultName = tab.path ? tab.path.split(/[\\/]/).pop() : tab.title
    const filePath = await window.api.dialog.saveFile(defaultName)
    if (!filePath) return

    await window.api.fs.writeFile(filePath, content)
    state.setTabPath(state.activePaneIndex, pane.activeTabIndex, filePath)
    state.markSaved(state.activePaneIndex, pane.activeTabIndex)
  }, [])

  const saveActiveFile = useCallback(async () => {
    const state = useEditorStore.getState()
    const pane = state.panes[state.activePaneIndex]
    if (!pane) return
    const tab = pane.tabs[pane.activeTabIndex]
    if (!tab || tab.type !== 'file') return

    // Untitled file — redirect to Save As
    if (!tab.path) {
      await saveAs()
      return
    }

    if (tab.isDirty) {
      const content = getMonacoContent(tab.path)
      if (content === undefined) return
      await window.api.fs.writeFile(tab.path, content)
      state.markSaved(state.activePaneIndex, pane.activeTabIndex)
    }
  }, [saveAs])

  const exitApp = useCallback(async () => {
    const state = useEditorStore.getState()
    const allTabs = state.panes.flatMap((pane) => pane ? pane.tabs : [])
    if (!(await confirmAndSaveTabs(allTabs))) return
    window.api.window.quit()
  }, [])

  const closeActiveTab = useCallback(async () => {
    const state = useEditorStore.getState()
    const pane = state.panes[state.activePaneIndex]
    if (pane && pane.activeTabIndex >= 0) {
      const tab = pane.tabs[pane.activeTabIndex]
      if (tab && !(await confirmAndSaveTab(tab))) return
      state.closeTab(state.activePaneIndex, pane.activeTabIndex)
    }
  }, [])

  const openFolder = useCallback(async () => {
    const path = await window.api.dialog.openFolder()
    if (path) {
      const { useProjectStore } = await import('../../stores/project-store')
      await useProjectStore.getState().addProject(path)
      setProjectRoot(path)
    }
  }, [setProjectRoot])

  const menus: MenuDefinition[] = [
    {
      label: 'File',
      items: [
        { label: 'New File', shortcut: 'Ctrl+N', action: () => useEditorStore.getState().newFile() },
        { label: 'Open File...', action: async () => {
          const path = await window.api.dialog.openFile()
          if (path) await openFileInCurrentMode(path)
        }},
        { label: 'Open Folder...', shortcut: 'Ctrl+Shift+O', action: openFolder },
        { separator: true, label: '' },
        { label: 'Save', shortcut: 'Ctrl+S', action: saveActiveFile },
        { label: 'Save As...', action: saveAs },
        { separator: true, label: '' },
        { label: 'Close Tab', shortcut: 'Ctrl+W', action: closeActiveTab },
        { separator: true, label: '' },
        { label: 'Exit', action: exitApp }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
        { separator: true, label: '' },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
        { separator: true, label: '' },
        { label: 'Find', shortcut: 'Ctrl+F', disabled: true },
        { label: 'Replace', shortcut: 'Ctrl+H', disabled: true }
      ]
    },
    {
      label: 'Selection',
      items: [
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => document.execCommand('selectAll') }
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: () => setActiveSidebarPanel('files') },
        { label: 'Search', shortcut: 'Ctrl+Shift+F', action: () => setActiveSidebarPanel('search') },
        { label: 'Source Control', shortcut: 'Ctrl+Shift+G', action: () => setActiveSidebarPanel('git') },
        { separator: true, label: '' },
        { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: toggleSidebar },
        { label: 'Toggle Terminal', action: toggleTerminalPanel },
        { separator: true, label: '' },
        { label: 'Zoom In', shortcut: 'Ctrl+=', action: () => window.api.window.zoomIn() },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => window.api.window.zoomOut() },
        { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => window.api.window.zoomReset() }
      ]
    },
    {
      label: 'Go',
      items: [
        { label: 'Go to File...', shortcut: 'Ctrl+P', disabled: true },
        { label: 'Go to Line...', shortcut: 'Ctrl+G', disabled: true }
      ]
    },
    {
      label: 'Terminal',
      items: [
        { label: 'New Terminal', disabled: true },
        { label: 'Toggle Terminal Panel', action: toggleTerminalPanel }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'About LiteEditor', action: onShowAbout }
      ]
    }
  ]

  return menus
}

export function MenuBar() {
  const [showAbout, setShowAbout] = useState(false)
  const menus = useMenuActions(() => setShowAbout(true))
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [hoverActive, setHoverActive] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (openMenu === null) return

    const handleClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
        setHoverActive(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setHoverActive(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [openMenu])

  return (
    <div
      ref={barRef}
      className="flex items-center h-full"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {menus.map((menu, i) => (
        <div key={menu.label} className="relative">
          <button
            className="py-1 text-[11px] transition-colors rounded-[3px]"
            style={{
              color: 'var(--text-secondary)',
              background: openMenu === i ? 'var(--bg-overlay)' : 'transparent',
              paddingLeft: '10px',
              paddingRight: '10px'
            }}
            onMouseDown={() => {
              if (openMenu === i) {
                setOpenMenu(null)
                setHoverActive(false)
              } else {
                setOpenMenu(i)
                setHoverActive(true)
              }
            }}
            onMouseEnter={() => {
              if (hoverActive && openMenu !== null) {
                setOpenMenu(i)
              }
            }}
            onFocus={() => {}}
          >
            {menu.label}
          </button>
          {openMenu === i && (
            <DropdownMenu
              items={menu.items}
              onClose={() => {
                setOpenMenu(null)
                setHoverActive(false)
              }}
            />
          )}
        </div>
      ))}
      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </div>
  )
}

function DropdownMenu({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  return (
    <div
      className="absolute top-full left-0 mt-[1px] min-w-[220px] py-1 rounded-md shadow-xl z-50"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)'
      }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div
            key={i}
            className="my-1 mx-2"
            style={{ borderTop: '1px solid var(--border)' }}
          />
        ) : (
          <button
            key={i}
            className="flex items-center justify-between w-full px-3 py-[3px] text-[12px] text-left transition-colors"
            style={{
              color: item.disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: item.disabled ? 'default' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = item.disabled ? 'var(--text-muted)' : 'var(--text-secondary)'
            }}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action()
                onClose()
              }
            }}
            disabled={item.disabled}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="ml-6 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>
  )
}
