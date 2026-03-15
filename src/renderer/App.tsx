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
// Lazy-load canvas mode — the new default mode
const Canvas = React.lazy(() => import('./components/canvas/Canvas'))
import { useEditorStore } from './stores/editor-store'
import { useGitStore } from './stores/git-store'
import { useTerminalStore } from './stores/terminal-store'
import { useSettingsStore } from './stores/settings-store'
import { useLayoutStore } from './stores/layout-store'
import { useZenStore } from './stores/zen-store'
import { useCanvasStore } from './stores/canvas-store'
import { useAppearance } from './hooks/useAppearance'
import { EmberSparks } from './components/effects/EmberSparks'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useCanvasNavigation } from './hooks/useCanvasNavigation'
import { useWorkspacePersistence } from './hooks/useWorkspacePersistence'
import { useProjectStore } from './stores/project-store'
import { ProjectSidebar } from './components/sidebar/ProjectSidebar'
import { AddPaneMenu } from './components/canvas/AddPaneMenu'
import { getLanguageFromPath, getLanguageDisplayName } from './lib/language-map'
import { ConfirmDialog } from './components/shared/ConfirmDialog'
import { ToastViewport } from './components/shared/ToastViewport'

async function loadWorkspaceForProject(projectRoot: string): Promise<void> {
  try {
    const data = await window.api.workspace.loadState(projectRoot) as { editor?: unknown; ui?: unknown; canvas?: unknown } | null
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

    // Restore canvas state (pane layout, viewport)
    if (data.canvas && typeof data.canvas === 'object') {
      const { useCanvasStore } = await import('./stores/canvas-store')
      useCanvasStore.getState().restoreCanvasState(data.canvas as any)
    }
  } catch { /* workspace file missing or corrupt — start fresh */ }
}

async function saveWorkspaceForProject(projectRoot: string): Promise<void> {
  try {
    const editorState = useEditorStore.getState().getWorkspaceState()
    const uiState = useUiStore.getState().getUIState()
    const { useCanvasStore } = await import('./stores/canvas-store')
    const canvasState = useCanvasStore.getState().getCanvasState()
    const workspace = { editor: editorState, ui: uiState, canvas: canvasState }
    await window.api.workspace.saveState(projectRoot, JSON.stringify(workspace, null, 2))
  } catch { /* ignore */ }
}

function applyStringEdits(base: string, editsValue: unknown): string {
  if (!Array.isArray(editsValue)) return base
  let updated = base

  for (const edit of editsValue) {
    if (!edit || typeof edit !== 'object') continue
    const oldString = typeof (edit as any).oldString === 'string' ? (edit as any).oldString : ''
    const newString = typeof (edit as any).newString === 'string' ? (edit as any).newString : ''
    const replaceAll = Boolean((edit as any).replaceAll)

    if (!oldString) {
      updated += newString
      continue
    }

    if (replaceAll) {
      updated = updated.split(oldString).join(newString)
    } else {
      updated = updated.replace(oldString, newString)
    }
  }

  return updated
}

function getActiveSelectionText(): string {
  const monacoAny = (window as any).__monaco as any
  const editors = monacoAny?.editor?.getEditors?.() as any[] | undefined
  if (!editors || editors.length === 0) return ''

  const focused = editors.find((editor: any) => editor?.hasTextFocus?.()) || editors[0]
  const model = focused?.getModel?.()
  const selection = focused?.getSelection?.()
  if (!model || !selection) return ''

  try {
    return String(model.getValueInRange(selection) ?? '')
  } catch {
    return ''
  }
}

async function ensureClaudePanelSession(): Promise<string | null> {
  const ui = useUiStore.getState()

  // If in canvas mode, add a Claude pane to the canvas
  if (ui.appMode === 'canvas') {
    const { useCanvasStore } = await import('./stores/canvas-store')
    const store = useCanvasStore.getState()

    // Check if Claude pane already exists
    for (const pane of store.panes.values()) {
      if (pane.type === 'claude' && pane.claudeSessionId) {
        store.setFocusedPane(pane.id)
        return pane.claudeSessionId
      }
    }

    store.addPane('claude')

    // Wait for the Claude session to be initialized
    for (let i = 0; i < 80; i++) {
      for (const pane of useCanvasStore.getState().panes.values()) {
        if (pane.type === 'claude' && pane.claudeSessionId) {
          useCanvasStore.getState().setFocusedPane(pane.id)
          return pane.claudeSessionId
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 25))
    }
    return null
  }

  // Fall back to zen mode behavior
  if (ui.appMode !== 'zen') {
    ui.setAppMode('zen')
  }

  useZenStore.getState().addClaudePanel()

  for (let i = 0; i < 80; i++) {
    const zen = useZenStore.getState()
    const panel = zen.panels.find((item) => item.type === 'claude' && item.claudeSessionId)
    if (panel?.claudeSessionId) {
      zen.setActivePanel(panel.id)
      return panel.claudeSessionId
    }
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  return null
}

function renameClaudePanel(title: string): boolean {
  const zen = useZenStore.getState()
  const activePanel = zen.activePanelId
    ? zen.panels.find((panel) => panel.id === zen.activePanelId && panel.type === 'claude')
    : undefined
  const fallbackPanel = zen.panels.find((panel) => panel.type === 'claude')
  const target = activePanel ?? fallbackPanel
  if (!target) return false

  zen.renamePanel(target.id, title)
  return true
}

function SidebarContent() {
  const panel = useUiStore((s) => s.activeSidebarPanel)

  switch (panel) {
    case 'projects':
      return <ProjectSidebar />
    case 'files':
      return <FileExplorer />
    case 'search':
      return <SearchPanel />
    case 'git':
      return <GitPanel />
    case 'settings':
      return <SettingsPanel />
    default:
      return <ProjectSidebar />
  }
}

function StatusBar() {
  const currentBranch = useGitStore((s) => s.currentBranch)
  const appMode = useUiStore((s) => s.appMode)
  const panes = useEditorStore((s) => s.panes)
  const activePaneIndex = useEditorStore((s) => s.activePaneIndex)
  const canvasPanes = useCanvasStore((s) => s.panes)
  const canvasZoom = useCanvasStore((s) => s.zoom)
  const focusedPaneId = useCanvasStore((s) => s.focusedPaneId)

  const activePane = panes[activePaneIndex]
  const activeTab = activePane?.tabs[activePane?.activeTabIndex]
  const language = activeTab?.path ? getLanguageDisplayName(getLanguageFromPath(activeTab.path)) : null

  const focusedCanvasPane = focusedPaneId ? canvasPanes.get(focusedPaneId) : null
  const activeProject = useProjectStore.getState().getActiveProject()

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
        {appMode === 'canvas' && activeProject && (
          <span style={{ color: 'var(--text-secondary)' }}>{activeProject.name}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {appMode === 'canvas' ? (
          <>
            {focusedCanvasPane && (
              <span style={{ color: 'var(--text-secondary)' }}>{focusedCanvasPane.title}</span>
            )}
            <span>{canvasPanes.size} pane{canvasPanes.size !== 1 ? 's' : ''}</span>
            {canvasZoom !== 1 && <span>{Math.round(canvasZoom * 100)}%</span>}
          </>
        ) : (
          <>
            {language && <span>{language}</span>}
            <span>UTF-8</span>
            <span>Spaces: 2</span>
          </>
        )}
      </div>
    </div>
  )
}

export default function App() {
  useKeyboardShortcuts()
  useCanvasNavigation()
  useWorkspacePersistence()

  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const terminalPanelVisible = useUiStore((s) => s.terminalPanelVisible)
  const appMode = useUiStore((s) => s.appMode)
  const prevProjectRootRef = useRef<string | null>(null)
  const prevAppModeRef = useRef(appMode)

  // Initial load: settings, layout, projects, then workspace
  useEffect(() => {
    async function init() {
      await useSettingsStore.getState().loadSettings()
      useLayoutStore.getState().loadLayout()

      // Load project registry from disk
      await useProjectStore.getState().loadFromDisk()

      // Restore last workspace (global — projectRoot + zoomLevel)
      const data = await window.api.workspace.load() as Record<string, unknown> | null
      if (data) {
        if (typeof data.zoomLevel === 'number') {
          window.api.window.setZoomLevel(data.zoomLevel)
        }
        if (data.projectRoot && typeof data.projectRoot === 'string') {
          // Register as project if not already known
          const projects = useProjectStore.getState().projects
          const existing = projects.find((p) => p.rootPath === data.projectRoot)
          if (!existing) {
            await useProjectStore.getState().addProject(data.projectRoot as string)
          } else {
            useProjectStore.getState().setActiveProject(existing.id)
          }

          useEditorStore.getState().setProjectRoot(data.projectRoot as string)
          // Load per-project workspace state
          await loadWorkspaceForProject(data.projectRoot as string)
          // Load per-project settings overlay
          await useSettingsStore.getState().loadWorkspaceSettings(data.projectRoot as string)
          prevProjectRootRef.current = data.projectRoot as string
        }
      }

      // If launched with a file from Explorer, open it after workspace restore
      // so it wins the race and becomes the active tab
      const params = new URLSearchParams(window.location.search)
      const launchFile = params.get('openFile')
      if (launchFile) {
        try {
          const content = await window.api.fs.readFile(launchFile)
          useEditorStore.getState().openFile(launchFile, content)
          if (!useEditorStore.getState().projectRoot) {
            const dir = launchFile.replace(/[\\/][^\\/]+$/, '')
            useEditorStore.getState().setProjectRoot(dir)
          }
        } catch { /* ignore unreadable files */ }
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

  // Extra hardening: when leaving Zen mode, force-hide and zero native views.
  useEffect(() => {
    const previousMode = prevAppModeRef.current
    if (previousMode === 'zen' && appMode !== 'zen') {
      const ZERO_BOUNDS = { x: 0, y: 0, width: 0, height: 0 }
      const panels = useZenStore.getState().panels
      for (const panel of panels) {
        if (panel.browserSessionId) {
          window.api.browser.hideView(panel.browserSessionId)
          window.api.browser.setBounds(panel.browserSessionId, ZERO_BOUNDS)
        }
        if (panel.claudeSessionId) {
          window.api.claude.hideView(panel.claudeSessionId)
          window.api.claude.setBounds(panel.claudeSessionId, ZERO_BOUNDS)
        }
        if (panel.codexSessionId) {
          window.api.codex.hideView(panel.codexSessionId)
          window.api.codex.setBounds(panel.codexSessionId, ZERO_BOUNDS)
        }
      }
    }

    prevAppModeRef.current = appMode
  }, [appMode])

  // Claude host-op bridge: main process requests renderer-side editor/terminal/git actions.
  useEffect(() => {
    const unsub = window.api.claude.onHostOp((request) => {
      const requestPayload = (request.payload && typeof request.payload === 'object')
        ? request.payload as Record<string, unknown>
        : {}

      const respond = (ok: boolean, payload?: Record<string, unknown>, error?: string) => {
        window.api.claude.sendHostOpResult({
          id: request.id,
          ok,
          ...(payload ? { payload } : {}),
          ...(error ? { error } : {})
        })
      }

      const handle = async (): Promise<Record<string, unknown>> => {
        switch (request.op) {
          case 'open_folder': {
            const path = typeof requestPayload.path === 'string' ? requestPayload.path : null
            if (!path) return { opened: false }
            useEditorStore.getState().setProjectRoot(path)
            useUiStore.getState().setAppMode('editor')
            return { opened: true, path }
          }
          case 'open_file': {
            const filePath = typeof requestPayload.filePath === 'string' ? requestPayload.filePath : null
            if (!filePath) return {}
            const content = await window.api.fs.readFile(filePath)
            useUiStore.getState().setAppMode('editor')
            useEditorStore.getState().openFile(filePath, content)
            return {}
          }
          case 'open_content': {
            const fileName = typeof requestPayload.fileName === 'string' ? requestPayload.fileName : 'Claude Content'
            const content = typeof requestPayload.content === 'string' ? requestPayload.content : ''

            useUiStore.getState().setAppMode('editor')
            useEditorStore.getState().newFile()
            useEditorStore.setState((state) => {
              const pane = state.panes[state.activePaneIndex]
              if (!pane || pane.activeTabIndex < 0) return state
              const tabs = [...pane.tabs]
              const current = tabs[pane.activeTabIndex]
              tabs[pane.activeTabIndex] = { ...current, title: fileName, content, isDirty: false }
              const panes = [...state.panes] as typeof state.panes
              panes[state.activePaneIndex] = { ...pane, tabs }
              return { panes }
            })

            return { updatedContent: content }
          }
          case 'open_diff': {
            const originalFilePath = typeof requestPayload.originalFilePath === 'string' ? requestPayload.originalFilePath : ''
            const newFilePath = typeof requestPayload.newFilePath === 'string' ? requestPayload.newFilePath : originalFilePath
            let original = ''
            try {
              if (originalFilePath) original = await window.api.fs.readFile(originalFilePath)
            } catch { /* ignore missing file */ }
            const modified = applyStringEdits(original, requestPayload.edits)

            useUiStore.getState().setAppMode('editor')
            useEditorStore.getState().openDiff(newFilePath || originalFilePath || 'Claude Diff', original, modified)

            return { newEdits: requestPayload.edits ?? [] }
          }
          case 'open_file_diffs': {
            const fileDiffs = Array.isArray(requestPayload.fileDiffs) ? requestPayload.fileDiffs : []
            for (const fileDiff of fileDiffs) {
              if (!fileDiff || typeof fileDiff !== 'object') continue
              const originalFilePath = typeof (fileDiff as any).originalFilePath === 'string' ? (fileDiff as any).originalFilePath : ''
              const newFilePath = typeof (fileDiff as any).newFilePath === 'string' ? (fileDiff as any).newFilePath : originalFilePath
              let original = ''
              try {
                if (originalFilePath) original = await window.api.fs.readFile(originalFilePath)
              } catch { /* ignore */ }
              const modified = applyStringEdits(original, (fileDiff as any).edits)
              useUiStore.getState().setAppMode('editor')
              useEditorStore.getState().openDiff(newFilePath || originalFilePath || 'Claude Diff', original, modified)
            }
            return {}
          }
          case 'get_current_selection':
            return { selection: getActiveSelectionText() }
          case 'new_conversation_tab': {
            const sessionId = await ensureClaudePanelSession()
            return { success: !!sessionId, ...(sessionId ? { sessionId } : {}) }
          }
          case 'rename_tab': {
            const title = typeof requestPayload.title === 'string' ? requestPayload.title.trim() : ''
            if (!title) return { success: false }
            return { success: renameClaudePanel(title) }
          }
          case 'fork_conversation': {
            const sessionId = await ensureClaudePanelSession()
            const fallback = typeof requestPayload.forkedFromSession === 'string' ? requestPayload.forkedFromSession : ''
            return { sessionId: sessionId ?? fallback }
          }
          case 'check_git_status': {
            try {
              const files = await window.api.git.status() as unknown[]
              const branch = await window.api.git.currentBranch() as { name?: string } | null
              return {
                isClean: files.length === 0,
                hasChanges: files.length > 0,
                branch: branch?.name ?? null
              }
            } catch {
              return { isClean: true, hasChanges: false, branch: null }
            }
          }
          case 'checkout_branch': {
            const branch = typeof requestPayload.branch === 'string' ? requestPayload.branch : ''
            if (!branch) return { status: 'failed', branch: null }
            try {
              await window.api.git.checkout(branch)
              return { status: 'checked_out', branch }
            } catch (err) {
              return {
                status: 'failed',
                branch,
                error: err instanceof Error ? err.message : String(err)
              }
            }
          }
          case 'open_output_panel': {
            const ui = useUiStore.getState()
            if (!ui.terminalPanelVisible) ui.toggleTerminalPanel()
            return { success: true }
          }
          case 'open_config':
            useUiStore.getState().setActiveSidebarPanel('settings')
            return { success: true }
          case 'attach_terminal_session': {
            const sessionId = typeof requestPayload.sessionId === 'string' ? requestPayload.sessionId : null
            if (!sessionId) return {}
            const shell = typeof requestPayload.shell === 'string' ? requestPayload.shell : undefined
            const cwd = typeof requestPayload.cwd === 'string' ? requestPayload.cwd : undefined
            const terminalStore = useTerminalStore.getState()
            const exists = terminalStore.sessions.some((session) => session.id === sessionId)
            if (!exists) {
              terminalStore.createSession(sessionId, shell, cwd)
            }
            const info = await window.api.pty.getSessionInfo(sessionId).catch(() => null)
            if (info) {
              terminalStore.updateSessionMeta(sessionId, {
                shell: info.shell,
                cwd: info.cwd,
                createdAt: info.createdAt
              })
            }
            terminalStore.setActiveSession(sessionId)
            const ui = useUiStore.getState()
            if (!ui.terminalPanelVisible) ui.toggleTerminalPanel()
            return { success: true }
          }
          default:
            return {}
        }
      }

      handle()
        .then((payload) => respond(true, payload))
        .catch((err) => {
          const errorText = err instanceof Error ? err.message : String(err)
          respond(false, undefined, errorText)
        })
    })

    return unsub
  }, [])

  // Appearance: sync accent, glass blur, particles, etc. to CSS variables
  const accentColor = useSettingsStore((s) => s.accentColor)
  const glassBlur = useSettingsStore((s) => s.glassBlur)
  const reduceMotion = useSettingsStore((s) => s.reduceMotion)
  const particleColor = useSettingsStore((s) => s.particleColor)
  const glowColor = useSettingsStore((s) => s.glowColor)
  const particleSpeed = useSettingsStore((s) => s.particleSpeed)
  const particleDensity = useSettingsStore((s) => s.particleDensity)
  const particleLifespan = useSettingsStore((s) => s.particleLifespan)

  useAppearance({ accentColor, glassBlur, reduceMotion, particleColor, glowColor, particleSpeed })

  // Initialize git and search when project root changes, handle project switch
  const projectRoot = useEditorStore((s) => s.projectRoot)

  // Keep Codex host bridge aligned with the active LiteEditor project root.
  useEffect(() => {
    window.api.codex.setProjectRoot(projectRoot ?? null)
  }, [projectRoot])

  // Auto-register project in the project store when projectRoot changes
  useEffect(() => {
    if (projectRoot) {
      useProjectStore.getState().addProject(projectRoot)
    }
  }, [projectRoot])

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
      <EmberSparks particleDensity={particleDensity} particleSpeed={particleSpeed} particleLifespan={particleLifespan} reduceMotion={reduceMotion} />
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
          {appMode === 'canvas' ? (
            <Suspense fallback={<div className="h-full" style={{ backgroundColor: 'var(--bg-base)' }} />}>
              <Canvas />
            </Suspense>
          ) : appMode === 'zen' ? (
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
      {appMode === 'canvas' && <AddPaneMenu />}
      <ToastViewport />
      <ConfirmDialog />
    </div>
  )
}
