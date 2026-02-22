import React, { useEffect, useRef, Suspense } from 'react'
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
// Lazy-load zen mode — only loads when user switches to zen mode
const ZenArea = React.lazy(() => import('./components/zen-mode/ZenArea'))
import { useEditorStore } from './stores/editor-store'
import { useGitStore } from './stores/git-store'
import { useSettingsStore } from './stores/settings-store'
import { useLayoutStore } from './stores/layout-store'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useWorkspacePersistence } from './hooks/useWorkspacePersistence'
import { getLanguageFromPath, getLanguageDisplayName } from './lib/language-map'
import { ConfirmDialog } from './components/shared/ConfirmDialog'

async function loadWorkspaceForProject(projectRoot: string): Promise<void> {
  try {
    const data = await window.api.workspace.loadState(projectRoot) as { editor?: unknown; ui?: unknown } | null
    if (!data) return

    // Restore editor state (tabs, panes)
    if (data.editor && typeof data.editor === 'object') {
      await useEditorStore.getState().restoreWorkspaceState(
        data.editor as any,
        (path: string) => window.api.fs.readFile(path)
      )
    }

    // Restore UI state (sidebar, terminal, app mode)
    if (data.ui && typeof data.ui === 'object') {
      useUiStore.getState().restoreUIState(data.ui as any)
    }
  } catch { /* workspace file missing or corrupt — start fresh */ }
}

async function saveWorkspaceForProject(projectRoot: string): Promise<void> {
  try {
    const editorState = useEditorStore.getState().getWorkspaceState()
    const uiState = useUiStore.getState().getUIState()
    const workspace = { editor: editorState, ui: uiState }
    await window.api.workspace.saveState(projectRoot, JSON.stringify(workspace, null, 2))
  } catch { /* ignore */ }
}

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
  useWorkspacePersistence()

  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const terminalPanelVisible = useUiStore((s) => s.terminalPanelVisible)
  const appMode = useUiStore((s) => s.appMode)
  const prevProjectRootRef = useRef<string | null>(null)

  // Initial load: settings, layout, global workspace, then project workspace
  useEffect(() => {
    async function init() {
      await useSettingsStore.getState().loadSettings()
      useLayoutStore.getState().loadLayout()

      // Restore last workspace (global — projectRoot + zoomLevel)
      const data = await window.api.workspace.load() as Record<string, unknown> | null
      if (data) {
        if (typeof data.zoomLevel === 'number') {
          window.api.window.setZoomLevel(data.zoomLevel)
        }
        if (data.projectRoot && typeof data.projectRoot === 'string') {
          useEditorStore.getState().setProjectRoot(data.projectRoot)
          // Load per-project workspace state
          await loadWorkspaceForProject(data.projectRoot)
          // Load per-project settings overlay
          await useSettingsStore.getState().loadWorkspaceSettings(data.projectRoot)
          prevProjectRootRef.current = data.projectRoot
        }
      }
    }
    init().catch(() => {})
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

  // Initialize git and search when project root changes, handle project switch
  const projectRoot = useEditorStore((s) => s.projectRoot)
  useEffect(() => {
    if (!projectRoot) return

    async function onProjectChange() {
      const oldRoot = prevProjectRootRef.current

      // Save old project's workspace state before switching
      if (oldRoot && oldRoot !== projectRoot) {
        await saveWorkspaceForProject(oldRoot)

        // Clear workspace settings from old project
        useSettingsStore.getState().clearWorkspaceSettings()

        // Load new project's workspace state
        await loadWorkspaceForProject(projectRoot!)

        // Load new project's settings overlay
        await useSettingsStore.getState().loadWorkspaceSettings(projectRoot!)
      }

      prevProjectRootRef.current = projectRoot!

      // Defer non-critical init so it doesn't compete with tree load
      setTimeout(() => {
        window.api.git.init(projectRoot!).catch(() => {})
        window.api.search.setRoot(projectRoot!).catch(() => {})
      }, 0)

      // Save projectRoot to global workspace (merge to preserve zoomLevel etc.)
      window.api.workspace.load().then((data: unknown) => {
        const ws = (data && typeof data === 'object') ? data as Record<string, unknown> : {}
        ws.projectRoot = projectRoot
        window.api.workspace.save(JSON.stringify(ws))
      }).catch(() => {})
    }

    onProjectChange().catch(() => {})
  }, [projectRoot])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        {(appMode === 'editor' || sidebarVisible) && <ActivityBar />}
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
          {appMode === 'zen' ? (
            <Suspense fallback={<div className="h-full" style={{ backgroundColor: 'var(--bg-base)' }} />}>
              <ZenArea />
            </Suspense>
          ) : (
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
          )}
        </div>
      </div>
      <StatusBar />
      <ConfirmDialog />
    </div>
  )
}
