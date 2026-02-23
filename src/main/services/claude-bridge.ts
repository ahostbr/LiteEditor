import { spawn, ChildProcess, execSync } from 'child_process'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { WebContents, dialog, shell } from 'electron'
import { ClaudeManager } from './claude-manager'
import type { PtyManager } from './pty-manager'

interface ChannelProcess {
  proc: ChildProcess
  sessionId: string
}

interface ClaudeCredentials {
  claudeAiOauth?: {
    accessToken?: string
    subscriptionType?: string
    rateLimitTier?: string
  }
  organizationUuid?: string
}

type RendererHostOpResult = Record<string, unknown>
type RendererHostOpInvoker = (op: string, payload?: Record<string, unknown>) => Promise<RendererHostOpResult>

type HostRequestType =
  | 'add_marketplace'
  | 'check_git_status'
  | 'checkout_branch'
  | 'close_plan_preview'
  | 'create_new_browser_tab'
  | 'disable_chrome_mcp'
  | 'disable_jupyter_mcp'
  | 'dismiss_onboarding'
  | 'dismiss_review_upsell_banner'
  | 'dismiss_terminal_banner'
  | 'enable_jupyter_mcp'
  | 'ensure_chrome_mcp_enabled'
  | 'exec'
  | 'fork_conversation'
  | 'get_asset_uris'
  | 'get_claude_state'
  | 'get_current_selection'
  | 'get_mcp_servers'
  | 'get_session_request'
  | 'get_terminal_contents'
  | 'init'
  | 'install_plugin'
  | 'list_files_request'
  | 'list_marketplaces'
  | 'list_plugins'
  | 'list_remote_sessions'
  | 'list_sessions_request'
  | 'log_event'
  | 'login'
  | 'new_conversation_tab'
  | 'open_claude_in_terminal'
  | 'open_config'
  | 'open_config_file'
  | 'open_content'
  | 'open_diff'
  | 'open_file'
  | 'open_file_diffs'
  | 'open_folder'
  | 'open_help'
  | 'open_markdown_preview'
  | 'open_output_panel'
  | 'open_terminal'
  | 'open_url'
  | 'reconnect_mcp_server'
  | 'refresh_marketplace'
  | 'remove_marketplace'
  | 'remove_plan_comment'
  | 'rename_tab'
  | 'request_usage_update'
  | 'rewind_code'
  | 'set_mcp_server_enabled'
  | 'set_model'
  | 'set_permission_mode'
  | 'set_plugin_enabled'
  | 'set_thinking_level'
  | 'show_claude_terminal_setting'
  | 'show_notification'
  | 'submit_oauth_code'
  | 'teleport_session'
  | 'uninstall_plugin'
  | 'update_skipped_branch'

const KNOWN_HOST_REQUEST_TYPES: Set<HostRequestType> = new Set<HostRequestType>([
  'add_marketplace',
  'check_git_status',
  'checkout_branch',
  'close_plan_preview',
  'create_new_browser_tab',
  'disable_chrome_mcp',
  'disable_jupyter_mcp',
  'dismiss_onboarding',
  'dismiss_review_upsell_banner',
  'dismiss_terminal_banner',
  'enable_jupyter_mcp',
  'ensure_chrome_mcp_enabled',
  'exec',
  'fork_conversation',
  'get_asset_uris',
  'get_claude_state',
  'get_current_selection',
  'get_mcp_servers',
  'get_session_request',
  'get_terminal_contents',
  'init',
  'install_plugin',
  'list_files_request',
  'list_marketplaces',
  'list_plugins',
  'list_remote_sessions',
  'list_sessions_request',
  'log_event',
  'login',
  'new_conversation_tab',
  'open_claude_in_terminal',
  'open_config',
  'open_config_file',
  'open_content',
  'open_diff',
  'open_file',
  'open_file_diffs',
  'open_folder',
  'open_help',
  'open_markdown_preview',
  'open_output_panel',
  'open_terminal',
  'open_url',
  'reconnect_mcp_server',
  'refresh_marketplace',
  'remove_marketplace',
  'remove_plan_comment',
  'rename_tab',
  'request_usage_update',
  'rewind_code',
  'set_mcp_server_enabled',
  'set_model',
  'set_permission_mode',
  'set_plugin_enabled',
  'set_thinking_level',
  'show_claude_terminal_setting',
  'show_notification',
  'submit_oauth_code',
  'teleport_session',
  'uninstall_plugin',
  'update_skipped_branch'
])

interface ClaudeBridgeDeps {
  ptyManager?: PtyManager
  invokeRendererOp?: RendererHostOpInvoker
}

interface PendingWebviewRequest {
  requestType: string
  sessionId?: string
  resolve: (response: Record<string, unknown>) => void
  reject: (error: Error) => void
  timer: NodeJS.Timeout
  abortSignal?: AbortSignal
  abortHandler?: () => void
}

interface IncomingRequestController {
  sessionId: string
  controller: AbortController
}

export class ClaudeBridge {
  private claudeManager: ClaudeManager
  private channels = new Map<string, ChannelProcess>()
  private incomingRequestControllers = new Map<string, IncomingRequestController>()
  private pendingWebviewRequests = new Map<string, PendingWebviewRequest>()
  private claudeExePath: string | null = null
  private cachedCredentials: ClaudeCredentials | null = null
  private ptyManager?: PtyManager
  private invokeRendererOp?: RendererHostOpInvoker
  private terminalAliases = new Map<string, string>()
  private defaultTerminalSessionId: string | null = null
  private modelSetting = 'default'
  private thinkingLevel = 'default'
  private permissionMode = 'default'

  constructor(claudeManager: ClaudeManager, deps: ClaudeBridgeDeps = {}) {
    this.claudeManager = claudeManager
    this.ptyManager = deps.ptyManager
    this.invokeRendererOp = deps.invokeRendererOp
  }

  private readCredentials(): ClaudeCredentials | null {
    if (this.cachedCredentials) return this.cachedCredentials

    const homeDir = process.env.USERPROFILE || process.env.HOME || ''
    const credPath = join(homeDir, '.claude', '.credentials.json')

    try {
      if (existsSync(credPath)) {
        const raw = readFileSync(credPath, 'utf-8')
        this.cachedCredentials = JSON.parse(raw)
        return this.cachedCredentials
      }
    } catch { /* ignore */ }

    return null
  }

  private findClaudeExe(): string | null {
    if (this.claudeExePath) return this.claudeExePath

    const extPath = this.claudeManager.findClaudeExtension()
    if (!extPath) return null

    const exePath = join(extPath, 'resources', 'native-binary', 'claude.exe')
    if (existsSync(exePath)) {
      this.claudeExePath = exePath
      return exePath
    }

    return null
  }

  handleWebviewMessage(sessionId: string, message: any): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    switch (message.type) {
      case 'response':
        this.handleWebviewResponse(message)
        break
      case 'cancel_request':
        this.handleCancelRequest(message)
        break
      case 'request':
        void this.handleRequest(sessionId, wc, message)
        break
      case 'launch_claude':
        this.launchClaude(sessionId, wc, message.channelId, message.model)
        break
      case 'io_message':
        this.handleIoMessage(message.channelId, message.message)
        break
      case 'start_speech_to_text':
        this.handleSpeechToTextNotSupported(wc, message.channelId)
        break
      case 'stop_speech_to_text':
        this.handleSpeechToTextNotSupported(wc, message.channelId)
        break
      case 'interrupt_claude':
        this.interruptClaude(message.channelId)
        break
      case 'close_channel':
        this.closeChannel(message.channelId)
        break
    }
  }

  notifyVisibilityChanged(sessionId: string, isVisible: boolean): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    this.emitWebviewRequest(wc, { type: 'visibility_changed', isVisible })
  }

  notifySelectionChanged(sessionId: string, selection: unknown): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    this.emitWebviewRequest(wc, { type: 'selection_changed', selection })
  }

  emitUpdateState(sessionId: string, channelId?: string): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    this.emitWebviewRequest(wc, {
      type: 'update_state',
      state: this.buildInitState(),
      config: this.buildClaudeConfig()
    }, channelId)
  }

  emitUsageUpdate(sessionId: string, utilization: unknown = null, error: unknown = null, channelId?: string): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    this.emitWebviewRequest(wc, {
      type: 'usage_update',
      utilization,
      error
    }, channelId)
  }

  emitAuthUrl(sessionId: string, url: string, channelId?: string): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    this.emitWebviewRequest(wc, {
      type: 'auth_url',
      url
    }, channelId)
  }

  emitCreateNewConversation(sessionId: string, channelId?: string): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    this.emitWebviewRequest(wc, { type: 'create_new_conversation' }, channelId)
  }

  emitOpenPluginsDialog(
    sessionId: string,
    payload: { pluginName?: string; marketplaceSource?: string } = {},
    channelId?: string
  ): void {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) return

    this.emitWebviewRequest(wc, {
      type: 'open_plugins_dialog',
      ...(payload.pluginName ? { pluginName: payload.pluginName } : {}),
      ...(payload.marketplaceSource ? { marketplaceSource: payload.marketplaceSource } : {})
    }, channelId)
  }

  async requestToolPermission(
    sessionId: string,
    params: {
      channelId: string
      toolName: string
      inputs?: Record<string, unknown>
      suggestions?: unknown[]
      timeoutMs?: number
      signal?: AbortSignal
    }
  ): Promise<Record<string, unknown>> {
    const wc = this.claudeManager.getWebContents(sessionId)
    if (!wc) {
      return { type: 'tool_permission_response', result: { behavior: 'deny', message: 'Session is not available', interrupt: false } }
    }

    try {
      const response = await this.requestWebviewResponse(
        wc,
        {
          type: 'tool_permission_request',
          toolName: params.toolName,
          inputs: params.inputs ?? {},
          suggestions: params.suggestions ?? []
        },
        {
          sessionId,
          channelId: params.channelId,
          timeoutMs: params.timeoutMs ?? 120000,
          signal: params.signal
        }
      )
      return response
    } catch (err) {
      const errorText = err instanceof Error ? err.message : String(err)
      return { type: 'tool_permission_response', result: { behavior: 'deny', message: errorText, interrupt: false } }
    }
  }

  private handleWebviewResponse(message: any): void {
    const requestId = typeof message?.requestId === 'string' ? message.requestId : ''
    if (!requestId) return

    const pending = this.pendingWebviewRequests.get(requestId)
    if (!pending) return

    clearTimeout(pending.timer)
    this.pendingWebviewRequests.delete(requestId)

    if (pending.abortSignal && pending.abortHandler) {
      pending.abortSignal.removeEventListener('abort', pending.abortHandler)
    }

    const response = (message?.response && typeof message.response === 'object')
      ? message.response as Record<string, unknown>
      : {}

    if (response.type === 'error') {
      const errorText = typeof response.error === 'string'
        ? response.error
        : `Webview request '${pending.requestType}' failed`
      pending.reject(new Error(errorText))
      return
    }

    pending.resolve(response)
  }

  private handleCancelRequest(message: any): void {
    const targetRequestId = typeof message?.targetRequestId === 'string' ? message.targetRequestId : ''
    if (!targetRequestId) return

    const entry = this.incomingRequestControllers.get(targetRequestId)
    if (!entry) return

    entry.controller.abort()
    this.incomingRequestControllers.delete(targetRequestId)
  }

  private handleSpeechToTextNotSupported(wc: WebContents, channelId: unknown): void {
    if (typeof channelId !== 'string' || !channelId) return

    this.sendToWebview(wc, {
      type: 'close_channel',
      channelId,
      error: 'Speech-to-text is not supported in LiteEditor yet.'
    })
  }

  private emitWebviewRequest(wc: WebContents, request: Record<string, unknown>, channelId?: string): void {
    this.sendToWebview(wc, {
      type: 'request',
      ...(channelId ? { channelId } : {}),
      request
    })
  }

  private requestWebviewResponse(
    wc: WebContents,
    request: Record<string, unknown>,
    options: {
      sessionId?: string
      channelId?: string
      timeoutMs?: number
      signal?: AbortSignal
    } = {}
  ): Promise<Record<string, unknown>> {
    const requestType = typeof request.type === 'string' ? request.type : 'unknown'
    const requestId = `claude-host-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const timeoutMs = options.timeoutMs ?? 30000

    if (wc.isDestroyed()) {
      return Promise.reject(new Error(`Webview is destroyed; cannot send '${requestType}'`))
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const pending = this.pendingWebviewRequests.get(requestId)
        if (pending?.abortSignal && pending.abortHandler) {
          pending.abortSignal.removeEventListener('abort', pending.abortHandler)
        }
        this.pendingWebviewRequests.delete(requestId)
        reject(new Error(`Timed out waiting for webview response to '${requestType}'`))
      }, timeoutMs)

      const pending: PendingWebviewRequest = {
        requestType,
        sessionId: options.sessionId,
        resolve,
        reject,
        timer,
        abortSignal: options.signal
      }

      if (options.signal) {
        const abortHandler = () => {
          clearTimeout(timer)
          this.pendingWebviewRequests.delete(requestId)
          this.sendToWebview(wc, { type: 'cancel_request', targetRequestId: requestId })
          reject(new Error(`Webview request '${requestType}' aborted`))
        }
        pending.abortHandler = abortHandler
        if (options.signal.aborted) {
          abortHandler()
          return
        }
        options.signal.addEventListener('abort', abortHandler, { once: true })
      }

      this.pendingWebviewRequests.set(requestId, pending)

      this.sendToWebview(wc, {
        type: 'request',
        requestId,
        ...(options.channelId ? { channelId: options.channelId } : {}),
        request
      })
    })
  }

  private async handleRequest(sessionId: string, wc: WebContents, message: any): Promise<void> {
    const requestType = String(message.request?.type || message.requestType || '')
    const requestId = String(message.requestId || '')
    const request = ((message.request && typeof message.request === 'object') ? message.request : {}) as Record<string, unknown>
    const channelId = typeof message.channelId === 'string' ? message.channelId : undefined

    if (!requestId) {
      console.warn('[claude-bridge] Request dropped without requestId')
      return
    }

    if (!requestType) {
      this.sendResponseError(wc, requestId, 'Missing request type')
      return
    }

    const abortController = new AbortController()
    this.incomingRequestControllers.set(requestId, { sessionId, controller: abortController })

    try {
      if (!KNOWN_HOST_REQUEST_TYPES.has(requestType as HostRequestType)) {
        console.warn(`[claude-bridge] Unknown request type '${requestType}'`, { channelId })
        this.sendResponseOk(wc, requestId, this.createSafeStub(requestType))
        return
      }

      const response = await this.handleKnownRequest(
        requestType as HostRequestType,
        sessionId,
        wc,
        request,
        channelId,
        abortController.signal
      )
      if (abortController.signal.aborted) return
      this.sendResponseOk(wc, requestId, response)
    } catch (err) {
      if (abortController.signal.aborted) {
        console.warn(`[claude-bridge] Request '${requestType}' was cancelled`, { requestId, channelId })
        return
      }
      const error = err instanceof Error ? err.message : String(err)
      console.error(`[claude-bridge] Failed request '${requestType}'`, { error, channelId })
      this.sendResponseError(wc, requestId, error)
    } finally {
      this.incomingRequestControllers.delete(requestId)
    }
  }

  private async handleKnownRequest(
    requestType: HostRequestType,
    sessionId: string,
    _wc: WebContents,
    request: Record<string, unknown>,
    channelId?: string,
    _signal?: AbortSignal
  ): Promise<Record<string, unknown>> {
    switch (requestType) {
      case 'init':
        return { state: this.buildInitState() }
      case 'get_claude_state':
        return { config: this.buildClaudeConfig() }
      case 'request_usage_update':
        this.emitUsageUpdate(sessionId, null, null, channelId)
        return {}
      case 'list_sessions_request':
        return { sessions: await this.listSessions() }
      case 'list_remote_sessions':
        return { sessions: [] }
      case 'list_files_request':
        return { files: [] }
      case 'get_session_request': {
        const targetSessionId = typeof request.sessionId === 'string' ? request.sessionId : ''
        return this.getSessionMessages(targetSessionId)
      }
      case 'set_model': {
        const model = typeof request.model === 'string' ? request.model : null
        if (model) this.modelSetting = model
        this.emitUpdateState(sessionId, channelId)
        return { success: true }
      }
      case 'set_thinking_level': {
        const thinkingLevel = typeof request.thinkingLevel === 'string' ? request.thinkingLevel : null
        if (thinkingLevel) this.thinkingLevel = thinkingLevel
        this.emitUpdateState(sessionId, channelId)
        return { success: true }
      }
      case 'set_permission_mode': {
        const mode = typeof request.mode === 'string' ? request.mode : null
        if (mode) this.permissionMode = mode
        return { success: true }
      }
      case 'open_url': {
        const url = typeof request.url === 'string' ? request.url : null
        if (url) await shell.openExternal(url)
        return { success: true }
      }
      case 'open_folder': {
        const mainWindow = this.claudeManager.getMainWindow(sessionId)
        if (!mainWindow) return { opened: false }
        const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
        if (result.canceled || result.filePaths.length === 0) return { opened: false }
        await this.invokeRendererHostOp('open_folder', { path: result.filePaths[0] })
        return { opened: true, path: result.filePaths[0] }
      }
      case 'open_file':
        await this.invokeRendererHostOp('open_file', request)
        return {}
      case 'open_content': {
        const result = await this.invokeRendererHostOp('open_content', request)
        return { updatedContent: result.updatedContent ?? request.content ?? '' }
      }
      case 'open_diff': {
        const result = await this.invokeRendererHostOp('open_diff', request)
        return { newEdits: result.newEdits ?? request.edits ?? [] }
      }
      case 'open_file_diffs':
        await this.invokeRendererHostOp('open_file_diffs', request)
        return {}
      case 'get_current_selection': {
        const result = await this.invokeRendererHostOp('get_current_selection')
        return { selection: result.selection ?? '' }
      }
      case 'new_conversation_tab': {
        const result = await this.invokeRendererHostOp('new_conversation_tab', request)
        return { success: true, ...(result.sessionId ? { sessionId: result.sessionId } : {}) }
      }
      case 'rename_tab':
        await this.invokeRendererHostOp('rename_tab', request)
        return { success: true }
      case 'check_git_status': {
        const result = await this.invokeRendererHostOp('check_git_status')
        return Object.keys(result).length > 0 ? result : { isClean: true, hasChanges: false, branch: null }
      }
      case 'checkout_branch': {
        const result = await this.invokeRendererHostOp('checkout_branch', request)
        return Object.keys(result).length > 0 ? result : { status: 'failed', branch: request.branch ?? null }
      }
      case 'update_skipped_branch':
        return { success: true }
      case 'open_output_panel':
        await this.invokeRendererHostOp('open_output_panel')
        return { success: true }
      case 'open_config':
        await this.invokeRendererHostOp('open_config', request)
        return { success: true }
      case 'open_help':
        await shell.openExternal('https://code.claude.com/docs/en/vs-code')
        return { success: true }
      case 'show_notification':
        return this.handleShowNotification(sessionId, request)
      case 'open_terminal':
        return this.handleOpenTerminal(request)
      case 'open_claude_in_terminal':
        return this.handleOpenClaudeInTerminal(request)
      case 'exec':
        return this.handleExecInTerminal(request)
      case 'get_terminal_contents':
        return this.handleGetTerminalContents(request)
      case 'login':
        return { auth: this.buildAuthStatus() }
      case 'submit_oauth_code':
        return { success: true }
      case 'get_asset_uris':
        return { assetUris: {} }
      case 'log_event':
        console.log('[claude-bridge] log_event', {
          channelId,
          eventName: typeof request.eventName === 'string' ? request.eventName : 'unknown'
        })
        return { success: true }
      case 'fork_conversation': {
        const result = await this.invokeRendererHostOp('fork_conversation', request)
        return { sessionId: result.sessionId ?? request.forkedFromSession ?? '' }
      }
      case 'teleport_session':
        return this.createSafeStub(requestType, { success: false })
      case 'list_plugins':
        return this.createSafeStub(requestType, { installedPlugins: [], availablePlugins: [] })
      case 'list_marketplaces':
        return this.createSafeStub(requestType, { marketplaces: [] })
      case 'get_mcp_servers':
        return this.createSafeStub(requestType, { servers: [] })
      case 'install_plugin':
      case 'uninstall_plugin':
      case 'set_plugin_enabled':
      case 'add_marketplace':
      case 'remove_marketplace':
      case 'refresh_marketplace':
      case 'set_mcp_server_enabled':
      case 'reconnect_mcp_server':
      case 'ensure_chrome_mcp_enabled':
      case 'disable_chrome_mcp':
      case 'enable_jupyter_mcp':
      case 'disable_jupyter_mcp':
      case 'open_config_file':
      case 'open_markdown_preview':
      case 'close_plan_preview':
      case 'remove_plan_comment':
      case 'create_new_browser_tab':
      case 'show_claude_terminal_setting':
      case 'dismiss_terminal_banner':
      case 'dismiss_review_upsell_banner':
      case 'dismiss_onboarding':
      case 'rewind_code':
        return this.createSafeStub(requestType, { success: true })
      default:
        return this.createSafeStub(requestType)
    }
  }

  private buildInitState(): Record<string, unknown> {
    return {
      defaultCwd: process.cwd(),
      platform: process.platform,
      openNewInTab: true,
      isOnboardingDismissed: true,
      initialPermissionMode: this.permissionMode,
      modelSetting: this.modelSetting,
      thinkingLevel: this.thinkingLevel,
      speechToTextEnabled: false,
      browserIntegrationSupported: false,
      protocolVersion: 'liteeditor-claude-bridge/1',
      chromeMcpState: { status: 'disconnected' },
      debuggerMcpState: { status: 'not_installed' },
      jupyterMcpState: { status: 'not_installed' },
      authStatus: this.buildAuthStatus()
    }
  }

  private buildClaudeConfig(): Record<string, unknown> {
    const auth = this.buildAuthStatus()
    const hasAuth = !!auth
    return {
      account: {
        tokenSource: hasAuth ? 'claude_ai_oauth' : 'none',
        subscriptionType: auth?.subscriptionType ?? null,
        authenticated: hasAuth
      },
      models: [
        { value: 'default', displayName: 'Default (recommended)', description: 'Opus 4.6 - Most capable for complex work' },
        { value: 'claude-opus-4-6-max-1m', displayName: 'Opus (1M context)', description: 'Opus 4.6 with 1M context - Billed as extra usage - $10/$37.50 per Mtok' },
        { value: 'sonnet', displayName: 'Sonnet', description: 'Sonnet 4.6 - Best for everyday tasks' },
        { value: 'claude-sonnet-4-6-max-1m', displayName: 'Sonnet (1M context)', description: 'Sonnet 4.6 with 1M context - Billed as extra usage - $6/$22.50 per Mtok' },
        { value: 'haiku', displayName: 'Haiku', description: 'Haiku 4.5 - Fastest for quick answers' }
      ],
      commands: [
        { id: 'fast', label: '/fast', description: 'Toggle fast mode (Opus 4.6 only)' },
        { id: 'login', label: '/login', description: 'Switch account' }
      ]
    }
  }

  private buildAuthStatus(): Record<string, unknown> | null {
    const creds = this.readCredentials()
    const hasAuth = !!(creds?.claudeAiOauth?.accessToken)
    if (!hasAuth) return null
    return {
      authenticated: true,
      authMethod: 'oauth',
      tokenSource: 'claude_ai_oauth',
      subscriptionType: creds?.claudeAiOauth?.subscriptionType || null,
      rateLimitTier: creds?.claudeAiOauth?.rateLimitTier || null
    }
  }

  private async getSessionMessages(sessionId: string): Promise<Record<string, unknown>> {
    try {
      const homeDir = process.env.USERPROFILE || process.env.HOME || ''
      const projectsDir = join(homeDir, '.claude', 'projects')

      if (!existsSync(projectsDir)) {
        return { messages: [], sessionDiffs: [] }
      }

      let jsonlPath: string | null = null
      const projectDirs = readdirSync(projectsDir)

      for (const projDir of projectDirs) {
        const candidate = join(projectsDir, projDir, `${sessionId}.jsonl`)
        if (existsSync(candidate)) {
          jsonlPath = candidate
          break
        }
      }

      if (!jsonlPath) {
        return { messages: [], sessionDiffs: [] }
      }

      const messages: any[] = []
      const raw = readFileSync(jsonlPath, 'utf-8')
      const jsonlLines = raw.split('\n')

      for (const line of jsonlLines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          messages.push(JSON.parse(trimmed))
        } catch { }
      }

      return { messages, sessionDiffs: [] }
    } catch {
      return { messages: [], sessionDiffs: [] }
    }
  }

  private sendResponseOk(wc: WebContents, requestId: string, response: Record<string, unknown>): void {
    this.sendToWebview(wc, {
      type: 'response',
      requestId,
      response
    })
  }

  private sendResponseError(wc: WebContents, requestId: string, error: string, code?: string): void {
    this.sendToWebview(wc, {
      type: 'response',
      requestId,
      response: {
        type: 'error',
        error,
        ...(code ? { code } : {})
      }
    })
  }

  private createSafeStub(requestType: string, payload: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      success: true,
      implemented: false,
      requestType,
      ...payload
    }
  }

  private async invokeRendererHostOp(op: string, payload: Record<string, unknown> = {}): Promise<RendererHostOpResult> {
    if (!this.invokeRendererOp) return {}
    try {
      return await this.invokeRendererOp(op, payload)
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      console.warn(`[claude-bridge] Renderer host op failed '${op}'`, { error })
      return {}
    }
  }

  private async handleShowNotification(sessionId: string, request: Record<string, unknown>): Promise<Record<string, unknown>> {
    const message = typeof request.message === 'string' ? request.message : 'Notification'
    const detail = typeof request.detail === 'string' ? request.detail : undefined
    const severity = typeof request.severity === 'string' ? request.severity : 'info'
    const buttons = this.toStringArray(request.buttons)
    const mainWindow = this.claudeManager.getMainWindow(sessionId)

    const type: Electron.MessageBoxOptions['type'] = severity === 'error'
      ? 'error'
      : severity === 'warning'
        ? 'warning'
        : 'info'

    const fallbackButtons = buttons.length > 0 ? buttons : ['OK']
    const response = mainWindow
      ? await dialog.showMessageBox(mainWindow, {
        type,
        message,
        detail,
        buttons: fallbackButtons,
        defaultId: 0,
        cancelId: 0
      })
      : await dialog.showMessageBox({
        type,
        message,
        detail,
        buttons: fallbackButtons,
        defaultId: 0,
        cancelId: 0
      })

    return { buttonValue: fallbackButtons[response.response] ?? null }
  }

  private async handleOpenTerminal(request: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.ptyManager) return this.createSafeStub('open_terminal', { opened: false })

    const terminalName = typeof request.terminalName === 'string' ? request.terminalName : undefined
    const cwd = typeof request.cwd === 'string' ? request.cwd : undefined
    const executable = typeof request.executable === 'string' ? request.executable : undefined
    const args = this.toStringArray(request.args)

    const sessionId = this.ensureTerminalSession(terminalName, cwd, executable)
    if (!sessionId) return this.createSafeStub('open_terminal', { opened: false })

    await this.attachTerminalSession(sessionId, cwd, executable)

    if (args.length > 0) {
      this.ptyManager.write(sessionId, `${args.join(' ')}\r`)
    }

    return {
      opened: true,
      terminalName: terminalName ?? sessionId,
      sessionId
    }
  }

  private async handleOpenClaudeInTerminal(request: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.ptyManager) return this.createSafeStub('open_claude_in_terminal', { opened: false })

    const prompt = typeof request.prompt === 'string' ? request.prompt : ''
    const args = this.toStringArray(request.args)
    const cwd = typeof request.cwd === 'string' ? request.cwd : undefined
    const terminalName = typeof request.terminalName === 'string' ? request.terminalName : 'claude'

    const sessionId = this.ensureTerminalSession(terminalName, cwd)
    if (!sessionId) return this.createSafeStub('open_claude_in_terminal', { opened: false })

    await this.attachTerminalSession(sessionId, cwd, 'claude')

    const commandLine = ['claude', ...args, ...(prompt ? [prompt] : [])].join(' ')
    this.ptyManager.write(sessionId, `${commandLine}\r`)

    return {
      opened: true,
      terminalName,
      sessionId,
      command: commandLine
    }
  }

  private async handleExecInTerminal(request: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.ptyManager) return this.createSafeStub('exec', { success: false })

    const command = typeof request.command === 'string' ? request.command : ''
    if (!command) return { success: false, error: 'Missing command' }

    const terminalName = typeof request.terminalName === 'string' ? request.terminalName : 'claude'
    const cwd = typeof request.cwd === 'string' ? request.cwd : undefined
    const sessionId = this.ensureTerminalSession(terminalName, cwd)
    if (!sessionId) return { success: false, error: 'No terminal session available' }

    await this.attachTerminalSession(sessionId, cwd)

    const params = Array.isArray(request.params) ? request.params.map(String) : []
    const commandLine = [command, ...params].join(' ')
    this.ptyManager.write(sessionId, `${commandLine}\r`)

    return {
      success: true,
      terminalName,
      sessionId,
      output: this.ptyManager.readOutput(sessionId) ?? ''
    }
  }

  private async handleGetTerminalContents(request: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.ptyManager) return this.createSafeStub('get_terminal_contents', { contents: null })

    const terminalName = typeof request.terminalName === 'string' ? request.terminalName : undefined
    const sessionId = this.resolveTerminalSession(terminalName)
    if (!sessionId) {
      return {
        terminalName: terminalName ?? null,
        sessionId: null,
        contents: null
      }
    }

    return {
      terminalName: terminalName ?? sessionId,
      sessionId,
      contents: this.ptyManager.readOutput(sessionId) ?? ''
    }
  }

  private resolveTerminalSession(terminalName?: string): string | null {
    if (!this.ptyManager) return null

    const sessions = this.ptyManager.listSessions()
    const isAlive = (id: string): boolean => sessions.some((session) => session.id === id)

    if (terminalName) {
      const alias = this.terminalAliases.get(terminalName)
      if (alias && isAlive(alias)) return alias
      if (isAlive(terminalName)) {
        this.terminalAliases.set(terminalName, terminalName)
        return terminalName
      }
    }

    if (this.defaultTerminalSessionId && isAlive(this.defaultTerminalSessionId)) {
      return this.defaultTerminalSessionId
    }

    return sessions.length > 0 ? sessions[0].id : null
  }

  private ensureTerminalSession(terminalName?: string, cwd?: string, executable?: string): string | null {
    if (!this.ptyManager) return null

    const existing = this.resolveTerminalSession(terminalName)
    if (existing) {
      if (terminalName) this.terminalAliases.set(terminalName, existing)
      this.defaultTerminalSessionId = existing
      return existing
    }

    const sessionId = this.ptyManager.create(executable, cwd)
    if (terminalName) this.terminalAliases.set(terminalName, sessionId)
    this.defaultTerminalSessionId = sessionId
    return sessionId
  }

  private async attachTerminalSession(sessionId: string, cwd?: string, shellName?: string): Promise<void> {
    if (!this.invokeRendererOp) return
    await this.invokeRendererHostOp('attach_terminal_session', {
      sessionId,
      ...(cwd ? { cwd } : {}),
      ...(shellName ? { shell: shellName } : {})
    })
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map((item) => String(item))
  }
  private async listSessions(): Promise<any[]> {
    const homeDir = process.env.USERPROFILE || process.env.HOME || ''
    const projectsDir = join(homeDir, '.claude', 'projects')

    if (!existsSync(projectsDir)) return []

    const sessions: any[] = []

    try {
      const projectDirs = readdirSync(projectsDir)

      for (const projDir of projectDirs) {
        const projPath = join(projectsDir, projDir)
        try {
          const stat = statSync(projPath)
          if (!stat.isDirectory()) continue
        } catch { continue }

        // Find .jsonl session files in this project
        let files: string[]
        try {
          files = readdirSync(projPath).filter((f) => f.endsWith('.jsonl'))
        } catch { continue }

        for (const file of files) {
          const sessionId = file.replace('.jsonl', '')
          const filePath = join(projPath, file)

          try {
            const stat = statSync(filePath)
            const fileSize = stat.size

            // Read first user message for summary
            const summary = await this.getSessionSummary(filePath)

            sessions.push({
              id: sessionId,
              lastModified: stat.mtimeMs,
              summary: summary || 'Untitled',
              isCurrentWorkspace: true,
              worktree: null,
              gitBranch: null,
              fileSize,
              projectDir: projDir
            })
          } catch { /* skip unreadable files */ }
        }
      }
    } catch { /* projects dir not readable */ }

    // Sort by lastModified descending (newest first)
    sessions.sort((a, b) => b.lastModified - a.lastModified)

    return sessions
  }

  private getSessionSummary(jsonlPath: string): Promise<string | null> {
    return new Promise((resolve) => {
      let summary: string | null = null
      let lineCount = 0

      const rl = createInterface({
        input: createReadStream(jsonlPath, { encoding: 'utf-8' }),
        crlfDelay: Infinity
      })

      rl.on('line', (line) => {
        lineCount++
        // Only scan first 50 lines to find a user message
        if (lineCount > 50) {
          rl.close()
          return
        }

        try {
          const obj = JSON.parse(line)
          if (obj.type === 'user' && obj.message?.content && !summary) {
            const content = obj.message.content
            if (typeof content === 'string') {
              summary = content.slice(0, 100)
            } else if (Array.isArray(content)) {
              const textBlock = content.find((b: any) => b.type === 'text' && b.text)
              if (textBlock) {
                summary = textBlock.text.slice(0, 100)
              }
            }
            rl.close()
          }
        } catch { /* skip non-JSON lines */ }
      })

      rl.on('close', () => resolve(summary))
      rl.on('error', () => resolve(null))
    })
  }

  private launchClaude(sessionId: string, wc: WebContents, channelId: string, model?: string): void {
    const exePath = this.findClaudeExe()
    if (!exePath) {
      this.sendToWebview(wc, {
        type: 'io_message',
        channelId,
        message: { type: 'system', text: 'claude.exe not found in extension directory.' },
        done: true
      })
      return
    }

    // Kill existing process on this channel
    this.closeChannel(channelId)

    const args = [
      '--output-format', 'stream-json',
      '--input-format', 'stream-json',
      '--verbose'
    ]

    // Add model flag if not default
    if (model && model !== 'default') {
      args.push('--model', model)
    }

    args.push('-p')

    const proc = spawn(exePath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: { ...process.env }
    })

    this.channels.set(channelId, { proc, sessionId })

    let stdoutBuffer = ''

    proc.stdout?.on('data', (chunk: Buffer) => {
      stdoutBuffer += chunk.toString()

      // Process NDJSON lines
      let newlineIdx: number
      while ((newlineIdx = stdoutBuffer.indexOf('\n')) >= 0) {
        const line = stdoutBuffer.slice(0, newlineIdx).trim()
        stdoutBuffer = stdoutBuffer.slice(newlineIdx + 1)

        if (!line) continue

        try {
          const parsed = JSON.parse(line)
          this.sendToWebview(wc, {
            type: 'io_message',
            channelId,
            message: parsed,
            done: false
          })
        } catch {
          // Non-JSON output â€” send as system message
          this.sendToWebview(wc, {
            type: 'io_message',
            channelId,
            message: { type: 'system', text: line },
            done: false
          })
        }
      }
    })

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString().trim()
      if (text) {
        this.sendToWebview(wc, {
          type: 'io_message',
          channelId,
          message: { type: 'system', text },
          done: false
        })
      }
    })

    proc.on('exit', (code) => {
      this.channels.delete(channelId)
      this.sendToWebview(wc, {
        type: 'io_message',
        channelId,
        message: { type: 'system', text: `Process exited with code ${code}` },
        done: true
      })
    })

    proc.on('error', (err) => {
      this.channels.delete(channelId)
      this.sendToWebview(wc, {
        type: 'io_message',
        channelId,
        message: { type: 'system', text: `Error: ${err.message}` },
        done: true
      })
    })
  }

  private handleIoMessage(channelId: string, message: any): void {
    const channel = this.channels.get(channelId)
    if (!channel || !channel.proc.stdin?.writable) return

    try {
      channel.proc.stdin.write(JSON.stringify(message) + '\n')
    } catch {
      /* stdin may be closed */
    }
  }

  private interruptClaude(channelId: string): void {
    const channel = this.channels.get(channelId)
    if (!channel) return

    try {
      if (process.platform === 'win32') {
        // On Windows, send Ctrl+C equivalent via taskkill
        const pid = channel.proc.pid
        if (pid) {
          try {
            // Generate a CTRL_C_EVENT for the process
            channel.proc.kill('SIGINT')
          } catch { /* */ }
        }
      } else {
        channel.proc.kill('SIGINT')
      }
    } catch {
      /* process may already be dead */
    }
  }

  private closeChannel(channelId: string): void {
    const channel = this.channels.get(channelId)
    if (!channel) return

    this.channels.delete(channelId)

    try {
      const pid = channel.proc.pid
      channel.proc.kill()

      // Windows: force-kill the process tree
      if (pid && process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${pid} /T /F`, { windowsHide: true, stdio: 'ignore' })
        } catch { /* already dead */ }
      }
    } catch {
      /* process may already be dead */
    }
  }

  private sendToWebview(wc: WebContents, message: any): void {
    try {
      wc.send('claude:host-message', message)
    } catch {
      /* webcontents may be destroyed */
    }
  }

  shutdownSession(sessionId: string): void {
    for (const [requestId, entry] of Array.from(this.incomingRequestControllers.entries())) {
      if (entry.sessionId !== sessionId) continue
      entry.controller.abort()
      this.incomingRequestControllers.delete(requestId)
    }

    for (const [requestId, pending] of Array.from(this.pendingWebviewRequests.entries())) {
      if (pending.sessionId !== sessionId) continue
      clearTimeout(pending.timer)
      if (pending.abortSignal && pending.abortHandler) {
        pending.abortSignal.removeEventListener('abort', pending.abortHandler)
      }
      pending.reject(new Error(`Claude session '${sessionId}' closed`))
      this.pendingWebviewRequests.delete(requestId)
    }

    for (const [channelId, channel] of Array.from(this.channels.entries())) {
      if (channel.sessionId !== sessionId) continue
      this.closeChannel(channelId)
    }
  }

  shutdown(): void {
    this.incomingRequestControllers.forEach((entry) => entry.controller.abort())
    this.incomingRequestControllers.clear()

    this.pendingWebviewRequests.forEach((pending) => {
      clearTimeout(pending.timer)
      if (pending.abortSignal && pending.abortHandler) {
        pending.abortSignal.removeEventListener('abort', pending.abortHandler)
      }
      pending.reject(new Error('Claude bridge shutdown'))
    })
    this.pendingWebviewRequests.clear()

    for (const channelId of Array.from(this.channels.keys())) {
      this.closeChannel(channelId)
    }
  }
}

