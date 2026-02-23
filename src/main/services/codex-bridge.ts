import { WebContents, shell } from 'electron'
import { CodexManager } from './codex-manager'

interface SharedObjectStore {
  [key: string]: unknown
}

export class CodexBridge {
  private codexManager: CodexManager
  private persistedAtomState: Record<string, unknown> = {}
  private sharedObjects: SharedObjectStore = {}
  private sharedObjectSubscribers = new Map<string, Set<string>>()

  constructor(codexManager: CodexManager) {
    this.codexManager = codexManager
  }

  handleWebviewMessage(sessionId: string, message: any): void {
    const wc = this.codexManager.getWebContents(sessionId)
    if (!wc) return

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
        // No-op
        break

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
      case 'mcp-notification':
      case 'mcp-response':
        console.log(`[codex-bridge] MCP message (Phase 2): ${msgType}`, message.method || '')
        break

      case 'worker-request':
      case 'worker-request-cancel':
        console.log(`[codex-bridge] Worker message (Phase 2): ${msgType}`, message.method || '')
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

  private async handleFetch(wc: WebContents, message: any): Promise<void> {
    const requestId = message.requestId
    const url = message.url
    const options = message.options || {}

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body || undefined
      })

      const contentType = response.headers.get('content-type') || ''
      let body: string
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await response.json())
      } else {
        body = await response.text()
      }

      this.sendToWebview(wc, {
        type: 'fetch-response',
        requestId,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body
      })
    } catch (err) {
      this.sendToWebview(wc, {
        type: 'fetch-response',
        requestId,
        error: err instanceof Error ? err.message : String(err)
      })
    }
  }

  private async handleFetchStream(wc: WebContents, message: any): Promise<void> {
    const requestId = message.requestId
    const url = message.url
    const options = message.options || {}

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body || undefined
      })

      this.sendToWebview(wc, {
        type: 'fetch-stream-start',
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
            type: 'fetch-stream-chunk',
            requestId,
            chunk: decoder.decode(value, { stream: true })
          })
        }
      }

      this.sendToWebview(wc, {
        type: 'fetch-stream-end',
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

  private sendToWebview(wc: WebContents, message: any): void {
    try {
      wc.send('codex:host-message', message)
    } catch {
      /* webcontents may be destroyed */
    }
  }

  removeSession(sessionId: string): void {
    for (const [key, subscribers] of Array.from(this.sharedObjectSubscribers.entries())) {
      subscribers.delete(sessionId)
      if (subscribers.size === 0) {
        this.sharedObjectSubscribers.delete(key)
      }
    }
  }

  shutdown(): void {
    this.sharedObjectSubscribers.clear()
  }
}
