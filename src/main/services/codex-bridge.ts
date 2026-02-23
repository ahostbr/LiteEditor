import { WebContents, shell, dialog } from 'electron'
import { ChildProcess, spawn } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'
import { CodexManager } from './codex-manager'

interface SharedObjectStore {
  [key: string]: unknown
}

export class CodexBridge {
  private codexManager: CodexManager
  private persistedAtomState: Record<string, unknown> = {}
  private sharedObjects: SharedObjectStore = {}
  private sharedObjectSubscribers = new Map<string, Set<string>>()

  // Workspace onboarding state
  private workspaceRootOptions: { roots: string[]; labels: Record<string, string> } = { roots: [], labels: {} }
  private activeWorkspaceRoot: string | null = null
  private globalState = new Map<string, unknown>()

  // codex.exe process management
  private proc: ChildProcess | null = null
  private pendingRequests = new Map<string, WebContents>()
  private rpcCallbacks = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>()
  private rpcCounter = 0
  private lineBuffer = ''
  private connectedWebContents = new Map<string, WebContents>()

  constructor(codexManager: CodexManager) {
    this.codexManager = codexManager
  }

  handleWebviewMessage(sessionId: string, message: any): void {
    const wc = this.codexManager.getWebContents(sessionId)
    if (!wc) return

    // Track connected webviews for broadcasting notifications
    this.connectedWebContents.set(sessionId, wc)

    const msgType = message?.type
    if (!msgType) {
      console.log('[codex-bridge] Message without type:', message)
      return
    }

    switch (msgType) {
      case 'ready':
        this.handleReady(wc)
        break

      case 'persisted-atom-sync-request':
        this.sendToWebview(wc, {
          type: 'persisted-atom-sync',
          state: this.persistedAtomState
        })
        break

      case 'persisted-atom-update': {
        const key = message.key
        const value = message.value
        if (key) {
          this.persistedAtomState[key] = value
        }
        this.sendToWebview(wc, {
          type: 'persisted-atom-updated',
          key,
          value
        })
        break
      }

      case 'persisted-atom-reset':
        this.persistedAtomState = {}
        this.sendToWebview(wc, {
          type: 'persisted-atom-sync',
          state: {}
        })
        break

      case 'open-in-browser':
        if (message.url) {
          shell.openExternal(message.url)
        }
        break

      case 'log-message':
        console.log('[codex-webview]', message.level || 'info', message.message || message.text || '')
        break

      case 'view-focused':
      case 'set-telemetry-user':
        // No-op
        break

      case 'shared-object-subscribe':
        this.handleSharedObjectSubscribe(sessionId, message)
        break

      case 'shared-object-unsubscribe':
        this.handleSharedObjectUnsubscribe(sessionId, message)
        break

      case 'shared-object-set':
        this.handleSharedObjectSet(wc, message)
        break

      case 'fetch':
        void this.handleFetch(wc, message)
        break

      case 'fetch-stream':
        void this.handleFetchStream(wc, message)
        break

      case 'mcp-request':
        this.handleMcpRequest(wc, message)
        break

      case 'mcp-response': {
        // Response from webview to a server-initiated request → forward to codex.exe
        const resp = message.message || message.response
        if (resp?.id && this.proc) {
          this.writeToServer({ id: resp.id, result: resp.result, error: resp.error })
        }
        break
      }

      case 'mcp-notification': {
        // Notification from webview → forward to codex.exe
        const notif = message.notification || message
        if (notif?.method && this.proc) {
          this.writeToServer({ method: notif.method, params: notif.params })
        }
        break
      }

      case 'electron-update-workspace-root-options': {
        const roots = message.roots
        if (Array.isArray(roots)) {
          this.workspaceRootOptions.roots = roots
        }
        // Broadcast so React Query invalidates its cache
        this.broadcastToWebviews({ type: 'workspace-root-options-updated' })
        break
      }

      case 'electron-set-active-workspace-root':
        this.activeWorkspaceRoot = message.root ?? null
        break

      case 'electron-onboarding-skip-workspace':
        this.sendToWebview(wc, {
          type: 'electron-onboarding-skip-workspace-result',
          success: true
        })
        break

      case 'electron-set-window-mode':
        console.log('[codex-bridge] electron-set-window-mode:', message.mode)
        break

      case 'electron-pick-workspace-root-option':
        void this.handlePickWorkspaceRoot(sessionId, wc)
        break

      case 'electron-rename-workspace-root-option': {
        const { root, label } = message
        if (root && label != null) {
          this.workspaceRootOptions.labels[root] = label
        }
        break
      }

      case 'worker-request':
      case 'worker-request-cancel':
        console.log(`[codex-bridge] Worker message: ${msgType}`, message.method || '')
        break

      default:
        console.log('[codex-bridge] unhandled:', msgType)
        break
    }
  }

  private handleReady(wc: WebContents): void {
    // Order matches real Codex extension: font → prompts → state
    this.sendToWebview(wc, {
      type: 'chat-font-settings',
      chatFontSize: 13,
      chatCodeFontSize: 13
    })
    this.sendToWebview(wc, {
      type: 'custom-prompts-updated',
      prompts: []
    })
    this.sendToWebview(wc, {
      type: 'persisted-atom-sync',
      state: this.persistedAtomState
    })
  }

  // ---------------------------------------------------------------------------
  // codex.exe app-server process management
  // ---------------------------------------------------------------------------

  private startServer(): void {
    if (this.proc) return

    const extPath = this.codexManager.findCodexExtension()
    if (!extPath) {
      console.error('[codex-bridge] Cannot start server: extension not found')
      return
    }

    const codexExe = join(extPath, 'bin', 'windows-x86_64', 'codex.exe')
    if (!existsSync(codexExe)) {
      console.error('[codex-bridge] codex.exe not found at:', codexExe)
      return
    }

    console.log('[codex-bridge] Starting codex.exe app-server...')

    this.proc = spawn(codexExe, ['app-server', '--analytics-default-enabled'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, RUST_LOG: 'warn' }
    })

    this.proc.stdout!.on('data', (chunk: Buffer) => this.onStdoutData(chunk))

    this.proc.stderr!.on('data', (chunk: Buffer) => {
      console.log('[codex-bridge] stderr:', chunk.toString().trimEnd())
    })

    this.proc.on('error', (err) => {
      console.error('[codex-bridge] Process error:', err)
      this.proc = null
    })

    this.proc.on('exit', (code, signal) => {
      console.log('[codex-bridge] Process exited: code=%s signal=%s', code, signal)
      this.proc = null
      // Send error to all pending requests so webview promises don't hang
      for (const [id, wc] of this.pendingRequests) {
        this.sendToWebview(wc, {
          type: 'mcp-response',
          message: { id, error: { code: -1, message: 'codex.exe process exited' } }
        })
      }
      this.pendingRequests.clear()
      // Reject all internal RPC callbacks so fetch handlers don't hang
      for (const [, cb] of this.rpcCallbacks) {
        cb.reject(new Error('codex.exe process exited'))
      }
      this.rpcCallbacks.clear()
      this.lineBuffer = ''
    })

    // Send initialize request
    this.writeToServer({
      id: 'initialize',
      method: 'initialize',
      params: {
        clientInfo: { name: 'LiteEditor', title: 'LiteEditor', version: '1.0.0' },
        capabilities: { experimentalApi: true }
      }
    })
  }

  private onStdoutData(chunk: Buffer): void {
    this.lineBuffer += chunk.toString()
    const lines = this.lineBuffer.split('\n')
    this.lineBuffer = lines.pop()! // last element is incomplete line or empty string

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      let msg: any
      try {
        msg = JSON.parse(trimmed)
      } catch {
        console.log('[codex-bridge] Non-JSON stdout:', trimmed)
        continue
      }

      console.log(
        '[codex-bridge] ← server:',
        msg.id ? `id=${msg.id}` : '',
        msg.method || '',
        msg.result !== undefined ? '(result)' : '',
        msg.error !== undefined ? '(error)' : ''
      )

      if (msg.id && (msg.result !== undefined || msg.error !== undefined)) {
        // Response to a previous request — check internal RPC callbacks first
        const cb = this.rpcCallbacks.get(msg.id)
        if (cb) {
          this.rpcCallbacks.delete(msg.id)
          if (msg.error) {
            cb.reject(msg.error)
          } else {
            cb.resolve(msg.result)
          }
        } else {
          const wc = this.pendingRequests.get(msg.id)
          this.pendingRequests.delete(msg.id)
          if (wc) {
            this.sendToWebview(wc, {
              type: 'mcp-response',
              message: { id: msg.id, result: msg.result, error: msg.error }
            })
          } else if (msg.id === 'initialize') {
            console.log('[codex-bridge] Initialize response:', msg.result ? 'success' : 'error')
          }
        }
      } else if (msg.id && msg.method) {
        // Server-initiated request → forward to webview
        this.broadcastToWebviews({
          type: 'mcp-request',
          request: { id: msg.id, method: msg.method, params: msg.params }
        })
      } else if (msg.method) {
        // Notification (no id) → forward to webview
        this.broadcastToWebviews({
          type: 'mcp-notification',
          notification: { method: msg.method, params: msg.params }
        })
      }
    }
  }

  private writeToServer(msg: any): void {
    if (!this.proc?.stdin?.writable) return
    try {
      const line = JSON.stringify(msg) + '\n'
      console.log('[codex-bridge] → server:', msg.id ? `id=${msg.id}` : '', msg.method || '')
      this.proc.stdin.write(line)
    } catch (err) {
      console.error('[codex-bridge] Failed to write to server:', err)
    }
  }

  private broadcastToWebviews(message: any): void {
    for (const wc of this.connectedWebContents.values()) {
      this.sendToWebview(wc, message)
    }
  }

  // ---------------------------------------------------------------------------
  // MCP request/response (extension host RPC → codex.exe)
  // ---------------------------------------------------------------------------

  private handleMcpRequest(wc: WebContents, message: any): void {
    const request = message.request
    if (!request?.id || !request?.method) {
      console.log('[codex-bridge] mcp-request missing id/method:', message)
      return
    }

    const { id, method, params } = request
    console.log('[codex-bridge] mcp-request:', method)

    // Start server if not running
    if (!this.proc) {
      this.startServer()
    }

    if (!this.proc) {
      // Server failed to start — return error
      this.sendToWebview(wc, {
        type: 'mcp-response',
        message: { id, error: { code: -1, message: 'codex.exe server not available' } }
      })
      return
    }

    // Track pending request and forward to codex.exe
    this.pendingRequests.set(id, wc)
    this.writeToServer({ id, method, params })
  }

  /**
   * Send a JSON-RPC request to codex.exe and return a Promise for the result.
   * Used internally by handleFetch for ipc-request / account-info routing.
   * Times out after 30 seconds, falling back to the caller's catch handler.
   */
  private sendRpcRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.proc) {
        this.startServer()
      }
      if (!this.proc) {
        reject(new Error('codex.exe server not available'))
        return
      }

      const id = `ipc-${++this.rpcCounter}`
      this.rpcCallbacks.set(id, { resolve, reject })
      this.writeToServer({ id, method, params })

      setTimeout(() => {
        if (this.rpcCallbacks.has(id)) {
          this.rpcCallbacks.delete(id)
          reject(new Error('RPC timeout'))
        }
      }, 30_000)
    })
  }

  // Fallback mock results for the vscode://codex/ipc-request fetch path
  private getMcpResult(method: string, _params: any): any {
    switch (method) {
      case 'account/read':
        return { account: null, requiresOpenaiAuth: true }

      case 'config/read':
        return { config: {} }

      case 'configRequirements/read':
        return {}

      default:
        return undefined
    }
  }

  // ---------------------------------------------------------------------------
  // Fetch bridge (vscode://codex/* internal URLs + real HTTP)
  // ---------------------------------------------------------------------------

  /**
   * Mock responses for vscode://codex/* internal RPC URLs.
   * Returns undefined for unknown endpoints so the caller can fall through to real fetch.
   */
  private getInternalUrlResponse(url: string, body: string | undefined): any {
    const path = url.replace(/^vscode:\/\/codex\//, '')

    switch (path) {
      case 'extension-info':
        return { version: '0.5.76', name: 'openai.chatgpt' }

      case 'os-info':
        return { platform: process.platform }

      case 'active-workspace-roots':
        return { roots: this.activeWorkspaceRoot ? [this.activeWorkspaceRoot] : [] }

      case 'workspace-root-options':
        return this.workspaceRootOptions

      case 'get-copilot-api-proxy-info':
        return null

      case 'mcp-codex-config':
        return { servers: [] }

      case 'get-global-state': {
        try {
          const parsed = body ? JSON.parse(body) : {}
          return { value: this.globalState.get(parsed.key) ?? null }
        } catch {
          return { value: null }
        }
      }

      case 'set-global-state': {
        try {
          const parsed = body ? JSON.parse(body) : {}
          if (parsed.key !== undefined) {
            this.globalState.set(parsed.key, parsed.value)
          }
          return { success: true }
        } catch {
          return { success: false }
        }
      }

      default:
        // Return empty object for unknown internal endpoints rather than failing
        console.log('[codex-bridge] unknown vscode://codex/ endpoint:', path)
        return {}
    }
  }

  private async handleFetch(wc: WebContents, message: any): Promise<void> {
    const requestId = message.requestId
    const url: string = message.url
    const method: string = message.method || 'GET'
    const headers: Record<string, string> = message.headers || {}
    const body: string | undefined = message.body || undefined

    // Handle vscode://codex/* internal RPC URLs
    if (url.startsWith('vscode://')) {
      const path = url.replace(/^vscode:\/\/codex\//, '')

      // Route ipc-request through codex.exe
      if (path === 'ipc-request' && body) {
        let result: any
        try {
          const parsed = JSON.parse(body)
          result = await this.sendRpcRequest(parsed.method, parsed.params)
        } catch {
          // Fallback to mock if server unavailable or timed out
          try {
            const parsed = JSON.parse(body)
            result = this.getMcpResult(parsed.method, parsed.params) ?? { error: `unsupported: ${parsed.method}` }
          } catch {
            result = { error: 'invalid ipc-request body' }
          }
        }
        this.sendToWebview(wc, {
          type: 'fetch-response',
          requestId,
          responseType: 'success',
          status: 200,
          headers: { 'content-type': 'application/json' },
          bodyJsonString: JSON.stringify(result)
        })
        return
      }

      // Route account-info through codex.exe
      if (path === 'account-info') {
        let result: any = null
        try {
          const rpcResult = await this.sendRpcRequest('account/read', {})
          result = rpcResult?.account ?? null
        } catch {
          // Fallback to null if server unavailable
        }
        this.sendToWebview(wc, {
          type: 'fetch-response',
          requestId,
          responseType: 'success',
          status: 200,
          headers: { 'content-type': 'application/json' },
          bodyJsonString: JSON.stringify(result)
        })
        return
      }

      // All other vscode:// URLs use sync mocks
      const result = this.getInternalUrlResponse(url, body)
      this.sendToWebview(wc, {
        type: 'fetch-response',
        requestId,
        responseType: 'success',
        status: 200,
        headers: { 'content-type': 'application/json' },
        bodyJsonString: JSON.stringify(result)
      })
      return
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body || undefined
      })

      const responseBody = await response.text()

      if (response.ok) {
        this.sendToWebview(wc, {
          type: 'fetch-response',
          requestId,
          responseType: 'success',
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          bodyJsonString: responseBody
        })
      } else {
        this.sendToWebview(wc, {
          type: 'fetch-response',
          requestId,
          responseType: 'error',
          status: response.status,
          error: responseBody
        })
      }
    } catch (err) {
      this.sendToWebview(wc, {
        type: 'fetch-response',
        requestId,
        responseType: 'error',
        status: 0,
        error: err instanceof Error ? err.message : String(err)
      })
    }
  }

  private async handleFetchStream(wc: WebContents, message: any): Promise<void> {
    const requestId = message.requestId
    const url: string = message.url
    const method: string = message.method || 'GET'
    const headers: Record<string, string> = message.headers || {}
    const body: string | undefined = message.body || undefined

    // Internal URLs — send a single event + complete
    if (url.startsWith('vscode://')) {
      const path = url.replace(/^vscode:\/\/codex\//, '')

      // Route ipc-request through codex.exe
      if (path === 'ipc-request' && body) {
        let result: any
        try {
          const parsed = JSON.parse(body)
          result = await this.sendRpcRequest(parsed.method, parsed.params)
        } catch {
          try {
            const parsed = JSON.parse(body)
            result = this.getMcpResult(parsed.method, parsed.params) ?? { error: `unsupported: ${parsed.method}` }
          } catch {
            result = { error: 'invalid ipc-request body' }
          }
        }
        this.sendToWebview(wc, {
          type: 'fetch-stream-event',
          requestId,
          status: 200,
          headers: { 'content-type': 'application/json' },
          data: JSON.stringify(result)
        })
        this.sendToWebview(wc, { type: 'fetch-stream-complete', requestId })
        return
      }

      // Route account-info through codex.exe
      if (path === 'account-info') {
        let result: any = null
        try {
          const rpcResult = await this.sendRpcRequest('account/read', {})
          result = rpcResult?.account ?? null
        } catch {
          // Fallback to null
        }
        this.sendToWebview(wc, {
          type: 'fetch-stream-event',
          requestId,
          status: 200,
          headers: { 'content-type': 'application/json' },
          data: JSON.stringify(result)
        })
        this.sendToWebview(wc, { type: 'fetch-stream-complete', requestId })
        return
      }

      // All other vscode:// URLs use sync mocks
      const result = this.getInternalUrlResponse(url, body)
      this.sendToWebview(wc, {
        type: 'fetch-stream-event',
        requestId,
        status: 200,
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify(result)
      })
      this.sendToWebview(wc, { type: 'fetch-stream-complete', requestId })
      return
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body || undefined
      })

      // Emit initial event with headers
      this.sendToWebview(wc, {
        type: 'fetch-stream-event',
        requestId,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          this.sendToWebview(wc, {
            type: 'fetch-stream-event',
            requestId,
            data: decoder.decode(value, { stream: true })
          })
        }
      }

      this.sendToWebview(wc, {
        type: 'fetch-stream-complete',
        requestId
      })
    } catch (err) {
      this.sendToWebview(wc, {
        type: 'fetch-stream-error',
        requestId,
        error: err instanceof Error ? err.message : String(err)
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Workspace root picker (Electron dialog)
  // ---------------------------------------------------------------------------

  private async handlePickWorkspaceRoot(sessionId: string, wc: WebContents): Promise<void> {
    const mainWindow = this.codexManager.getMainWindow(sessionId)
    if (!mainWindow) return

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const root = result.filePaths[0]
      if (!this.workspaceRootOptions.roots.includes(root)) {
        this.workspaceRootOptions.roots.push(root)
      }
      this.sendToWebview(wc, { type: 'workspace-root-option-picked', root })
    }
  }

  // ---------------------------------------------------------------------------
  // Shared objects
  // ---------------------------------------------------------------------------

  private handleSharedObjectSubscribe(sessionId: string, message: any): void {
    const key = message.key
    if (!key) return

    if (!this.sharedObjectSubscribers.has(key)) {
      this.sharedObjectSubscribers.set(key, new Set())
    }
    this.sharedObjectSubscribers.get(key)!.add(sessionId)

    // Send current value if exists
    const wc = this.codexManager.getWebContents(sessionId)
    if (wc && key in this.sharedObjects) {
      this.sendToWebview(wc, {
        type: 'shared-object-updated',
        key,
        value: this.sharedObjects[key]
      })
    }
  }

  private handleSharedObjectUnsubscribe(sessionId: string, message: any): void {
    const key = message.key
    if (!key) return

    const subscribers = this.sharedObjectSubscribers.get(key)
    if (subscribers) {
      subscribers.delete(sessionId)
      if (subscribers.size === 0) {
        this.sharedObjectSubscribers.delete(key)
      }
    }
  }

  private handleSharedObjectSet(wc: WebContents, message: any): void {
    const key = message.key
    const value = message.value
    if (!key) return

    this.sharedObjects[key] = value

    // Notify all subscribers
    const subscribers = this.sharedObjectSubscribers.get(key)
    if (subscribers) {
      for (const sessionId of subscribers) {
        const subWc = this.codexManager.getWebContents(sessionId)
        if (subWc) {
          this.sendToWebview(subWc, {
            type: 'shared-object-updated',
            key,
            value
          })
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private sendToWebview(wc: WebContents, message: any): void {
    try {
      wc.send('codex:host-message', message)
    } catch {
      /* webcontents may be destroyed */
    }
  }

  removeSession(sessionId: string): void {
    this.connectedWebContents.delete(sessionId)
    for (const [key, subscribers] of Array.from(this.sharedObjectSubscribers.entries())) {
      subscribers.delete(sessionId)
      if (subscribers.size === 0) {
        this.sharedObjectSubscribers.delete(key)
      }
    }
  }

  shutdown(): void {
    if (this.proc) {
      console.log('[codex-bridge] Killing codex.exe process')
      this.proc.kill()
      this.proc = null
    }
    this.pendingRequests.clear()
    for (const [, cb] of this.rpcCallbacks) {
      cb.reject(new Error('shutdown'))
    }
    this.rpcCallbacks.clear()
    this.lineBuffer = ''
    this.connectedWebContents.clear()
    this.sharedObjectSubscribers.clear()
  }
}
