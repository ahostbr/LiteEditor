import { ipcMain, BrowserWindow } from 'electron'
import { BrowserManager } from '../services/browser-manager'
import { type NativeViewBounds } from '../services/native-view-bounds'
import {
  DOM_INDEX_SCRIPT,
  getClickScript,
  getTypeScript,
  getScrollScript,
  getSelectOptionScript
} from '../services/dom-helper'

const browserManager = new BrowserManager()

export { browserManager }

export function registerBrowserHandlers(mainWindow: BrowserWindow): void {
  // Lifecycle: create WebContentsView in main process
  ipcMain.handle('browser:create-view', async (_e, initialUrl: string) => {
    return browserManager.createView(mainWindow, initialUrl)
  })

  // Lifecycle: destroy view
  ipcMain.on('browser:destroy-view', (_e, sessionId: string) => {
    browserManager.destroyView(sessionId)
  })

  // Lifecycle: set view bounds (from renderer ResizeObserver)
  ipcMain.on('browser:set-bounds', (_e, sessionId: string, bounds: NativeViewBounds) => {
    browserManager.setBounds(sessionId, bounds)
  })

  // Lifecycle: show/hide view (tab visibility)
  ipcMain.on('browser:show-view', (_e, sessionId: string) => {
    browserManager.showView(sessionId)
  })

  ipcMain.on('browser:hide-view', (_e, sessionId: string) => {
    browserManager.hideView(sessionId)
  })

  // Navigation: navigate to URL
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

  // Navigation: go back
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

  // Navigation: go forward
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

  // Navigation: reload
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

  // Navigation: stop loading
  ipcMain.handle('browser:stop', async (_e, sessionId: string) => {
    try {
      const wc = browserManager.getWebContents(sessionId)
      if (!wc) return { success: false, error: 'Session not found' }
      wc.stop()
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
