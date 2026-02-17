import { contextBridge, ipcRenderer, webFrame } from 'electron'

const api = {
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
    setZoomLevel: (level: number): void => { webFrame.setZoomLevel(level) }
  },

  settings: {
    load: (): Promise<unknown> =>
      ipcRenderer.invoke('settings:load'),
    save: (data: string): Promise<void> =>
      ipcRenderer.invoke('settings:save', data)
  },

  workspace: {
    load: (): Promise<unknown> =>
      ipcRenderer.invoke('workspace:load'),
    save: (data: string): Promise<void> =>
      ipcRenderer.invoke('workspace:save', data)
  },

  dialog: {
    openFolder: (): Promise<string | null> =>
      ipcRenderer.invoke('dialog:open-folder')
  },

  onOpenFile: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_e: unknown, filePath: string) => callback(filePath)
    ipcRenderer.on('file:open', handler)
    return () => ipcRenderer.removeListener('file:open', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api
