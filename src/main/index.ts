import { app, BrowserWindow, ipcMain, dialog, shell, screen } from 'electron'
import { join } from 'path'
import { spawn, ChildProcess } from 'child_process'
import { registerFsHandlers, shutdownFsHandlers } from './ipc/fs-handlers'
import { registerGitHandlers } from './ipc/git-handlers'
import { registerPtyHandlers, ptyManager } from './ipc/pty-handlers'
import { registerSearchHandlers } from './ipc/search-handlers'
import { registerBrowserHandlers, shutdownBrowserHandlers, browserManager } from './ipc/browser-handlers'
import { registerClaudeHandlers, shutdownClaudeHandlers } from './ipc/claude-handlers'
import { registerCodexHandlers, shutdownCodexHandlers } from './ipc/codex-handlers'
import { registerWorkspaceHandlers } from './ipc/workspace-handlers'
import { registerIntegrationsHandlers, shutdownIntegrationsHandlers } from './ipc/integrations-handlers'
import { AgentBridge } from './services/agent-bridge'

// Limit V8 heap — default scales with system RAM and gets way too aggressive
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512')

let mainWindow: BrowserWindow | null = null
let pendingFilePath: string | null = null
let forceQuit = false
let preSpanBounds: Electron.Rectangle | null = null
let isSpanned = false
let mcpServer: ChildProcess | null = null
const agentBridge = new AgentBridge(ptyManager, browserManager, () => mainWindow)

function startMcpServer(): void {
  const serverScript = app.isPackaged
    ? join(process.resourcesPath, 'mcp-server', 'server.py')
    : join(app.getAppPath(), 'src', 'mcp-server', 'server.py')

  mcpServer = spawn('python', [serverScript], {
    stdio: 'ignore',
    env: { ...process.env, MCP_TRANSPORT: 'sse', MCP_PORT: '7422', BRIDGE_TOKEN: agentBridge.token }
  })

  mcpServer.on('error', (err) => {
    console.error('MCP server failed to start:', err)
    mcpServer = null
  })
  mcpServer.on('exit', (code) => {
    console.log('MCP server exited with code:', code)
    mcpServer = null
  })
}

function stopMcpServer(): void {
  if (mcpServer && !mcpServer.killed) {
    const pid = mcpServer.pid
    mcpServer.kill()
    // On Windows, child_process.kill() sends SIGTERM which Python ignores.
    // Force-kill the process tree to prevent zombie Python processes.
    if (pid && process.platform === 'win32') {
      try {
        require('child_process').execSync(`taskkill /pid ${pid} /T /F`, { windowsHide: true, stdio: 'ignore' })
      } catch { /* already dead */ }
    }
    mcpServer = null
  }
}

function killOrphanedMcpServers(): void {
  if (process.platform !== 'win32') return
  try {
    const { execSync } = require('child_process')
    const result = execSync(
      'wmic process where "commandline like \'%mcp-server%server.py%\'" get processid /format:csv',
      { windowsHide: true, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
    )
    const pids = result.split('\n')
      .map((line: string) => line.trim().split(',').pop()?.trim())
      .filter((pid: string | undefined) => pid && /^\d+$/.test(pid))
    for (const pid of pids) {
      try { execSync(`taskkill /pid ${pid} /T /F`, { windowsHide: true, stdio: 'ignore' }) } catch { /* */ }
    }
    if (pids.length > 0) console.log(`Killed ${pids.length} orphaned MCP server(s)`)
  } catch { /* no orphans */ }
}

function getUnionBounds(): Electron.Rectangle {
  const displays = screen.getAllDisplays()
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const display of displays) {
    const { x, y, width, height } = display.bounds
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/** Extract a file path from argv (skips electron/app flags and .js files) */
function getFileFromArgs(argv: string[]): string | null {
  // argv[0] is electron exe, argv[1] may be the app .js entry in dev
  // In packaged app, argv[0] is the .exe, rest are args
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('-') || arg.startsWith('--')) continue
    if (arg.endsWith('.js') || arg.endsWith('.mjs')) continue
    // Check if it looks like a file path (has a dot extension or backslash/forward slash)
    if (arg.includes('\\') || arg.includes('/') || arg.includes('.')) {
      return arg
    }
  }
  return null
}

function sendFileToRenderer(filePath: string): void {
  if (mainWindow && mainWindow.webContents) {
    if (mainWindow.webContents.isLoading()) {
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow?.webContents.send('file:open', filePath)
      })
    } else {
      mainWindow.webContents.send('file:open', filePath)
    }
  } else {
    pendingFilePath = filePath
  }
}

// Single instance lock (skip in test mode so Playwright can launch sequential instances)
const isTest = process.env.NODE_ENV === 'test'
const gotTheLock = isTest || app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    const filePath = getFileFromArgs(argv)
    if (filePath) {
      sendFileToRenderer(filePath)
    }
    // Focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0c0c0f',
    show: false,
    icon: join(__dirname, '../../resources/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // F12 toggles DevTools for debugging
  mainWindow.webContents.on('before-input-event', (_e, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow?.webContents.toggleDevTools()
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    // Initial launch file is now handled via query param (see loadFile/loadURL below)
    // Only send pending files from second-instance that arrived before window was ready
    if (pendingFilePath) {
      mainWindow?.webContents.send('file:open', pendingFilePath)
      pendingFilePath = null
    }
  })

  // Fallback: show window after timeout even if ready-to-show doesn't fire
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show()
    }
  }, 5000)

  // Log renderer errors
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error('Failed to load:', code, desc)
  })
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.error('Renderer crashed:', details)
  })

  // Minimize instead of closing unless force-quit requested
  mainWindow.on('close', (e) => {
    if (!forceQuit) {
      e.preventDefault()
      mainWindow?.minimize()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Window control IPC
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.on('window:close', () => mainWindow?.close())
  ipcMain.on('window:quit', () => {
    forceQuit = true
    app.quit()
  })
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false)

  ipcMain.on('window:span-all-monitors', () => {
    if (!mainWindow || isSpanned) return
    preSpanBounds = mainWindow.getBounds()
    const union = getUnionBounds()
    mainWindow.setMinimumSize(1, 1)
    mainWindow.setBounds(union)
    isSpanned = true
    mainWindow.webContents.send('window:span-change', true)
  })

  ipcMain.on('window:restore-span', () => {
    if (!mainWindow || !isSpanned) return
    if (preSpanBounds) {
      mainWindow.setBounds(preSpanBounds)
    }
    mainWindow.setMinimumSize(800, 600)
    isSpanned = false
    preSpanBounds = null
    mainWindow.webContents.send('window:span-change', false)
  })

  ipcMain.handle('window:is-spanned', () => isSpanned)

  screen.on('display-removed', () => {
    if (isSpanned && mainWindow) {
      const primary = screen.getPrimaryDisplay()
      mainWindow.setBounds(primary.workArea)
      mainWindow.setMinimumSize(800, 600)
      isSpanned = false
      preSpanBounds = null
      mainWindow.webContents.send('window:span-change', false)
    }
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximize-change', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-change', false)
  })

  // Open folder dialog
  ipcMain.handle('dialog:open-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  // Open file dialog
  ipcMain.handle('dialog:open-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  // Save file dialog
  ipcMain.handle('dialog:save-file', async (_e, defaultName?: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: defaultName,
      properties: ['showOverwriteConfirmation']
    })
    if (result.canceled) return null
    return result.filePath ?? null
  })

  // Message box dialog
  ipcMain.handle('dialog:show-message-box', async (_e, options: Electron.MessageBoxOptions) => {
    const result = await dialog.showMessageBox(mainWindow!, options)
    return result.response
  })

  // Shell operations
  ipcMain.on('shell:open-external', (_e, url: string) => {
    shell.openExternal(url)
  })
  ipcMain.on('shell:open-path', (_e, path: string) => {
    shell.openPath(path)
  })

  // Register IPC handler modules
  try { registerWorkspaceHandlers() } catch (e) { console.error('Failed to register workspace handlers:', e) }
  try { registerFsHandlers() } catch (e) { console.error('Failed to register fs handlers:', e) }
  try { registerGitHandlers() } catch (e) { console.error('Failed to register git handlers:', e) }
  try { registerPtyHandlers() } catch (e) { console.error('Failed to register pty handlers:', e) }
  try { registerSearchHandlers() } catch (e) { console.error('Failed to register search handlers:', e) }
  try { registerBrowserHandlers(mainWindow!) } catch (e) { console.error('Failed to register browser handlers:', e) }
  try { registerClaudeHandlers(mainWindow!) } catch (e) { console.error('Failed to register claude handlers:', e) }
  try { registerCodexHandlers(mainWindow!) } catch (e) { console.error('Failed to register codex handlers:', e) }
  try { registerIntegrationsHandlers(mainWindow!) } catch (e) { console.error('Failed to register integrations handlers:', e) }

  // Load renderer — pass launch file as query param so renderer can open it
  // after workspace restoration (avoids race condition with file:open IPC)
  const launchFile = getFileFromArgs(process.argv)
  const query = launchFile ? { openFile: launchFile } : undefined

  if (process.env['ELECTRON_RENDERER_URL']) {
    const url = new URL(process.env['ELECTRON_RENDERER_URL'])
    if (launchFile) url.searchParams.set('openFile', launchFile)
    mainWindow.loadURL(url.toString())
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { query: query as Record<string, string> })
  }
}

app.whenReady().then(async () => {
  killOrphanedMcpServers()
  try {
    await agentBridge.start()
  } catch (err) {
    console.error('Failed to start Agent Bridge:', err)
  }
  startMcpServer()
  createWindow()

})

app.on('before-quit', () => {
  shutdownFsHandlers()
  shutdownBrowserHandlers()
  shutdownClaudeHandlers()
  shutdownCodexHandlers()
  shutdownIntegrationsHandlers()
  agentBridge.stop()
  stopMcpServer()
})

app.on('window-all-closed', () => {
  agentBridge.stop()
  stopMcpServer()
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
