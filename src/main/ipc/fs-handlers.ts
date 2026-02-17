import { ipcMain, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { FileWatcher } from '../services/file-watcher'
import { FileTreeDB } from '../services/file-tree-db'

let fileWatcher: FileWatcher | null = null
let fileTreeDB: FileTreeDB | null = null
let currentRoot: string | null = null

export function registerFsHandlers(): void {
  fileTreeDB = new FileTreeDB()

  ipcMain.handle('fs:read-file', async (_e, path: string) => {
    return readFile(path, 'utf-8')
  })

  ipcMain.handle('fs:write-file', async (_e, path: string, content: string) => {
    await writeFile(path, content, 'utf-8')
  })

  ipcMain.handle('fs:read-tree', async (_e, root: string, _depth?: number) => {
    if (!fileTreeDB) return []
    if (root !== currentRoot) {
      fileTreeDB.clear()
      currentRoot = root
    }
    return fileTreeDB.initRoot(root)
  })

  ipcMain.handle('fs:read-dir', async (_e, dirPath: string) => {
    if (!fileTreeDB) return []
    return fileTreeDB.getChildren(dirPath)
  })

  ipcMain.on('fs:watch-start', (_e, path: string) => {
    if (fileWatcher) {
      fileWatcher.close()
    }
    fileWatcher = new FileWatcher(path, (event, filePath) => {
      // Targeted invalidation: only mark the affected directory as stale
      if (fileTreeDB) {
        fileTreeDB.invalidatePath(filePath)
      }
      const windows = BrowserWindow.getAllWindows()
      for (const win of windows) {
        win.webContents.send('fs:file-changed', event, filePath)
      }
    })
  })

  ipcMain.on('fs:watch-stop', () => {
    if (fileWatcher) {
      fileWatcher.close()
      fileWatcher = null
    }
  })
}

export function shutdownFsHandlers(): void {
  fileWatcher?.close()
  fileTreeDB?.close()
}
