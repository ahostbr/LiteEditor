import { app, BrowserWindow, ipcMain, dialog, shell, screen, nativeTheme } from 'electron'
import { join } from 'path'
import { statSync } from 'fs'
import { registerFsHandlers, shutdownFsHandlers } from './ipc/fs-handlers'
import { registerGitHandlers } from './ipc/git-handlers'
import { registerPtyHandlers, shutdownPtyHandlers, ptyManager } from './ipc/pty-handlers'
import { registerSearchHandlers } from './ipc/search-handlers'
import { registerBrowserHandlers, shutdownBrowserHandlers, browserManager } from './ipc/browser-handlers'
import { registerClaudeHandlers, shutdownClaudeHandlers } from './ipc/claude-handlers'
import { registerCodexHandlers, shutdownCodexHandlers } from './ipc/codex-handlers'
import { registerWorkspaceHandlers } from './ipc/workspace-handlers'
import { registerProjectHandlers } from './ipc/project-handlers'
import { registerWorkspaceCrudHandlers } from './ipc/workspace-crud-handlers'
import { registerIntegrationsHandlers, shutdownIntegrationsHandlers } from './ipc/integrations-handlers'
import { registerScriptHandlers, shutdownScriptHandlers } from './ipc/script-handlers'
import { registerGitHubHandlers } from './ipc/github-handlers'
import { AgentBridge } from './services/agent-bridge'
import { registerAboutHandlers } from 'lite-ui/app-info-handler'

// Limit V8 heap — default scales with system RAM and gets way too aggressive
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512')

let mainWindow: BrowserWindow | null = null
let pendingFilePath: string | null = null
let forceQuit = false
let preSpanBounds: Electron.Rectangle | null = null
let isSpanned = false
// MCP is now handled by LiteCore (litemcp + mcp_0ne gateway).
// The Agent Bridge HTTP API remains — LiteCore's litemcp `editor` tool connects to it.
const agentBridge = new AgentBridge(ptyManager, browserManager, () => mainWindow)

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
    const arg = argv[i].replace(/^"(.*)"$/, '$1')
    if (arg.startsWith('-') || arg.startsWith('--')) continue
    if (arg.endsWith('.js') || arg.endsWith('.mjs')) continue
    // Check if it looks like a file path (has a dot extension or backslash/forward slash)
    if (!(arg.includes('\\') || arg.includes('/') || arg.includes('.'))) continue

    // Only treat existing files as launch files. Ignore directories and invalid paths.
    try {
      const st = statSync(arg)
      if (st.isFile()) return arg
    } catch {
      continue
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
  // Force dark mode for all native views (browser, Claude, Codex WebContentsViews)
  nativeTheme.themeSource = 'dark'

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
  try { registerProjectHandlers() } catch (e) { console.error('Failed to register project handlers:', e) }
  try { registerWorkspaceCrudHandlers() } catch (e) { console.error('Failed to register workspace CRUD handlers:', e) }
  try { registerWorkspaceHandlers() } catch (e) { console.error('Failed to register workspace handlers:', e) }
  try { registerFsHandlers() } catch (e) { console.error('Failed to register fs handlers:', e) }
  try { registerGitHandlers() } catch (e) { console.error('Failed to register git handlers:', e) }
  try { registerPtyHandlers() } catch (e) { console.error('Failed to register pty handlers:', e) }
  try { registerSearchHandlers() } catch (e) { console.error('Failed to register search handlers:', e) }
  try { registerBrowserHandlers(mainWindow!) } catch (e) { console.error('Failed to register browser handlers:', e) }
  try { registerClaudeHandlers(mainWindow!) } catch (e) { console.error('Failed to register claude handlers:', e) }
  try { registerCodexHandlers(mainWindow!) } catch (e) { console.error('Failed to register codex handlers:', e) }
  try { registerIntegrationsHandlers(mainWindow!) } catch (e) { console.error('Failed to register integrations handlers:', e) }
  try { registerScriptHandlers() } catch (e) { console.error('Failed to register script handlers:', e) }
  try { registerGitHubHandlers() } catch (e) { console.error('Failed to register GitHub handlers:', e) }
  try {
    registerAboutHandlers({
      appName: 'LiteEditor',
      appDescription: 'Lightweight desktop code editor built with Monaco Editor. Features integrated terminal, Git integration, file explorer, and project-wide search.',
      links: [
        { label: 'litesuite.dev', url: 'https://litesuite.dev' },
        { label: 'GitHub', url: 'https://github.com/ahostbr/LiteEditor' },
      ],
    })
  } catch (e) { console.error('Failed to register about handlers:', e) }

  // Verify critical IPC handlers are registered
  const criticalChannels = ['fs:read-file', 'fs:read-tree', 'fs:write-file', 'dialog:open-file']
  const registeredChannels = (ipcMain as any)._invokeHandlers
    ? Object.keys((ipcMain as any)._invokeHandlers)
    : []
  const missingChannels = criticalChannels.filter((ch) => !registeredChannels.includes(ch))
  if (missingChannels.length > 0) {
    console.error('[IPC Health Check] CRITICAL: Missing IPC handlers:', missingChannels.join(', '))
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.send('ipc:health-warning', missingChannels)
    })
  } else {
    console.log('[IPC Health Check] All critical handlers registered')
  }

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
  try {
    await agentBridge.start()
  } catch (err) {
    console.error('Failed to start Agent Bridge:', err)
  }
  createWindow()
})

app.on('before-quit', () => {
  shutdownPtyHandlers()
  shutdownFsHandlers()
  shutdownBrowserHandlers()
  shutdownClaudeHandlers()
  shutdownCodexHandlers()
  shutdownIntegrationsHandlers()
  shutdownScriptHandlers()
  agentBridge.stop()
})

app.on('window-all-closed', () => {
  agentBridge.stop()
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
