import { ipcMain, BrowserWindow } from 'electron'
import { ScriptDetectionService } from '../services/script-detection-service'
import { DevServerManager } from '../services/dev-server-manager'

const scriptDetection = new ScriptDetectionService()
const devServerManager = new DevServerManager()

export { devServerManager }

export function registerScriptHandlers(): void {
  ipcMain.handle('scripts:detect', async (_e, rootPath: string) => {
    return scriptDetection.detectScripts(rootPath)
  })

  ipcMain.handle('scripts:start', async (_e, projectId: string, scriptName: string, cwd: string) => {
    return devServerManager.startScript(projectId, scriptName, cwd)
  })

  ipcMain.handle('scripts:stop', async (_e, sessionId: string) => {
    devServerManager.stopScript(sessionId)
  })

  ipcMain.handle('scripts:running', async () => {
    return devServerManager.getRunningScripts()
  })

  // Forward status change events to all renderer windows
  devServerManager.onStatusChange((event) => {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      win.webContents.send('scripts:status-changed', event)
    }
  })
}

export function shutdownScriptHandlers(): void {
  devServerManager.killAll()
}
