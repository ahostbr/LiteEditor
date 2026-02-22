import { ipcMain } from 'electron'
import { BrowserManager } from '../services/browser-manager'
import {
  DOM_INDEX_SCRIPT,
  getClickScript,
  getTypeScript,
  getScrollScript,
  getSelectOptionScript
} from '../services/dom-helper'

const browserManager = new BrowserManager()

export { browserManager }

export function registerBrowserHandlers(): void {
  // Lifecycle: renderer registers webview's webContentsId
  ipcMain.handle('browser:register', async (_e, webContentsId: number) => {
    const sessionId = browserManager.register(webContentsId)
    return sessionId
  })

  // Lifecycle: renderer unregisters on panel close
  ipcMain.on('browser:unregister', (_e, sessionId: string) => {
    browserManager.remove(sessionId)
  })

  // Lifecycle: renderer notifies of URL change
  ipcMain.on('browser:url-changed', (_e, _sessionId: string, _url: string) => {
    // Currently a no-op on main side; renderer tracks URL in browser-store
  })

  // Agent tool: navigate to URL
  ipcMain.handle('browser:navigate', async (_e, sessionId: string, url: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }

      // Auto-prepend https:// if no protocol
      let targetUrl = url
      if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith('file://')) {
        targetUrl = 'https://' + targetUrl
      }

      await wc.loadURL(targetUrl)
      return { success: true, url: wc.getURL() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: go back
  ipcMain.handle('browser:go-back', async (_e, sessionId: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      if (!wc.canGoBack()) return { success: false, error: 'Cannot go back' }
      wc.goBack()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: go forward
  ipcMain.handle('browser:go-forward', async (_e, sessionId: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      if (!wc.canGoForward()) return { success: false, error: 'Cannot go forward' }
      wc.goForward()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: reload
  ipcMain.handle('browser:reload', async (_e, sessionId: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      wc.reload()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: read page — returns indexed elements + visible text
  ipcMain.handle('browser:read-page', async (_e, sessionId: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      const result = await wc.executeJavaScript(DOM_INDEX_SCRIPT)
      return { success: true, ...result }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: screenshot — returns base64 data URL
  ipcMain.handle('browser:screenshot', async (_e, sessionId: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      const image = await wc.capturePage()
      const dataUrl = 'data:image/png;base64,' + image.toPNG().toString('base64')
      return { success: true, dataUrl }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: click element by index
  ipcMain.handle('browser:click', async (_e, sessionId: string, index: number) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      const result = await wc.executeJavaScript(getClickScript(index))
      return result
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: type text into element
  ipcMain.handle('browser:type', async (_e, sessionId: string, text: string, index?: number) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      const result = await wc.executeJavaScript(getTypeScript(text, index))
      return result
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: scroll page
  ipcMain.handle('browser:scroll', async (_e, sessionId: string, direction: 'up' | 'down' | 'left' | 'right', amount: number) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      const result = await wc.executeJavaScript(getScrollScript(direction, amount))
      return result
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: select dropdown option
  ipcMain.handle('browser:select-option', async (_e, sessionId: string, elementIndex: number, optionIndex: number) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      const result = await wc.executeJavaScript(getSelectOptionScript(elementIndex, optionIndex))
      return result
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: execute arbitrary JavaScript
  ipcMain.handle('browser:execute-js', async (_e, sessionId: string, code: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      const result = await wc.executeJavaScript(code)
      return { success: true, result }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: get console logs
  ipcMain.handle('browser:console-logs', async (_e, sessionId: string, since?: number) => {
    try {
      const logs = browserManager.getConsoleLogs(sessionId, since)
      return { success: true, logs }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Agent tool: list all active sessions
  ipcMain.handle('browser:list-sessions', async () => {
    return browserManager.listSessions()
  })
}

export function shutdownBrowserHandlers(): void {
  browserManager.removeAll()
}
