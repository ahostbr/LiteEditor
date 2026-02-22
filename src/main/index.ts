import { app, BrowserWindow, ipcMain, dialog, shell, screen } from 'electron'
import { join, dirname } from 'path'
import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { homedir } from 'os'
import { registerFsHandlers, shutdownFsHandlers } from './ipc/fs-handlers'
import { registerGitHandlers } from './ipc/git-handlers'
import { registerPtyHandlers } from './ipc/pty-handlers'
import { registerSearchHandlers } from './ipc/search-handlers'

// Limit V8 heap — default scales with system RAM and gets way too aggressive
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512')

let mainWindow: BrowserWindow | null = null
let pendingFilePath: string | null = null
let forceQuit = false
let preSpanBounds: Electron.Rectangle | null = null
let isSpanned = false

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

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
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
    // Send file from initial launch argv
    const fileFromArgv = getFileFromArgs(process.argv)
    if (fileFromArgv) {
      mainWindow?.webContents.send('file:open', fileFromArgv)
    }
    // Send any pending file from second-instance that arrived before window was ready
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

  // Settings IPC
  const settingsDir = join(homedir(), '.liteeditor')
  const settingsFile = join(settingsDir, 'settings.json')

  ipcMain.handle('settings:load', async () => {
    try {
      const content = await readFile(settingsFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  })

  ipcMain.handle('settings:save', async (_e, data: string) => {
    try {
      await mkdir(settingsDir, { recursive: true })
      await writeFile(settingsFile, data, 'utf-8')
    } catch { /* ignore */ }
  })

  // Workspace IPC
  const workspaceFile = join(settingsDir, 'workspace.json')

  ipcMain.handle('workspace:load', async () => {
    try {
      const content = await readFile(workspaceFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  })

  ipcMain.handle('workspace:save', async (_e, data: string) => {
    try {
      await mkdir(settingsDir, { recursive: true })
      await writeFile(workspaceFile, data, 'utf-8')
    } catch { /* ignore */ }
  })

  // Register IPC handler modules
  try { registerFsHandlers() } catch (e) { console.error('Failed to register fs handlers:', e) }
  try { registerGitHandlers() } catch (e) { console.error('Failed to register git handlers:', e) }
  try { registerPtyHandlers() } catch (e) { console.error('Failed to register pty handlers:', e) }
  try { registerSearchHandlers() } catch (e) { console.error('Failed to register search handlers:', e) }

  // Load renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('before-quit', () => {
  shutdownFsHandlers()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
