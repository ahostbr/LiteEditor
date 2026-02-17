import React, { useEffect, Suspense } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { Titlebar } from './components/titlebar/Titlebar'
import { ActivityBar } from './components/activity-bar/ActivityBar'
import { FileExplorer } from './components/sidebar/FileExplorer'
import { SearchPanel } from './components/sidebar/SearchPanel'
import { GitPanel } from './components/sidebar/GitPanel'
import { SettingsPanel } from './components/sidebar/SettingsPanel'
import { SplitPane } from './components/editor/SplitPane'
import { useUiStore } from './stores/ui-store'

// Lazy-load terminal — xterm.js only loads when user first opens terminal
const TerminalPanel = React.lazy(() => import('./components/terminal/TerminalPanel'))
import { useEditorStore } from './stores/editor-store'
import { useGitStore } from './stores/git-store'
import { useSettingsStore } from './stores/settings-store'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { getLanguageFromPath, getLanguageDisplayName } from './lib/language-map'
import { ConfirmDialog } from './components/shared/ConfirmDialog'

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
    // Restore last workspace
    window.api.workspace.load().then((data: unknown) => {
      if (data && typeof data === 'object') {
        const ws = data as Record<string, unknown>
        if (ws.projectRoot && typeof ws.projectRoot === 'string') {
          useEditorStore.getState().setProjectRoot(ws.projectRoot)
        }
        if (typeof ws.zoomLevel === 'number') {
          window.api.window.setZoomLevel(ws.zoomLevel)
        }
      }
    }).catch(() => {})
  }, [])

  // Listen for files opened from OS (file associations / second instance)
  useEffect(() => {
    const unsub = window.api.onOpenFile(async (filePath: string) => {
      try {
        const content = await window.api.fs.readFile(filePath)
        useEditorStore.getState().openFile(filePath, content)
        // Set project root to file's parent dir if none is open
        const state = useEditorStore.getState()
        if (!state.projectRoot) {
          const dir = filePath.replace(/[\\/][^\\/]+$/, '')
          state.setProjectRoot(dir)
        }
      } catch { /* ignore unreadable files */ }
    })
    return unsub
  }, [])

  // Sync accent color from settings to CSS variable
  const accentColor = useSettingsStore((s) => s.accentColor)
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor)
  }, [accentColor])

  // Initialize git and search when project root changes, and persist workspace
  const projectRoot = useEditorStore((s) => s.projectRoot)
  useEffect(() => {
    if (projectRoot) {
      // Defer non-critical init so it doesn't compete with tree load
      setTimeout(() => {
        window.api.git.init(projectRoot).catch(() => {})
        window.api.search.setRoot(projectRoot).catch(() => {})
      }, 0)
      // Save projectRoot (merge with existing workspace data to preserve zoomLevel etc.)
      window.api.workspace.load().then((data: unknown) => {
        const ws = (data && typeof data === 'object') ? data as Record<string, unknown> : {}
        ws.projectRoot = projectRoot
        window.api.workspace.save(JSON.stringify(ws))
      }).catch(() => {})
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
                  <Suspense fallback={<div className="h-full" style={{ backgroundColor: '#0c0c0f' }} />}>
                    <TerminalPanel />
                  </Suspense>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
      <StatusBar />
      <ConfirmDialog />
    </div>
  )
}
