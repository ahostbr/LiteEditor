import { WebContentsView, BrowserWindow } from 'electron'
import { type NativeViewBounds, toContentBounds } from './native-view-bounds'

let counter = 0

interface ConsoleLogEntry {
  level: string
  message: string
  timestamp: number
}

interface BrowserSession {
  id: string
  view: WebContentsView
  mainWindow: BrowserWindow
  hidden: boolean
  consoleLogs: ConsoleLogEntry[]
}

const MAX_CONSOLE_LOGS = 500

export class BrowserManager {
  private sessions = new Map<string, BrowserSession>()

  createView(mainWindow: BrowserWindow, initialUrl: string): string {
    const id = `browser-${++counter}-${Date.now()}`

    const view = new WebContentsView({
      webPreferences: {
        partition: 'persist:browser',
        sandbox: true,
        contextIsolation: true
      }
    })

    // Chrome-like user-agent so Google services work properly
    const defaultUA = view.webContents.getUserAgent()
    view.webContents.setUserAgent(
      defaultUA.replace(/\s*Electron\/\S+/, '').replace(/\s*LiteEditor\/\S+/, '')
    )

    // Start at zero bounds until the renderer reports real bounds
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    mainWindow.contentView.addChildView(view)

    const session: BrowserSession = {
      id,
      view,
      mainWindow,
      hidden: false,
      consoleLogs: []
    }
    this.sessions.set(id, session)

    const wc = view.webContents

    wc.on('console-message', (_e, level, message) => {
      this.addConsoleLog(id, level, message)
    })

    wc.on('did-navigate', () => {
      this.sendStateUpdate(id)
    })

    wc.on('did-navigate-in-page', () => {
      this.sendStateUpdate(id)
    })

    wc.on('did-start-loading', () => {
      mainWindow.webContents.send('browser:state-update', {
        sessionId: id,
        isLoading: true
      })
    })

    wc.on('did-stop-loading', () => {
      this.sendStateUpdate(id)
    })

    wc.on('page-title-updated', (_e, title) => {
      mainWindow.webContents.send('browser:state-update', {
        sessionId: id,
        title
      })
    })

    wc.loadURL(initialUrl)

    return id
  }

  private sendStateUpdate(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (!session) return
    const wc = session.view.webContents
    session.mainWindow.webContents.send('browser:state-update', {
      sessionId,
      url: wc.getURL(),
      title: wc.getTitle(),
      canGoBack: wc.canGoBack(),
      canGoForward: wc.canGoForward(),
      isLoading: wc.isLoading()
    })
  }

  destroyView(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    this.sessions.delete(sessionId)
    try {
      session.mainWindow.contentView.removeChildView(session.view)
    } catch { /* window may already be closed */ }
    try {
      session.view.webContents.close()
    } catch { /* already destroyed */ }
  }

  setBounds(sessionId: string, bounds: NativeViewBounds): void {
    const session = this.sessions.get(sessionId)
    if (!session || session.hidden) return
    session.view.setBounds(toContentBounds(session.mainWindow, bounds))
  }

  showView(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session || !session.hidden) return
    session.hidden = false
    try {
      session.mainWindow.contentView.addChildView(session.view)
    } catch { /* window may be closed */ }
  }

  hideView(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session || session.hidden) return
    session.hidden = true
    try {
      session.mainWindow.contentView.removeChildView(session.view)
    } catch { /* window may be closed */ }
  }

  getWebContents(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (!session) return undefined
    return session.view.webContents
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId)
  }

  listSessions(): string[] {
    return Array.from(this.sessions.keys())
  }

  private addConsoleLog(sessionId: string, level: number, message: string) {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const levelMap: Record<number, string> = {
      0: 'verbose',
      1: 'info',
      2: 'warning',
      3: 'error'
    }

    session.consoleLogs.push({
      level: levelMap[level] || 'info',
      message,
      timestamp: Date.now()
    })

    // Circular buffer — trim oldest entries
    if (session.consoleLogs.length > MAX_CONSOLE_LOGS) {
      session.consoleLogs = session.consoleLogs.slice(-MAX_CONSOLE_LOGS)
    }
  }

  getConsoleLogs(sessionId: string, since?: number): ConsoleLogEntry[] {
    const session = this.sessions.get(sessionId)
    if (!session) return []
    if (since) {
      return session.consoleLogs.filter((log) => log.timestamp >= since)
    }
    return [...session.consoleLogs]
  }

  remove(sessionId: string): void {
    this.destroyView(sessionId)
  }

  removeAll(): void {
    for (const sessionId of Array.from(this.sessions.keys())) {
      this.destroyView(sessionId)
    }
  }
}
