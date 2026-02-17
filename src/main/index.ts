import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { homedir } from 'os'
import { registerFsHandlers } from './ipc/fs-handlers'
import { registerGitHandlers } from './ipc/git-handlers'
import { registerPtyHandlers } from './ipc/pty-handlers'
import { registerSearchHandlers } from './ipc/search-handlers'

let mainWindow: BrowserWindow | null = null

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
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false)

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

  // Register IPC handler modules
  registerFsHandlers()
  registerGitHandlers()
  registerPtyHandlers()
  registerSearchHandlers()

  // Load renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
