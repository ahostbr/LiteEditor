import { spawn, ChildProcess, execSync } from 'child_process'
import { join } from 'path'
import { existsSync, readdirSync } from 'fs'
import { WebContents } from 'electron'
import { ClaudeManager } from './claude-manager'

interface ChannelProcess {
  proc: ChildProcess
  sessionId: string
}

export class ClaudeBridge {
  private claudeManager: ClaudeManager
  private channels = new Map<string, ChannelProcess>()
  private claudeExePath: string | null = null

  constructor(claudeManager: ClaudeManager) {
    this.claudeManager = claudeManager
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
      case 'request':
        this.handleRequest(sessionId, wc, message)
        break
      case 'launch_claude':
        this.launchClaude(sessionId, wc, message.channelId)
        break
      case 'io_message':
        this.handleIoMessage(message.channelId, message.message)
        break
      case 'interrupt_claude':
        this.interruptClaude(message.channelId)
        break
      case 'close_channel':
        this.closeChannel(message.channelId)
        break
    }
  }

  private handleRequest(sessionId: string, wc: WebContents, message: any): void {
    const requestType = message.request?.type || message.requestType
    const requestId = message.requestId

    switch (requestType) {
      case 'init':
        this.sendInitResponse(wc, requestId)
        break
      case 'get_claude_state':
        this.sendToWebview(wc, {
          type: 'response',
          requestId,
          response: { config: {} }
        })
        break
      case 'list_sessions_request':
        this.sendToWebview(wc, {
          type: 'response',
          requestId,
          response: { sessions: [] }
        })
        break
      case 'list_remote_sessions':
        this.sendToWebview(wc, {
          type: 'response',
          requestId,
          response: { sessions: [] }
        })
        break
      case 'list_files_request':
        this.sendToWebview(wc, {
          type: 'response',
          requestId,
          response: { files: [] }
        })
        break
      default:
        // Unknown request — send empty response to avoid hangs
        this.sendToWebview(wc, {
          type: 'response',
          requestId,
          response: {}
        })
        break
    }
  }

  private sendInitResponse(wc: WebContents, requestId: string): void {
    const cwd = process.cwd()

    this.sendToWebview(wc, {
      type: 'response',
      requestId,
      response: {
        state: {
          defaultCwd: cwd,
          platform: process.platform,
          openNewInTab: true,
          isOnboardingDismissed: true,
          initialPermissionMode: 'default',
          modelSetting: 'default',
          speechToTextEnabled: false,
          browserIntegrationSupported: false,
          chromeMcpState: { status: 'disconnected' },
          debuggerMcpState: { status: 'not_installed' },
          jupyterMcpState: { status: 'not_installed' }
        }
      }
    })
  }

  private launchClaude(sessionId: string, wc: WebContents, channelId: string): void {
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

    const proc = spawn(exePath, [
      '--output-format', 'stream-json',
      '--input-format', 'stream-json',
      '--verbose',
      '-p'
    ], {
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
          // Non-JSON output — send as system message
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

  shutdown(): void {
    for (const [channelId] of this.channels) {
      this.closeChannel(channelId)
    }
  }
}
