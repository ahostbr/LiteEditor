import * as pty from 'node-pty'
import { platform } from 'os'

let counter = 0

interface PtySession {
  process: pty.IPty
  id: string
}

export class PtyManager {
  private sessions = new Map<string, PtySession>()

  create(
    shell?: string,
    cwd?: string,
    onData?: (data: string) => void,
    onExit?: (exitCode: number) => void
  ): string {
    const id = `pty-${++counter}-${Date.now()}`
    const defaultShell = platform() === 'win32'
      ? 'powershell.exe'
      : process.env.SHELL || '/bin/bash'

    const proc = pty.spawn(shell || defaultShell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: cwd || process.env.HOME || process.cwd(),
      env: process.env as Record<string, string>
    })

    const session: PtySession = { process: proc, id }
    this.sessions.set(id, session)

    proc.onData((data) => {
      onData?.(data)
    })

    proc.onExit(({ exitCode }) => {
      this.sessions.delete(id)
      onExit?.(exitCode)
    })

    return id
  }

  write(sessionId: string, data: string): void {
    this.sessions.get(sessionId)?.process.write(data)
  }

  resize(sessionId: string, cols: number, rows: number): void {
    this.sessions.get(sessionId)?.process.resize(cols, rows)
  }

  kill(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.process.kill()
      this.sessions.delete(sessionId)
    }
  }

  killAll(): void {
    for (const [, session] of Array.from(this.sessions)) {
      session.process.kill()
    }
    this.sessions.clear()
  }
}
