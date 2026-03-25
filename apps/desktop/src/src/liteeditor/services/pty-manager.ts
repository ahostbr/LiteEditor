// @ts-nocheck
import * as pty from "node-pty";
import { platform } from "os";

let counter = 0;
const MAX_BUFFER_SIZE = 32768;

export interface PtySessionInfo {
  id: string;
  pid: number;
  shell: string;
  cwd: string;
  createdAt: number;
}

interface PtySession extends PtySessionInfo {
  process: pty.IPty;
}

export class PtyManager {
  private sessions = new Map<string, PtySession>();
  private outputBuffers = new Map<string, string>();

  create(
    shell?: string,
    cwd?: string,
    onData?: (data: string) => void,
    onExit?: (exitCode: number) => void,
  ): string {
    const id = `pty-${++counter}-${Date.now()}`;
    const defaultShell =
      platform() === "win32" ? "powershell.exe" : process.env.SHELL || "/bin/bash";
    const resolvedShell = shell || defaultShell;
    const resolvedCwd = cwd || process.env.HOME || process.cwd();

    const proc = pty.spawn(resolvedShell, [], {
      name: "xterm-256color",
      cols: 80,
      rows: 24,
      cwd: resolvedCwd,
      env: process.env as Record<string, string>,
    });

    const session: PtySession = {
      process: proc,
      id,
      pid: proc.pid,
      shell: resolvedShell,
      cwd: resolvedCwd,
      createdAt: Date.now(),
    };
    this.sessions.set(id, session);
    this.outputBuffers.set(id, "");

    proc.onData((data) => {
      let buf = (this.outputBuffers.get(id) || "") + data;
      if (buf.length > MAX_BUFFER_SIZE) {
        buf = buf.slice(buf.length - MAX_BUFFER_SIZE);
      }
      this.outputBuffers.set(id, buf);
      onData?.(data);
    });

    proc.onExit(({ exitCode }) => {
      this.sessions.delete(id);
      this.outputBuffers.delete(id);
      onExit?.(exitCode);
    });

    return id;
  }

  write(sessionId: string, data: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.process.write(data);
    return true;
  }

  resize(sessionId: string, cols: number, rows: number): void {
    this.sessions.get(sessionId)?.process.resize(cols, rows);
  }

  kill(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.process.kill();
      this.sessions.delete(sessionId);
      this.outputBuffers.delete(sessionId);
    }
  }

  killAll(): void {
    this.sessions.forEach((session) => {
      session.process.kill();
    });
    this.sessions.clear();
    this.outputBuffers.clear();
  }

  readOutput(sessionId: string): string | null {
    return this.outputBuffers.get(sessionId) ?? null;
  }

  getSessionInfo(sessionId: string): PtySessionInfo | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return {
      id: session.id,
      pid: session.process.pid,
      shell: session.shell,
      cwd: session.cwd,
      createdAt: session.createdAt,
    };
  }

  listSessions(): PtySessionInfo[] {
    return Array.from(this.sessions.values()).map((session) => ({
      id: session.id,
      pid: session.process.pid,
      shell: session.shell,
      cwd: session.cwd,
      createdAt: session.createdAt,
    }));
  }
}
