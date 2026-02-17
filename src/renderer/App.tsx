import React, { useEffect } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { Titlebar } from './components/titlebar/Titlebar'
import { ActivityBar } from './components/activity-bar/ActivityBar'
import { FileExplorer } from './components/sidebar/FileExplorer'
import { SearchPanel } from './components/sidebar/SearchPanel'
import { GitPanel } from './components/sidebar/GitPanel'
import { SettingsPanel } from './components/sidebar/SettingsPanel'
import { SplitPane } from './components/editor/SplitPane'
import { TerminalPanel } from './components/terminal/TerminalPanel'
import { useUiStore } from './stores/ui-store'
import { useEditorStore } from './stores/editor-store'
import { useGitStore } from './stores/git-store'
import { useSettingsStore } from './stores/settings-store'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { getLanguageFromPath, getLanguageDisplayName } from './lib/language-map'

function SidebarContent() {
  const panel = useUiStore((s) => s.activeSidebarPanel)

  switch (panel) {
    case 'files':
      return <FileExplorer />
    case 'search':
      return <SearchPanel />
    case 'git':
      return <GitPanel />
    case 'settings':
      return <SettingsPanel />
    default:
      return <FileExplorer />
  }
}

function StatusBar() {
  const currentBranch = useGitStore((s) => s.currentBranch)
  const panes = useEditorStore((s) => s.panes)
  const activePaneIndex = useEditorStore((s) => s.activePaneIndex)

  const activePane = panes[activePaneIndex]
  const activeTab = activePane?.tabs[activePane?.activeTabIndex]
  const language = activeTab?.path ? getLanguageDisplayName(getLanguageFromPath(activeTab.path)) : null

  return (
    <div
      className="flex items-center justify-between px-3 h-[var(--status-bar-height)] shrink-0 text-[11px]"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)'
      }}
    >
      <div className="flex items-center gap-3">
        {currentBranch && (
          <span className="flex items-center gap-1">
            <span style={{ color: 'var(--accent)' }}>&#x2387;</span>
            {currentBranch.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {language && <span>{language}</span>}
        <span>UTF-8</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  )
}

export default function App() {
  useKeyboardShortcuts()

  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const terminalPanelVisible = useUiStore((s) => s.terminalPanelVisible)

  useEffect(() => {
    useSettingsStore.getState().loadSettings()
  }, [])

  // Sync accent color from settings to CSS variable
  const accentColor = useSettingsStore((s) => s.accentColor)
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
  }, [accentColor])

  // Initialize git and search when project root changes
  const projectRoot = useEditorStore((s) => s.projectRoot)
  useEffect(() => {
    if (projectRoot) {
      window.api.git.init(projectRoot).catch(() => {})
      window.api.search.setRoot(projectRoot).catch(() => {})
    }
  }, [projectRoot])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        {sidebarVisible && (
          <>
            <div
              className="h-full overflow-hidden shrink-0"
              style={{
                width: 'var(--sidebar-width)',
                backgroundColor: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)'
              }}
            >
              <SidebarContent />
            </div>
          </>
        )}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            <Panel>
              <SplitPane />
            </Panel>
            {terminalPanelVisible && (
              <>
                <PanelResizeHandle
                  className="w-1 shrink-0 hover:bg-[var(--accent)] transition-colors"
                  style={{ backgroundColor: 'var(--border)' }}
                />
                <Panel defaultSize={35} minSize={15}>
                  <TerminalPanel />
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
