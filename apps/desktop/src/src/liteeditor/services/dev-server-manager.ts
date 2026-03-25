// @ts-nocheck
import * as pty from "node-pty";
import { platform } from "os";

let counter = 0;

export interface RunningScript {
  sessionId: string;
  projectId: string;
  scriptName: string;
  pid: number;
  detectedPort: number | null;
}

export interface ScriptStatusEvent {
  type: "started" | "stopped" | "crashed";
  sessionId: string;
  projectId: string;
  scriptName: string;
  exitCode?: number;
  detectedPort?: number | null;
}

// Matches common dev server port output patterns:
//   "localhost:3000", ":3000", "port 3000", "Port 3000", "http://localhost:3000"
const PORT_PATTERNS = [
  /https?:\/\/localhost:(\d{2,5})/,
  /https?:\/\/127\.0\.0\.1:(\d{2,5})/,
  /https?:\/\/0\.0\.0\.0:(\d{2,5})/,
  /localhost:(\d{2,5})/,
  /127\.0\.0\.1:(\d{2,5})/,
  /0\.0\.0\.0:(\d{2,5})/,
  /[Pp]ort\s+(\d{2,5})/,
  /:(\d{2,5})\b/,
];

interface ScriptSession {
  sessionId: string;
  projectId: string;
  scriptName: string;
  process: pty.IPty;
  detectedPort: number | null;
}

export class DevServerManager {
  private sessions = new Map<string, ScriptSession>();
  private listeners: Array<(event: ScriptStatusEvent) => void> = [];

  startScript(projectId: string, scriptName: string, cwd: string): string {
    const sessionId = `script-${++counter}-${Date.now()}`;

    const shell = platform() === "win32" ? "powershell.exe" : process.env.SHELL || "/bin/bash";

    const proc = pty.spawn(shell, [], {
      name: "xterm-256color",
      cols: 120,
      rows: 30,
      cwd,
      env: process.env as Record<string, string>,
    });

    const session: ScriptSession = {
      sessionId,
      projectId,
      scriptName,
      process: proc,
      detectedPort: null,
    };

    this.sessions.set(sessionId, session);

    // Write the script command to the shell
    const cmd = platform() === "win32" ? `${scriptName}\r` : `${scriptName}\n`;
    proc.write(cmd);

    // Parse PTY output for port detection
    proc.onData((data) => {
      if (session.detectedPort !== null) return; // Already found a port

      for (const pattern of PORT_PATTERNS) {
        const match = data.match(pattern);
        if (match) {
          const port = parseInt(match[1], 10);
          if (port >= 1 && port <= 65535) {
            session.detectedPort = port;
            break;
          }
        }
      }
    });

    proc.onExit(({ exitCode }) => {
      const stopped = this.sessions.get(sessionId);
      if (stopped) {
        this.sessions.delete(sessionId);
        this.emit({
          type: exitCode === 0 ? "stopped" : "crashed",
          sessionId,
          projectId: stopped.projectId,
          scriptName: stopped.scriptName,
          exitCode,
          detectedPort: stopped.detectedPort,
        });
      }
    });

    this.emit({
      type: "started",
      sessionId,
      projectId,
      scriptName,
    });

    return sessionId;
  }

  stopScript(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.process.kill();
      this.sessions.delete(sessionId);
      this.emit({
        type: "stopped",
        sessionId,
        projectId: session.projectId,
        scriptName: session.scriptName,
        detectedPort: session.detectedPort,
      });
    }
  }

  getRunningScripts(): RunningScript[] {
    return Array.from(this.sessions.values()).map((session) => ({
      sessionId: session.sessionId,
      projectId: session.projectId,
      scriptName: session.scriptName,
      pid: session.process.pid,
      detectedPort: session.detectedPort,
    }));
  }

  onStatusChange(callback: (event: ScriptStatusEvent) => void): void {
    this.listeners.push(callback);
  }

  killAll(): void {
    this.sessions.forEach((session) => {
      session.process.kill();
    });
    this.sessions.clear();
  }

  private emit(event: ScriptStatusEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Listener errors should not break the manager
      }
    }
  }
}
