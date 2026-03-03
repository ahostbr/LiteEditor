import { contextBridge, ipcRenderer, webFrame } from 'electron'

declare const __COMMIT_HASH__: string
declare const __BUILD_DATE__: string

type NativeViewBounds = {
  x: number
  y: number
  width: number
  height: number
  viewportWidth?: number
  viewportHeight?: number
}

type PtySessionInfo = {
  id: string
  pid: number
  shell: string
  cwd: string
  createdAt: number
}

type IntegrationId = 'codex' | 'claude'

type IntegrationState =
  | 'not_installed'
  | 'installed_managed'
  | 'installed_external'
  | 'update_available'
  | 'broken'
  | 'verifying'
  | 'downloading'
  | 'installing'
  | 'failed'

type IntegrationStatus = {
  id: IntegrationId
  state: IntegrationState
  installedVersion: string | null
  latestVersion: string | null
  source: 'managed' | 'external' | null
  verified: boolean
  lastVerifiedAt: number | null
  message?: string
}

type IntegrationProgress = {
  id: IntegrationId
  stage: 'checking' | 'downloading' | 'verifying' | 'extracting' | 'installing' | 'finalizing' | 'done' | 'error'
  percent?: number
  message?: string
}

const api = {
  appInfo: {
    version: '1.0.0',
    commitHash: __COMMIT_HASH__,
    buildDate: __BUILD_DATE__,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    platform: process.platform
  },

  fs: {
    readFile: (path: string): Promise<string> =>
      ipcRenderer.invoke('fs:read-file', path),
    writeFile: (path: string, content: string): Promise<void> =>
      ipcRenderer.invoke('fs:write-file', path, content),
    readTree: (root: string, depth?: number): Promise<unknown[]> =>
      ipcRenderer.invoke('fs:read-tree', root, depth),
    readDir: (dirPath: string): Promise<unknown[]> =>
      ipcRenderer.invoke('fs:read-dir', dirPath),
    watchStart: (path: string): void =>
      ipcRenderer.send('fs:watch-start', path),
    watchStop: (): void =>
      ipcRenderer.send('fs:watch-stop'),
    watchDir: (path: string): void =>
      ipcRenderer.send('fs:watch-dir', path),
    unwatchDir: (path: string): void =>
      ipcRenderer.send('fs:unwatch-dir', path),
    onFileChange: (callback: (event: string, path: string) => void): (() => void) => {
      const handler = (_e: unknown, event: string, path: string) => callback(event, path)
      ipcRenderer.on('fs:file-changed', handler)
      return () => ipcRenderer.removeListener('fs:file-changed', handler)
    },
    showInExplorer: (path: string): void =>
      ipcRenderer.send('shell:open-path', path)
  },

  git: {
    init: (root: string): Promise<void> =>
      ipcRenderer.invoke('git:init', root),
    status: (): Promise<unknown[]> =>
      ipcRenderer.invoke('git:status'),
    diff: (path: string): Promise<string> =>
      ipcRenderer.invoke('git:diff', path),
    diffCached: (path: string): Promise<string> =>
      ipcRenderer.invoke('git:diff-cached', path),
    stage: (path: string): Promise<void> =>
      ipcRenderer.invoke('git:stage', path),
    stageAll: (): Promise<void> =>
      ipcRenderer.invoke('git:stage-all'),
    unstage: (path: string): Promise<void> =>
      ipcRenderer.invoke('git:unstage', path),
    unstageAll: (): Promise<void> =>
      ipcRenderer.invoke('git:unstage-all'),
    commit: (summary: string, description?: string): Promise<void> =>
      ipcRenderer.invoke('git:commit', summary, description),
    push: (): Promise<unknown> =>
      ipcRenderer.invoke('git:push'),
    pull: (): Promise<void> =>
      ipcRenderer.invoke('git:pull'),
    fetch: (): Promise<void> =>
      ipcRenderer.invoke('git:fetch'),
    log: (limit?: number): Promise<unknown[]> =>
      ipcRenderer.invoke('git:log', limit),
    branches: (): Promise<unknown[]> =>
      ipcRenderer.invoke('git:branches'),
    currentBranch: (): Promise<unknown> =>
      ipcRenderer.invoke('git:current-branch'),
    checkout: (name: string): Promise<void> =>
      ipcRenderer.invoke('git:checkout', name),
    createBranch: (name: string): Promise<void> =>
      ipcRenderer.invoke('git:create-branch', name),
    deleteBranch: (name: string, force?: boolean): Promise<void> =>
      ipcRenderer.invoke('git:delete-branch', name, force),
    getFileAtRevision: (path: string, rev: string): Promise<string> =>
      ipcRenderer.invoke('git:file-at-revision', path, rev),
    discardChanges: (path: string): Promise<void> =>
      ipcRenderer.invoke('git:discard-changes', path)
  },

  pty: {
    create: (shell?: string, cwd?: string): Promise<string> =>
      ipcRenderer.invoke('pty:create', shell, cwd),
    getSessionInfo: (sessionId: string): Promise<PtySessionInfo | null> =>
      ipcRenderer.invoke('pty:get-session-info', sessionId),
    write: (sessionId: string, data: string): void =>
      ipcRenderer.send('pty:write', sessionId, data),
    resize: (sessionId: string, cols: number, rows: number): void =>
      ipcRenderer.send('pty:resize', sessionId, cols, rows),
    kill: (sessionId: string): void =>
      ipcRenderer.send('pty:kill', sessionId),
    onData: (sessionId: string, callback: (data: string) => void): (() => void) => {
      const channel = `pty:data:${sessionId}`
      const handler = (_e: unknown, data: string) => callback(data)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    },
    onExit: (sessionId: string, callback: (exitCode: number) => void): (() => void) => {
      const channel = `pty:exit:${sessionId}`
      const handler = (_e: unknown, exitCode: number) => callback(exitCode)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    }
  },

  search: {
    setRoot: (root: string): Promise<void> =>
      ipcRenderer.invoke('search:set-root', root),
    searchFiles: (query: string, options: unknown): Promise<unknown[]> =>
      ipcRenderer.invoke('search:files', query, options)
  },

  browser: {
    // View lifecycle (WebContentsView managed by main process)
    createView: (initialUrl: string): Promise<string> =>
      ipcRenderer.invoke('browser:create-view', initialUrl),
    destroyView: (sessionId: string): void =>
      ipcRenderer.send('browser:destroy-view', sessionId),
    setBounds: (sessionId: string, bounds: NativeViewBounds): void =>
      ipcRenderer.send('browser:set-bounds', sessionId, bounds),
    showView: (sessionId: string): void =>
      ipcRenderer.send('browser:show-view', sessionId),
    hideView: (sessionId: string): void =>
      ipcRenderer.send('browser:hide-view', sessionId),
    onStateUpdate: (callback: (event: unknown, data: { sessionId: string; url?: string; title?: string; canGoBack?: boolean; canGoForward?: boolean; isLoading?: boolean }) => void): (() => void) => {
      const handler = (_e: unknown, data: { sessionId: string; url?: string; title?: string; canGoBack?: boolean; canGoForward?: boolean; isLoading?: boolean }) => callback(_e, data)
      ipcRenderer.on('browser:state-update', handler)
      return () => ipcRenderer.removeListener('browser:state-update', handler)
    },
    // Navigation
    navigate: (sessionId: string, url: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:navigate', sessionId, url),
    goBack: (sessionId: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:go-back', sessionId),
    goForward: (sessionId: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:go-forward', sessionId),
    reload: (sessionId: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:reload', sessionId),
    stop: (sessionId: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:stop', sessionId),
    // Agent tools
    readPage: (sessionId: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:read-page', sessionId),
    screenshot: (sessionId: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:screenshot', sessionId),
    click: (sessionId: string, index: number): Promise<unknown> =>
      ipcRenderer.invoke('browser:click', sessionId, index),
    type: (sessionId: string, text: string, index?: number): Promise<unknown> =>
      ipcRenderer.invoke('browser:type', sessionId, text, index),
    scroll: (sessionId: string, direction: string, amount: number): Promise<unknown> =>
      ipcRenderer.invoke('browser:scroll', sessionId, direction, amount),
    selectOption: (sessionId: string, elementIndex: number, optionIndex: number): Promise<unknown> =>
      ipcRenderer.invoke('browser:select-option', sessionId, elementIndex, optionIndex),
    executeJs: (sessionId: string, code: string): Promise<unknown> =>
      ipcRenderer.invoke('browser:execute-js', sessionId, code),
    consoleLogs: (sessionId: string, since?: number): Promise<unknown> =>
      ipcRenderer.invoke('browser:console-logs', sessionId, since),
    listSessions: (): Promise<string[]> =>
      ipcRenderer.invoke('browser:list-sessions')
  },

  claude: {
    createSession: (): Promise<string> =>
      ipcRenderer.invoke('claude:create-session'),
    destroySession: (sessionId: string): void =>
      ipcRenderer.send('claude:destroy-session', sessionId),
    setBounds: (sessionId: string, bounds: NativeViewBounds): void =>
      ipcRenderer.send('claude:set-bounds', sessionId, bounds),
    showView: (sessionId: string): void =>
      ipcRenderer.send('claude:show-view', sessionId),
    hideView: (sessionId: string): void =>
      ipcRenderer.send('claude:hide-view', sessionId),
    onHostOp: (callback: (request: { id: string; op: string; payload?: Record<string, unknown> }) => void): (() => void) => {
      const handler = (_e: unknown, request: { id: string; op: string; payload?: Record<string, unknown> }) => callback(request)
      ipcRenderer.on('claude:host-op', handler)
      return () => ipcRenderer.removeListener('claude:host-op', handler)
    },
    sendHostOpResult: (result: { id: string; ok: boolean; payload?: Record<string, unknown>; error?: string }): void =>
      ipcRenderer.send('claude:host-op-result', result)
  },

  codex: {
    createSession: (): Promise<string> =>
      ipcRenderer.invoke('codex:create-session'),
    destroySession: (sessionId: string): void =>
      ipcRenderer.send('codex:destroy-session', sessionId),
    setProjectRoot: (projectRoot: string | null): void =>
      ipcRenderer.send('codex:set-project-root', projectRoot),
    setBounds: (sessionId: string, bounds: NativeViewBounds): void =>
      ipcRenderer.send('codex:set-bounds', sessionId, bounds),
    showView: (sessionId: string): void =>
      ipcRenderer.send('codex:show-view', sessionId),
    hideView: (sessionId: string): void =>
      ipcRenderer.send('codex:hide-view', sessionId)
  },

  shell: {
    openExternal: (url: string): void =>
      ipcRenderer.send('shell:open-external', url),
    openPath: (path: string): void =>
      ipcRenderer.send('shell:open-path', path)
  },

  window: {
    minimize: (): void => ipcRenderer.send('window:minimize'),
    maximize: (): void => ipcRenderer.send('window:maximize'),
    close: (): void => ipcRenderer.send('window:close'),
    quit: (): void => ipcRenderer.send('window:quit'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),
    onMaximizeChange: (callback: (maximized: boolean) => void): (() => void) => {
      const handler = (_e: unknown, maximized: boolean) => callback(maximized)
      ipcRenderer.on('window:maximize-change', handler)
      return () => ipcRenderer.removeListener('window:maximize-change', handler)
    },
    zoomIn: (): number => { const l = webFrame.getZoomLevel() + 0.5; webFrame.setZoomLevel(l); return l },
    zoomOut: (): number => { const l = webFrame.getZoomLevel() - 0.5; webFrame.setZoomLevel(l); return l },
    zoomReset: (): number => { webFrame.setZoomLevel(0); return 0 },
    getZoomLevel: (): number => webFrame.getZoomLevel(),
    setZoomLevel: (level: number): void => { webFrame.setZoomLevel(level) },
    spanAllMonitors: (): void => ipcRenderer.send('window:span-all-monitors'),
    restoreSpan: (): void => ipcRenderer.send('window:restore-span'),
    isSpanned: (): Promise<boolean> => ipcRenderer.invoke('window:is-spanned'),
    onSpanChange: (callback: (spanned: boolean) => void): (() => void) => {
      const handler = (_e: unknown, spanned: boolean) => callback(spanned)
      ipcRenderer.on('window:span-change', handler)
      return () => ipcRenderer.removeListener('window:span-change', handler)
    }
  },

  settings: {
    load: (): Promise<unknown> =>
      ipcRenderer.invoke('settings:load'),
    save: (data: string): Promise<void> =>
      ipcRenderer.invoke('settings:save', data)
  },

  integrations: {
    listStatus: (): Promise<IntegrationStatus[]> =>
      ipcRenderer.invoke('integrations:list-status'),
    checkUpdates: (integrationId?: IntegrationId): Promise<IntegrationStatus[]> =>
      ipcRenderer.invoke('integrations:check-updates', integrationId),
    install: (integrationId: IntegrationId, options?: { reinstall?: boolean }): Promise<IntegrationStatus> =>
      ipcRenderer.invoke('integrations:install', integrationId, options),
    update: (integrationId: IntegrationId): Promise<IntegrationStatus> =>
      ipcRenderer.invoke('integrations:update', integrationId),
    verify: (integrationId: IntegrationId): Promise<IntegrationStatus> =>
      ipcRenderer.invoke('integrations:verify', integrationId),
    revealPath: (integrationId: IntegrationId): Promise<string | null> =>
      ipcRenderer.invoke('integrations:reveal-path', integrationId),
    revealLog: (integrationId: IntegrationId): Promise<string | null> =>
      ipcRenderer.invoke('integrations:reveal-log', integrationId),
    onProgress: (callback: (progress: IntegrationProgress) => void): (() => void) => {
      const handler = (_e: unknown, progress: IntegrationProgress) => callback(progress)
      ipcRenderer.on('integrations:progress', handler)
      return () => ipcRenderer.removeListener('integrations:progress', handler)
    }
  },

  workspace: {
    load: (): Promise<unknown> =>
      ipcRenderer.invoke('workspace:load'),
    save: (data: string): Promise<void> =>
      ipcRenderer.invoke('workspace:save', data),
    loadState: (projectRoot: string): Promise<unknown> =>
      ipcRenderer.invoke('workspace:load-state', projectRoot),
    saveState: (projectRoot: string, state: string): Promise<void> =>
      ipcRenderer.invoke('workspace:save-state', projectRoot, state),
    loadSettings: (projectRoot: string): Promise<unknown> =>
      ipcRenderer.invoke('workspace:load-settings', projectRoot),
    saveSettings: (projectRoot: string, data: string): Promise<void> =>
      ipcRenderer.invoke('workspace:save-settings', projectRoot, data)
  },

  dialog: {
    openFolder: (): Promise<string | null> =>
      ipcRenderer.invoke('dialog:open-folder'),
    openFile: (): Promise<string | null> =>
      ipcRenderer.invoke('dialog:open-file'),
    saveFile: (defaultName?: string): Promise<string | null> =>
      ipcRenderer.invoke('dialog:save-file', defaultName),
    showMessageBox: (options: { type?: string; title?: string; message: string; detail?: string; buttons?: string[]; defaultId?: number; cancelId?: number }): Promise<number> =>
      ipcRenderer.invoke('dialog:show-message-box', options)
  },

  onOpenFile: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_e: unknown, filePath: string) => callback(filePath)
    ipcRenderer.on('file:open', handler)
    return () => ipcRenderer.removeListener('file:open', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api
