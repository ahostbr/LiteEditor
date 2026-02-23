import { ipcMain, BrowserWindow } from 'electron'
import { ClaudeManager } from '../services/claude-manager'
import { ClaudeBridge } from '../services/claude-bridge'

const claudeManager = new ClaudeManager()
const claudeBridge = new ClaudeBridge(claudeManager)

export { claudeManager }

export function registerClaudeHandlers(mainWindow: BrowserWindow): void {
  // Lifecycle: create Claude WebContentsView
  ipcMain.handle('claude:create-session', async () => {
    return claudeManager.createSession(mainWindow)
  })

  // Lifecycle: destroy session
  ipcMain.on('claude:destroy-session', (_e, sessionId: string) => {
    claudeBridge.shutdown() // kill any subprocesses for this session
    claudeManager.destroySession(sessionId)
  })

  // Lifecycle: set view bounds (from renderer rAF loop)
  ipcMain.on('claude:set-bounds', (_e, sessionId: string, bounds: { x: number; y: number; width: number; height: number }) => {
    claudeManager.setBounds(sessionId, bounds)
  })

  // Lifecycle: show/hide view (tab visibility)
  ipcMain.on('claude:show-view', (_e, sessionId: string) => {
    claudeManager.showView(sessionId)
  })

  ipcMain.on('claude:hide-view', (_e, sessionId: string) => {
    claudeManager.hideView(sessionId)
  })

  // Message bridge: webview → host → claude.exe
  ipcMain.on('claude:webview-message', (_e, sessionId: string, message: any) => {
    claudeBridge.handleWebviewMessage(sessionId, message)
  })
}

export function shutdownClaudeHandlers(): void {
  claudeBridge.shutdown()
  claudeManager.removeAll()
}
