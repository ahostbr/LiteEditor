import { ipcMain, BrowserWindow } from 'electron'
import { readFile, writeFile, readdir, stat } from 'fs/promises'
import { join, basename } from 'path'
import { FileWatcher } from '../services/file-watcher'

export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'out', '.cache',
  '__pycache__', '.vscode', '.idea', 'coverage', '.turbo'
])

async function buildTree(root: string, depth: number = 3, currentDepth: number = 0): Promise<FileNode[]> {
  if (currentDepth >= depth) return []

  const entries = await readdir(root, { withFileTypes: true })
  const nodes: FileNode[] = []

  const dirs: FileNode[] = []
  const files: FileNode[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env') continue
    if (IGNORED_DIRS.has(entry.name)) continue

    const fullPath = join(root, entry.name)

    if (entry.isDirectory()) {
      const children = await buildTree(fullPath, depth, currentDepth + 1)
      dirs.push({
        name: entry.name,
        path: fullPath,
        isDirectory: true,
        children
      })
    } else {
      files.push({
        name: entry.name,
        path: fullPath,
        isDirectory: false
      })
    }
  }

  // Directories first, then files, both alphabetical
  dirs.sort((a, b) => a.name.localeCompare(b.name))
  files.sort((a, b) => a.name.localeCompare(b.name))

  return [...dirs, ...files]
}

let fileWatcher: FileWatcher | null = null

export function registerFsHandlers(): void {
  ipcMain.handle('fs:read-file', async (_e, path: string) => {
    return readFile(path, 'utf-8')
  })

  ipcMain.handle('fs:write-file', async (_e, path: string, content: string) => {
    await writeFile(path, content, 'utf-8')
  })

  ipcMain.handle('fs:read-tree', async (_e, root: string, depth?: number) => {
    return buildTree(root, depth ?? 3)
  })

  ipcMain.on('fs:watch-start', (_e, path: string) => {
    if (fileWatcher) {
      fileWatcher.close()
    }
    fileWatcher = new FileWatcher(path, (event, filePath) => {
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
