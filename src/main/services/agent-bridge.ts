import * as http from 'http'
import * as crypto from 'crypto'
import type { BrowserWindow } from 'electron'
import type { PtyManager } from './pty-manager'
import type { BrowserManager } from './browser-manager'
import {
  DOM_INDEX_SCRIPT,
  getClickScript,
  getTypeScript,
  getScrollScript,
  getSelectOptionScript
} from './dom-helper'

const PORT = 7423
const HOST = '127.0.0.1'

export class AgentBridge {
  private server: http.Server | null = null
  private ptyManager: PtyManager
  private browserManager: BrowserManager
  private getMainWindow: () => BrowserWindow | null
  readonly token: string

  constructor(
    ptyManager: PtyManager,
    browserManager: BrowserManager,
    getMainWindow: () => BrowserWindow | null
  ) {
    this.ptyManager = ptyManager
    this.browserManager = browserManager
    this.getMainWindow = getMainWindow
    this.token = crypto.randomBytes(32).toString('hex')
  }

  private async focusTerminal(sessionId: string): Promise<void> {
    const win = this.getMainWindow()
    if (win) {
      const safe = sessionId.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
      await win.webContents.executeJavaScript(
        `window.__focusPtySession && window.__focusPtySession('${safe}')`
      ).catch(() => {})
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res)
      })
      this.server.on('error', reject)
      this.server.listen(PORT, HOST, () => {
        console.log(`Agent Bridge listening on ${HOST}:${PORT}`)
        resolve()
      })
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve())
      } else {
        resolve()
      }
    })
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Bearer token auth — reject requests without valid token
    const authHeader = req.headers['authorization'] || ''
    const expectedHeader = `Bearer ${this.token}`
    if (authHeader !== expectedHeader) {
      this.json(res, 401, { error: 'Unauthorized' })
      return
    }

    const url = req.url || ''
    const method = req.method || ''

    // --- PTY endpoints ---

    if (method === 'GET' && url === '/pty/list') {
      const sessions = this.ptyManager.listSessions()
      this.json(res, 200, { sessions })
      return
    }

    if (method === 'POST' && (url === '/pty/read' || url === '/pty/write' || url === '/pty/talk')) {
      this.readBody(req, (err, body) => {
        if (err) {
          this.json(res, 400, { error: 'Invalid request body' })
          return
        }

        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(body)
        } catch {
          this.json(res, 400, { error: 'Invalid JSON' })
          return
        }

        if (url === '/pty/read') {
          this.handlePtyRead(res, parsed)
        } else if (url === '/pty/talk') {
          this.handlePtyTalk(res, parsed)
        } else {
          this.handlePtyWrite(res, parsed)
        }
      })
      return
    }

    // --- Browser endpoints ---

    if (method === 'GET' && url === '/browser/list') {
      const sessions = this.browserManager.listSessions()
      this.json(res, 200, { sessions })
      return
    }

    if (method === 'POST' && url.startsWith('/browser/')) {
      this.readBody(req, (err, body) => {
        if (err) {
          this.json(res, 400, { error: 'Invalid request body' })
          return
        }

        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(body)
        } catch {
          this.json(res, 400, { error: 'Invalid JSON' })
          return
        }

        this.handleBrowserPost(url, res, parsed)
      })
      return
    }

    this.json(res, 404, { error: 'Not found' })
  }

  // --- PTY handlers ---

  private handlePtyRead(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined
    if (!sessionId) {
      this.json(res, 400, { error: 'Missing session_id' })
      return
    }

    const output = this.ptyManager.readOutput(sessionId)
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` })
      return
    }

    this.json(res, 200, { session_id: sessionId, output })
  }

  private handlePtyWrite(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined
    const data = body.data as string | undefined
    if (!sessionId) {
      this.json(res, 400, { error: 'Missing session_id' })
      return
    }
    if (data === undefined || data === null) {
      this.json(res, 400, { error: 'Missing data' })
      return
    }

    const output = this.ptyManager.readOutput(sessionId)
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` })
      return
    }

    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, String(data))
        if (!success) {
          this.json(res, 500, { ok: false, error: `Write failed for session '${sessionId}'` })
          return
        }
        this.json(res, 200, { ok: true, bytes: String(data).length })
      }, 200)
    })
  }

  private handlePtyTalk(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined
    const command = body.command as string | undefined
    if (!sessionId) {
      this.json(res, 400, { error: 'Missing session_id' })
      return
    }
    if (command === undefined || command === null) {
      this.json(res, 400, { error: 'Missing command' })
      return
    }

    const output = this.ptyManager.readOutput(sessionId)
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` })
      return
    }

    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, command + '\r')
        if (!success) {
          this.json(res, 500, { ok: false, error: `Talk failed for session '${sessionId}'` })
          return
        }
        this.json(res, 200, { ok: true, bytes: command.length + 1 })
      }, 200)
    })
  }

  // --- Browser handlers ---

  private async handleBrowserPost(url: string, res: http.ServerResponse, body: Record<string, unknown>): Promise<void> {
    const route = url.replace('/browser/', '')
    const sessionId = body.session_id as string | undefined

    // Routes that don't require session_id
    if (route === 'list') {
      const sessions = this.browserManager.listSessions()
      this.json(res, 200, { sessions })
      return
    }

    if (!sessionId) {
      this.json(res, 400, { error: 'Missing session_id' })
      return
    }

    const wc = this.browserManager.getWebContents(sessionId)
    if (!wc) {
      this.json(res, 404, { error: `Browser session '${sessionId}' not found` })
      return
    }

    try {
      switch (route) {
        case 'navigate': {
          let targetUrl = body.url as string
          if (!targetUrl) {
            this.json(res, 400, { error: 'Missing url' })
            return
          }
          if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith('file://')) {
            targetUrl = 'https://' + targetUrl
          }
          await wc.loadURL(targetUrl)
          this.json(res, 200, { success: true, url: wc.getURL() })
          break
        }

        case 'go-back': {
          if (!wc.canGoBack()) {
            this.json(res, 200, { success: false, error: 'Cannot go back' })
            return
          }
          wc.goBack()
          this.json(res, 200, { success: true })
          break
        }

        case 'go-forward': {
          if (!wc.canGoForward()) {
            this.json(res, 200, { success: false, error: 'Cannot go forward' })
            return
          }
          wc.goForward()
          this.json(res, 200, { success: true })
          break
        }

        case 'reload': {
          wc.reload()
          this.json(res, 200, { success: true })
          break
        }

        case 'read-page': {
          const result = await wc.executeJavaScript(DOM_INDEX_SCRIPT)
          this.json(res, 200, { success: true, ...result })
          break
        }

        case 'screenshot': {
          const image = await wc.capturePage()
          const dataUrl = 'data:image/png;base64,' + image.toPNG().toString('base64')
          this.json(res, 200, { success: true, dataUrl })
          break
        }

        case 'click': {
          const index = body.index as number
          if (index === undefined || index === null) {
            this.json(res, 400, { error: 'Missing index' })
            return
          }
          const result = await wc.executeJavaScript(getClickScript(index))
          this.json(res, 200, result)
          break
        }

        case 'type': {
          const text = body.text as string
          if (text === undefined || text === null) {
            this.json(res, 400, { error: 'Missing text' })
            return
          }
          const idx = body.index as number | undefined
          const result = await wc.executeJavaScript(getTypeScript(text, idx))
          this.json(res, 200, result)
          break
        }

        case 'scroll': {
          const direction = body.direction as 'up' | 'down' | 'left' | 'right'
          const amount = (body.amount as number) || 300
          if (!direction) {
            this.json(res, 400, { error: 'Missing direction' })
            return
          }
          const result = await wc.executeJavaScript(getScrollScript(direction, amount))
          this.json(res, 200, result)
          break
        }

        case 'select-option': {
          const elementIndex = body.element_index as number
          const optionIndex = body.option_index as number
          if (elementIndex === undefined || optionIndex === undefined) {
            this.json(res, 400, { error: 'Missing element_index or option_index' })
            return
          }
          const result = await wc.executeJavaScript(getSelectOptionScript(elementIndex, optionIndex))
          this.json(res, 200, result)
          break
        }

        case 'execute-js': {
          const code = body.code as string
          if (!code) {
            this.json(res, 400, { error: 'Missing code' })
            return
          }
          const result = await wc.executeJavaScript(code)
          this.json(res, 200, { success: true, result })
          break
        }

        case 'console-logs': {
          const since = body.since as number | undefined
          const logs = this.browserManager.getConsoleLogs(sessionId, since)
          this.json(res, 200, { success: true, logs })
          break
        }

        default:
          this.json(res, 404, { error: `Unknown browser route: ${route}` })
      }
    } catch (err) {
      this.json(res, 500, { success: false, error: String(err) })
    }
  }

  // --- Helpers ---

  private json(res: http.ServerResponse, status: number, data: unknown): void {
    const payload = JSON.stringify(data)
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    })
    res.end(payload)
  }

  private readBody(req: http.IncomingMessage, cb: (err: Error | null, body: string) => void): void {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => cb(null, Buffer.concat(chunks).toString('utf-8')))
    req.on('error', (err) => cb(err, ''))
  }
}
