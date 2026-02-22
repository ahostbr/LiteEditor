import { webContents } from 'electron'

let counter = 0

interface ConsoleLogEntry {
  level: string
  message: string
  timestamp: number
}

interface BrowserSession {
  id: string
  webContentsId: number
  consoleLogs: ConsoleLogEntry[]
}

const MAX_CONSOLE_LOGS = 500

export class BrowserManager {
  private sessions = new Map<string, BrowserSession>()

  register(webContentsId: number): string {
    const id = `browser-${++counter}-${Date.now()}`
    const session: BrowserSession = {
      id,
      webContentsId,
      consoleLogs: []
    }
    this.sessions.set(id, session)

    const wc = webContents.fromId(webContentsId)
    if (wc) {
      wc.on('console-message', (_e, level, message) => {
        this.addConsoleLog(id, level, message)
      })
    }

    return id
  }

  getWebContents(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (!session) return undefined
    return webContents.fromId(session.webContentsId) ?? undefined
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
    this.sessions.delete(sessionId)
  }

  removeAll(): void {
    this.sessions.clear()
  }
}
