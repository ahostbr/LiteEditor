import { ipcMain, BrowserWindow } from 'electron'
import { PtyManager } from '../services/pty-manager'

const ptyManager = new PtyManager()

export { ptyManager }

export function registerPtyHandlers(): void {
  ipcMain.handle('pty:create', async (_e, shell?: string, cwd?: string) => {
    const sessionId = ptyManager.create(shell, cwd, (data) => {
      const windows = BrowserWindow.getAllWindows()
      for (const win of windows) {
        win.webContents.send(`pty:data:${sessionId}`, data)
      }
    }, (exitCode) => {
      const windows = BrowserWindow.getAllWindows()
      for (const win of windows) {
        win.webContents.send(`pty:exit:${sessionId}`, exitCode)
      }
    })
    return sessionId
  })

  ipcMain.on('pty:write', (_e, sessionId: string, data: string) => {
    ptyManager.write(sessionId, data)
  })

  ipcMain.on('pty:resize', (_e, sessionId: string, cols: number, rows: number) => {
    ptyManager.resize(sessionId, cols, rows)
  })

  ipcMain.on('pty:kill', (_e, sessionId: string) => {
    ptyManager.kill(sessionId)
  })
}
