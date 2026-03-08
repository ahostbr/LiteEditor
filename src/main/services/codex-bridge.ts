import { WebContents, shell, dialog } from 'electron'
import { ChildProcess, spawn } from 'child_process'
import { basename, join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { CodexManager } from './codex-manager'

interface SharedObjectStore {
  [key: string]: unknown
}

interface InternalUrlResponse {
  status: number
  body?: unknown
  error?: string
}

export class CodexBridge {
  private codexManager: CodexManager
  private persistedAtomState: Record<string, unknown> = {}
  private sharedObjects: SharedObjectStore = {}
  private sharedObjectSubscribers = new Map<string, Set<string>>()
  private vsContextState = new Map<string, unknown>()

  // Workspace onboarding state
  private workspaceRootOptions: { roots: string[]; labels: Record<string, string> } = { roots: [], labels: {} }
  private activeWorkspaceRoot: string | null = null
  private globalState = new Map<string, unknown>()
  private configurationState = new Map<string, unknown>()
  private workspaceStateHydrated = false

  // codex.exe process management
  private proc: ChildProcess | null = null
  private pendingRequests = new Map<string, WebContents>()
  private rpcCallbacks = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>()
  private rpcCounter = 0
  private lineBuffer = ''
  private connectedWebContents = new Map<string, WebContents>()

  // Server initialization tracking
  private initializeResolve: (() => void) | null = null
  private initializePromise: Promise<void> | null = null
  private serverInitialized = false

  constructor(codexManager: CodexManager) {
    this.codexManager = codexManager
    this.hydrateWorkspaceState()
  }

  setProjectRoot(root: string | null): void {
    this.hydrateWorkspaceState()

    const normalized = this.normalizeRoot(root)
    if (!normalized) return

    const existingRoots = this.getWorkspaceRoots()
    const roots = [normalized, ...existingRoots.filter((item) => item !== normalized)]

    this.applyWorkspaceRoots(roots, normalized, true)
    this.persistLiteEditorProjectRoot(normalized)
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
        if (message.level === 'error' || message.level === 'warning' || message.level === 'warn') {
          console.log('[codex-webview]', message.level, message.message || message.text || '')
        }
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
        void this.handleMcpRequest(wc, message)
        break

      case 'mcp-response': {
        // Response from webview to a server-initiated request -> forward to codex.exe
        const resp = message.message || message.response
        if (resp?.id && this.proc) {
          this.writeToServer({ id: resp.id, result: resp.result, error: resp.error })
        }
        break
      }

      case 'mcp-notification': {
        // Notification from webview -> forward to codex.exe
        const notif = message.notification || message
        if (notif?.method && this.proc) {
          this.writeToServer({ method: notif.method, params: notif.params })
        }
        break
      }

      case 'electron-update-workspace-root-options': {
        const roots = Array.isArray(message.roots)
          ? message.roots.filter((root): root is string => typeof root === 'string')
          : []
        const labels = message.labels && typeof message.labels === 'object'
          ? message.labels as Record<string, unknown>
          : {}

        for (const [key, value] of Object.entries(labels)) {
          if (typeof value === 'string') {
            this.workspaceRootOptions.labels[key] = value
          }
        }

        this.applyWorkspaceRoots(roots, this.activeWorkspaceRoot, true)
        break
      }

      case 'electron-set-active-workspace-root':
        this.setProjectRoot(typeof message.root === 'string' ? message.root : null)
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
        if (typeof root === 'string' && typeof label === 'string' && root.length > 0) {
          this.workspaceRootOptions.labels[root] = label
        }
        break
      }

      case 'worker-request':
      case 'worker-request-cancel':
        console.log(`[codex-bridge] Worker message: ${msgType}`, message.method || '')
        break

      case 'electron-add-new-workspace-root-option': {
        const root = this.normalizeRoot(message.root)
        if (root) {
          const existingRoots = this.getWorkspaceRoots()
          const roots = existingRoots.includes(root) ? existingRoots : [root, ...existingRoots]
          this.applyWorkspaceRoots(roots, this.activeWorkspaceRoot, true)
        }
        this.sendToWebview(wc, { type: 'electron-add-new-workspace-root-option-result', success: true })
        break
      }

      case 'electron-add-ssh-host':
        // SSH hosts not supported in LiteEditor
        break

      case 'electron-app-state-snapshot-request':
        this.sendToWebview(wc, {
          type: 'electron-app-state-snapshot-response',
          state: {}
        })
        break

      case 'electron-onboarding-pick-workspace-or-create-default': {
        const activeRoot = this.activeWorkspaceRoot || this.getWorkspaceRoots()[0] || null
        this.sendToWebview(wc, {
          type: 'electron-onboarding-pick-workspace-or-create-default-result',
          success: true,
          root: activeRoot
        })
        break
      }

      case 'electron-request-microphone-permission':
        // Microphone not supported in LiteEditor
        this.sendToWebview(wc, {
          type: 'electron-request-microphone-permission-result',
          granted: false
        })
        break

      case 'electron-window-focus-request': {
        const mainWindow = this.codexManager.getMainWindow(sessionId)
        if (mainWindow) {
          mainWindow.focus()
        }
        break
      }

      default:
        console.log('[codex-bridge] unhandled:', msgType)
        break
    }
  }

  private handleReady(wc: WebContents): void {
    this.hydrateWorkspaceState()

    // Order matches real Codex extension: font -> prompts -> state
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

    // If the server is already initialized, immediately tell this webview
    // it's connected so the auth flow can proceed.
    if (this.serverInitialized && this.proc) {
      this.sendToWebview(wc, {
        type: 'codex-app-server-connection-changed',
        hostId: 'local',
        state: 'connected'
      })
    }
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

    // Set up initialization tracking: webview MCP requests are queued until
    // the initialize handshake with codex.exe completes.
    this.serverInitialized = false
    this.initializePromise = new Promise<void>((resolve) => {
      this.initializeResolve = resolve
    })

    // Auto-resolve initialization after 10s so we never hang forever
    setTimeout(() => {
      if (!this.serverInitialized) {
        console.warn('[codex-bridge] Initialize handshake timed out after 10s, proceeding anyway')
        this.completeInitialization()
      }
    }, 10_000)

    this.proc = spawn(codexExe, ['app-server', '--analytics-default-enabled'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, RUST_LOG: 'warn' }
    })

    this.proc.stdout?.on('data', (chunk: Buffer) => this.onStdoutData(chunk))

    this.proc.stderr?.on('data', (chunk: Buffer) => {
      console.log('[codex-bridge] stderr:', chunk.toString().trimEnd())
    })

    this.proc.on('error', (err) => {
      console.error('[codex-bridge] Process error:', err)
      this.proc = null
      this.completeInitialization() // Unblock any waiting requests
    })

    this.proc.on('exit', (code, signal) => {
      console.log('[codex-bridge] Process exited: code=%s signal=%s', code, signal)
      this.proc = null
      this.serverInitialized = false
      this.initializePromise = null
      this.initializeResolve = null

      // Notify webviews that the server disconnected
      this.broadcastToWebviews({
        type: 'codex-app-server-connection-changed',
        hostId: 'local',
        state: 'disconnected'
      })

      for (const [id, pendingWc] of this.pendingRequests) {
        this.sendToWebview(pendingWc, {
          type: 'mcp-response',
          hostId: 'local',
          message: { id, error: { code: -1, message: 'codex.exe process exited' } }
        })
      }
      this.pendingRequests.clear()

      for (const [, cb] of this.rpcCallbacks) {
        cb.reject(new Error('codex.exe process exited'))
      }
      this.rpcCallbacks.clear()

      this.lineBuffer = ''
    })

    console.log('[codex-bridge] Sending initialize request...')
    this.writeToServer({
      id: 'initialize',
      method: 'initialize',
      params: {
        clientInfo: { name: 'LiteEditor', title: 'LiteEditor', version: '1.0.0' },
        capabilities: { experimentalApi: true }
      }
    })
  }

  private completeInitialization(): void {
    if (this.serverInitialized) return
    this.serverInitialized = true

    if (this.initializeResolve) {
      this.initializeResolve()
      this.initializeResolve = null
    }

    // Tell webviews the app-server is connected -- this is what the real
    // Codex electron app sends after connecting to codex.exe.  Without it
    // the AppServerManager stays in 'disconnected' state.
    this.broadcastToWebviews({
      type: 'codex-app-server-connection-changed',
      hostId: 'local',
      state: 'connected'
    })

    console.log('[codex-bridge] Server initialized, notified webviews of connected state')
  }

  private onStdoutData(chunk: Buffer): void {
    this.lineBuffer += chunk.toString()
    const lines = this.lineBuffer.split('\n')
    this.lineBuffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      let msg: any
      try {
        msg = JSON.parse(trimmed)
      } catch {
        console.warn('[codex-bridge] Failed to parse JSON payload from server:', trimmed)
        continue
      }

      this.handleServerMessage(msg)
    }
  }

  private handleServerMessage(msg: any): void {
    if (msg.id && (msg.result !== undefined || msg.error !== undefined)) {
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
            hostId: 'local',
            message: { id: msg.id, result: msg.result, error: msg.error }
          })
        } else if (msg.id === 'initialize') {
          console.log('[codex-bridge] Initialize response:', msg.result ? 'success' : 'error')
          this.completeInitialization()
        }
      }
      return
    }

    if (msg.id && msg.method) {
      this.broadcastToWebviews({
        type: 'mcp-request',
        hostId: 'local',
        request: { id: msg.id, method: msg.method, params: msg.params }
      })
      return
    }

    if (msg.method) {
      this.broadcastToWebviews({
        type: 'mcp-notification',
        hostId: 'local',
        method: msg.method,
        params: msg.params
      })
    }
  }

  private writeToServer(msg: any): void {
    if (!this.proc?.stdin?.writable) return

    try {
      const payload = `${JSON.stringify(msg)}\n`
      this.proc.stdin.write(payload)
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
  // MCP request/response (extension host RPC -> codex.exe)
  // ---------------------------------------------------------------------------

  private async handleMcpRequest(wc: WebContents, message: any): Promise<void> {
    const request = message.request
    if (!request?.id || !request?.method) {
      console.log('[codex-bridge] mcp-request missing id/method:', message)
      return
    }

    const { id, method, params } = request

    if (!this.proc) {
      this.startServer()
    }

    if (!this.proc) {
      this.sendToWebview(wc, {
        type: 'mcp-response',
        hostId: 'local',
        message: { id, error: { code: -1, message: 'codex.exe server not available' } }
      })
      return
    }

    // Wait for the initialize handshake to complete before forwarding
    // webview requests, otherwise codex.exe may drop them.
    if (this.initializePromise) {
      await this.initializePromise
    }

    if (!this.proc) {
      // Process may have exited while we were waiting
      this.sendToWebview(wc, {
        type: 'mcp-response',
        hostId: 'local',
        message: { id, error: { code: -1, message: 'codex.exe server exited during initialization' } }
      })
      return
    }

    this.pendingRequests.set(id, wc)
    this.writeToServer({ id, method, params })

    // Add a safety timeout for each pending request so the webview never hangs
    // indefinitely waiting for a response from codex.exe.
    setTimeout(() => {
      if (this.pendingRequests.has(id)) {
        console.warn('[codex-bridge] MCP request timed out:', method, id)
        this.pendingRequests.delete(id)
        this.sendToWebview(wc, {
          type: 'mcp-response',
          hostId: 'local',
          message: { id, error: { code: -1, message: `Request timed out: ${method}` } }
        })
      }
    }, 30_000)
  }

  /**
   * Send a JSON-RPC request to codex.exe and return a Promise for the result.
   * Used internally by handleFetch for ipc-request / account-info routing.
   * Times out after 30 seconds.
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

  private parseJsonBody(body: string | undefined): Record<string, unknown> {
    if (!body) return {}

    try {
      const parsed = JSON.parse(body)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, unknown>
      }
    } catch {
      // Fall through
    }

    return {}
  }

  private getInternalPath(url: string): string {
    try {
      const parsed = new URL(url)
      return parsed.pathname.replace(/^\/+/, '')
    } catch {
      return url.replace(/^vscode:\/\/codex\/?/, '')
    }
  }

  private getInternalUrlResponse(url: string, body: string | undefined): InternalUrlResponse {
    this.hydrateWorkspaceState()

    const path = this.getInternalPath(url)
    const parsedBody = this.parseJsonBody(body)
    const homeDir = process.env.USERPROFILE || process.env.HOME || ''
    const codexHome = process.env.CODEX_HOME || (homeDir ? join(homeDir, '.codex') : '.codex')
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US'

    let queryKey: string | null = null
    try {
      queryKey = new URL(url).searchParams.get('key')
    } catch {
      queryKey = null
    }

    const stateKey = typeof parsedBody.key === 'string' ? parsedBody.key : queryKey

    switch (path) {
      case 'extension-info':
        return { status: 200, body: { version: '26.5304.20706', name: 'openai.chatgpt' } }

      case 'codex-home':
        return { status: 200, body: { codexHome, worktreesSegment: 'worktrees' } }

      case 'os-info':
        return { status: 200, body: { platform: process.platform } }

      case 'locale-info':
        return { status: 200, body: { ideLocale: locale, systemLocale: locale } }

      case 'active-workspace-roots': {
        const roots = this.activeWorkspaceRoot ? [this.activeWorkspaceRoot] : []
        return { status: 200, body: { roots } }
      }

      case 'workspace-root-options': {
        const roots = this.getWorkspaceRoots()
        const labels: Record<string, string> = {}
        for (const root of roots) {
          labels[root] = this.workspaceRootOptions.labels[root] ?? this.getRootLabel(root)
        }
        this.workspaceRootOptions.labels = { ...this.workspaceRootOptions.labels, ...labels }
        return { status: 200, body: { roots, labels } }
      }

      case 'get-copilot-api-proxy-info':
        return { status: 200, body: null }

      case 'mcp-codex-config':
        return { status: 200, body: { servers: [] } }

      case 'ide-context': {
        const workspaceRoot = typeof parsedBody.workspaceRoot === 'string'
          ? parsedBody.workspaceRoot
          : this.activeWorkspaceRoot ?? this.getWorkspaceRoots()[0] ?? null
        return {
          status: 200,
          body: {
            ideContext: {
              workspaceRoot,
              activeFile: null,
              selectedText: null,
              openFiles: []
            }
          }
        }
      }

      case 'get-configuration':
        return { status: 200, body: { value: stateKey ? this.configurationState.get(stateKey) ?? null : null } }

      case 'set-configuration':
        if (stateKey) {
          this.configurationState.set(stateKey, parsedBody.value ?? null)
        }
        return { status: 200, body: { success: true } }

      case 'paths-exist': {
        const paths = Array.isArray(parsedBody.paths)
          ? parsedBody.paths.filter((value): value is string => typeof value === 'string')
          : []
        const existingPaths = paths
          .map((pathValue) => pathValue.replace(/\/+$/, ''))
          .filter((pathValue) => existsSync(pathValue))
        return { status: 200, body: { existingPaths } }
      }

      case 'child-processes':
        return { status: 200, body: { processes: [] } }

      case 'open-in-targets':
        return { status: 200, body: this.buildOpenTargetsResponse(parsedBody) }

      case 'has-custom-cli-executable':
        return { status: 200, body: { hasCustomCliExecutable: false } }

      case 'get-global-state':
        return { status: 200, body: { value: stateKey ? this.globalState.get(stateKey) ?? null : null } }

      case 'set-global-state':
        if (stateKey) {
          this.globalState.set(stateKey, parsedBody.value ?? null)
        }
        return { status: 200, body: { success: true } }

      case 'set-vs-context':
        if (typeof parsedBody.key === 'string') {
          this.vsContextState.set(parsedBody.key, parsedBody.value ?? null)
        }
        return { status: 200, body: { success: true } }

      case 'git-origins': {
        const dirs = Array.isArray(parsedBody.dirs)
          ? parsedBody.dirs.filter((value): value is string => typeof value === 'string')
          : []
        const origins = dirs.map((dir) => {
          const normalized = dir.replace(/[\\/]+$/, '')
          return {
            dir: normalized,
            root: normalized,
            originUrl: null
          }
        })
        return { status: 200, body: { origins } }
      }

      case 'git-merge-base':
        return { status: 200, body: { mergeBaseSha: null } }

      case 'openai-api-key':
        return { status: 200, body: { value: null } }

      case 'pick-files':
        return { status: 200, body: { files: [] } }

      case 'read-file-binary':
        return { status: 200, body: { contentsBase64: null } }

      case 'recommended-skills':
        return { status: 200, body: { skills: [], error: null } }

      case 'generate-thread-title': {
        const prompt = typeof parsedBody.prompt === 'string' ? parsedBody.prompt.trim() : ''
        const title = prompt.length > 80 ? `${prompt.slice(0, 80).trimEnd()}...` : prompt
        return { status: 200, body: { title } }
      }

      case 'add-workspace-root-option': {
        const root = this.normalizeRoot(parsedBody.root)
        const setActive = parsedBody.setActive === true
        const label = typeof parsedBody.label === 'string' ? parsedBody.label.trim() : ''

        if (!root) {
          return { status: 200, body: { success: false } }
        }

        if (label.length > 0) {
          this.workspaceRootOptions.labels[root] = label
        }

        const existingRoots = this.getWorkspaceRoots()
        const roots = existingRoots.includes(root) ? existingRoots : [root, ...existingRoots]
        const activeRoot = setActive ? root : this.activeWorkspaceRoot
        this.applyWorkspaceRoots(roots, activeRoot, true)
        this.persistLiteEditorProjectRoot(activeRoot ?? root)

        return { status: 200, body: { success: true } }
      }

      case 'set-thread-pinned':
      case 'set-pinned-threads-order':
      case 'automation-run-archive':
      case 'cancel-trace-recording-start':
      case 'confirm-trace-recording-start':
      case 'feedback-create-sentry-issue':
      case 'prepare-worktree-snapshot':
      case 'submit-trace-recording-details':
      case 'upload-worktree-snapshot':
      case 'git-create-branch':
        return { status: 200, body: { success: true } }

      default:
        console.log('[codex-bridge] unknown vscode://codex/ endpoint:', path)
        return { status: 404, error: `Unsupported internal endpoint: ${path}` }
    }
  }

  // ---------------------------------------------------------------------------
  // Fetch bridge (vscode://codex/* internal URLs + real HTTP)
  // ---------------------------------------------------------------------------

  private async handleFetch(wc: WebContents, message: any): Promise<void> {
    const requestId = message.requestId
    const url: string = message.url
    const method: string = message.method || 'GET'
    const headers: Record<string, string> = message.headers || {}
    const body: string | undefined = message.body || undefined

    if (url.startsWith('vscode://')) {
      const path = this.getInternalPath(url)

      if (path === 'ipc-request' && body) {
        let parsedBody: any
        try {
          parsedBody = JSON.parse(body)
        } catch {
          this.sendToWebview(wc, {
            type: 'fetch-response',
            requestId,
            responseType: 'error',
            status: 400,
            error: 'invalid ipc-request body'
          })
          return
        }

        if (typeof parsedBody?.method !== 'string') {
          this.sendToWebview(wc, {
            type: 'fetch-response',
            requestId,
            responseType: 'error',
            status: 400,
            error: 'invalid ipc-request method'
          })
          return
        }

        try {
          const result = await this.sendRpcRequest(parsedBody.method, parsedBody.params)
          this.sendToWebview(wc, {
            type: 'fetch-response',
            requestId,
            responseType: 'success',
            status: 200,
            headers: { 'content-type': 'application/json' },
            bodyJsonString: JSON.stringify(result)
          })
        } catch (error) {
          this.sendToWebview(wc, {
            type: 'fetch-response',
            requestId,
            responseType: 'error',
            status: 502,
            error: error instanceof Error ? error.message : String(error)
          })
        }
        return
      }

      if (path === 'ipc-request' && !body) {
        this.sendToWebview(wc, {
          type: 'fetch-response',
          requestId,
          responseType: 'error',
          status: 400,
          error: 'missing ipc-request body'
        })
        return
      }

      if (path === 'account-info') {
        let result: any = null
        try {
          const rpcResult = await this.sendRpcRequest('account/read', {})
          result = rpcResult?.account ?? null
        } catch {
          // Keep null fallback for account-info.
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

      const internalResponse = this.getInternalUrlResponse(url, body)
      if (internalResponse.error) {
        this.sendToWebview(wc, {
          type: 'fetch-response',
          requestId,
          responseType: 'error',
          status: internalResponse.status,
          error: internalResponse.error
        })
        return
      }

      this.sendToWebview(wc, {
        type: 'fetch-response',
        requestId,
        responseType: 'success',
        status: internalResponse.status,
        headers: { 'content-type': 'application/json' },
        bodyJsonString: JSON.stringify(internalResponse.body ?? null)
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

    if (url.startsWith('vscode://')) {
      const path = this.getInternalPath(url)

      if (path === 'ipc-request' && body) {
        let parsedBody: any
        try {
          parsedBody = JSON.parse(body)
        } catch {
          this.sendToWebview(wc, {
            type: 'fetch-stream-error',
            requestId,
            status: 400,
            error: 'invalid ipc-request body'
          })
          return
        }

        if (typeof parsedBody?.method !== 'string') {
          this.sendToWebview(wc, {
            type: 'fetch-stream-error',
            requestId,
            status: 400,
            error: 'invalid ipc-request method'
          })
          return
        }

        try {
          const result = await this.sendRpcRequest(parsedBody.method, parsedBody.params)
          this.sendToWebview(wc, {
            type: 'fetch-stream-event',
            requestId,
            status: 200,
            headers: { 'content-type': 'application/json' },
            data: JSON.stringify(result)
          })
          this.sendToWebview(wc, { type: 'fetch-stream-complete', requestId })
        } catch (error) {
          this.sendToWebview(wc, {
            type: 'fetch-stream-error',
            requestId,
            status: 502,
            error: error instanceof Error ? error.message : String(error)
          })
        }
        return
      }

      if (path === 'ipc-request' && !body) {
        this.sendToWebview(wc, {
          type: 'fetch-stream-error',
          requestId,
          status: 400,
          error: 'missing ipc-request body'
        })
        return
      }

      if (path === 'account-info') {
        let result: any = null
        try {
          const rpcResult = await this.sendRpcRequest('account/read', {})
          result = rpcResult?.account ?? null
        } catch {
          // Keep null fallback for account-info.
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

      const internalResponse = this.getInternalUrlResponse(url, body)
      if (internalResponse.error) {
        this.sendToWebview(wc, {
          type: 'fetch-stream-error',
          requestId,
          status: internalResponse.status,
          error: internalResponse.error
        })
        return
      }

      this.sendToWebview(wc, {
        type: 'fetch-stream-event',
        requestId,
        status: internalResponse.status,
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify(internalResponse.body ?? null)
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
      this.setProjectRoot(root)
      this.sendToWebview(wc, { type: 'workspace-root-option-picked', root })
    }
  }

  private hydrateWorkspaceState(): void {
    if (this.workspaceStateHydrated) return
    this.workspaceStateHydrated = true

    const persistedRoot = this.readLiteEditorProjectRoot()
    if (!persistedRoot) return

    this.applyWorkspaceRoots([persistedRoot], persistedRoot, false)
  }

  private getWorkspaceRoots(): string[] {
    const roots = this.normalizeRoots(this.workspaceRootOptions.roots)
    if (this.activeWorkspaceRoot && !roots.includes(this.activeWorkspaceRoot)) {
      roots.unshift(this.activeWorkspaceRoot)
    }
    return roots
  }

  private applyWorkspaceRoots(roots: string[], activeRoot: string | null | undefined, broadcast: boolean): void {
    const normalizedRoots = this.normalizeRoots(roots)
    const normalizedActive = activeRoot === undefined
      ? this.normalizeRoot(this.activeWorkspaceRoot)
      : this.normalizeRoot(activeRoot)

    if (normalizedActive && !normalizedRoots.includes(normalizedActive)) {
      normalizedRoots.unshift(normalizedActive)
    }

    this.workspaceRootOptions.roots = normalizedRoots
    this.activeWorkspaceRoot = normalizedActive

    const labels: Record<string, string> = {}
    for (const root of normalizedRoots) {
      labels[root] = this.workspaceRootOptions.labels[root] ?? this.getRootLabel(root)
    }
    this.workspaceRootOptions.labels = { ...this.workspaceRootOptions.labels, ...labels }

    if (broadcast) {
      this.broadcastToWebviews({ type: 'workspace-root-options-updated' })
    }
  }

  private normalizeRoots(roots: string[]): string[] {
    const seen = new Set<string>()
    const normalized: string[] = []
    for (const root of roots) {
      const value = this.normalizeRoot(root)
      if (!value || seen.has(value)) continue
      seen.add(value)
      normalized.push(value)
    }
    return normalized
  }

  private normalizeRoot(root: unknown): string | null {
    if (typeof root !== 'string') return null
    const trimmed = root.trim()
    if (!trimmed || trimmed === '/') return null
    return trimmed
  }

  private getRootLabel(root: string): string {
    const trimmed = root.replace(/[\\/]+$/, '')
    return basename(trimmed) || trimmed
  }

  private buildOpenTargetsResponse(parsedBody: Record<string, unknown>): {
    preferredTarget: string | null
    targets: Array<{ id: string; label: string; description: string; default: boolean; available: boolean }>
    availableTargets: string[]
  } {
    const cwd = this.normalizeRoot(parsedBody.cwd)
    const roots = this.getWorkspaceRoots()
    const targetIds = cwd && !roots.includes(cwd)
      ? [cwd, ...roots]
      : roots

    let preferredTarget = this.activeWorkspaceRoot
    if (!preferredTarget && cwd && targetIds.includes(cwd)) preferredTarget = cwd
    if (!preferredTarget && targetIds.length > 0) preferredTarget = targetIds[0]

    const targets = targetIds.map((id) => ({
      id,
      label: this.workspaceRootOptions.labels[id] ?? this.getRootLabel(id),
      description: id,
      default: preferredTarget === id,
      available: true
    }))

    return {
      preferredTarget: preferredTarget ?? null,
      targets,
      availableTargets: targetIds
    }
  }

  private readLiteEditorProjectRoot(): string | null {
    const homeDir = process.env.USERPROFILE || process.env.HOME || ''
    if (!homeDir) return null

    const workspacePath = join(homeDir, '.liteeditor', 'workspace.json')
    if (!existsSync(workspacePath)) return null

    try {
      const parsed = JSON.parse(readFileSync(workspacePath, 'utf-8')) as { projectRoot?: unknown }
      return this.normalizeRoot(parsed.projectRoot)
    } catch {
      return null
    }
  }

  private persistLiteEditorProjectRoot(root: string): void {
    const homeDir = process.env.USERPROFILE || process.env.HOME || ''
    if (!homeDir) return

    const liteeditorDir = join(homeDir, '.liteeditor')
    const workspacePath = join(liteeditorDir, 'workspace.json')

    try {
      mkdirSync(liteeditorDir, { recursive: true })
      let existing: Record<string, unknown> = {}
      if (existsSync(workspacePath)) {
        try {
          const parsed = JSON.parse(readFileSync(workspacePath, 'utf-8')) as Record<string, unknown>
          if (parsed && typeof parsed === 'object') {
            existing = parsed
          }
        } catch {
          // Keep default empty object.
        }
      }

      existing.projectRoot = root

      writeFileSync(workspacePath, JSON.stringify(existing), 'utf-8')
    } catch {
      // Persistence failure should not block Codex runtime.
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
    this.sharedObjectSubscribers.get(key)?.add(sessionId)

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
      // webContents may be destroyed
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

    this.serverInitialized = false
    if (this.initializeResolve) {
      this.initializeResolve()
      this.initializeResolve = null
    }
    this.initializePromise = null

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
