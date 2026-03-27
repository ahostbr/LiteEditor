// @ts-nocheck

export interface RegisteredSession {
  sessionId: string;           // PTY session ID (e.g., "pty-1-1234567890")
  cliType: "claude" | "codex" | "shell" | "unknown";
  pid: number;
  createdAt: number;           // Date.now()
  lastHeartbeat: number;       // Date.now()
  cwd: string;
  shell: string;
  label?: string;              // Human-friendly label
  claudeSessionId?: string;    // Claude Code session ID (from status bar)
  agentId?: string;            // Agent identifier for targeted routing
}

export type ResolveResult =
  | { ok: true; sessionId: string; session: RegisteredSession }
  | { ok: false; errorCode: "NOT_FOUND"; error: string; query: ResolveQuery }
  | { ok: false; errorCode: "AMBIGUOUS"; error: string; matches: RegisteredSession[]; query: ResolveQuery }
  | { ok: false; errorCode: "MISSING_PARAM"; error: string };

interface ResolveQuery {
  agentId?: string;
  label?: string;
  claudeSessionId?: string;
  cliType?: string;
}

export class SessionRegistry {
  private sessions = new Map<string, RegisteredSession>();

  register(
    sessionId: string,
    info: {
      cliType?: RegisteredSession["cliType"];
      pid: number;
      cwd: string;
      shell: string;
      label?: string;
      agentId?: string;
      claudeSessionId?: string;
    },
  ): RegisteredSession {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      existing.lastHeartbeat = Date.now();
      if (info.label !== undefined) existing.label = info.label;
      if (info.agentId !== undefined) existing.agentId = info.agentId;
      if (info.claudeSessionId !== undefined) existing.claudeSessionId = info.claudeSessionId;
      return existing;
    }

    const session: RegisteredSession = {
      sessionId,
      cliType: info.cliType ?? "unknown",
      pid: info.pid,
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
      cwd: info.cwd,
      shell: info.shell,
      label: info.label,
      agentId: info.agentId,
      claudeSessionId: info.claudeSessionId,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  unregister(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  get(sessionId: string): RegisteredSession | undefined {
    return this.sessions.get(sessionId);
  }

  resolve(query: ResolveQuery): ResolveResult {
    const { agentId, label, claudeSessionId, cliType } = query;

    if (!agentId && !label && !claudeSessionId && !cliType) {
      return {
        ok: false,
        errorCode: "MISSING_PARAM",
        error: "At least one of agentId, label, claudeSessionId, or cliType is required",
      };
    }

    const matches: RegisteredSession[] = [];

    for (const session of this.sessions.values()) {
      if (agentId && session.agentId === agentId) {
        matches.push(session);
      } else if (claudeSessionId && session.claudeSessionId === claudeSessionId) {
        matches.push(session);
      } else if (label && session.label === label) {
        matches.push(session);
      } else if (cliType && session.cliType === cliType && !agentId && !claudeSessionId && !label) {
        matches.push(session);
      }
    }

    if (matches.length === 0) {
      return {
        ok: false,
        errorCode: "NOT_FOUND",
        error: `No session found for query`,
        query,
      };
    }

    if (matches.length > 1) {
      return {
        ok: false,
        errorCode: "AMBIGUOUS",
        error: `Multiple sessions match query (${matches.length} found). Use more specific criteria.`,
        matches,
        query,
      };
    }

    return {
      ok: true,
      sessionId: matches[0].sessionId,
      session: matches[0],
    };
  }

  list(): RegisteredSession[] {
    return Array.from(this.sessions.values());
  }

  updateClaudeSessionId(sessionId: string, claudeSessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.claudeSessionId = claudeSessionId;
    return true;
  }

  heartbeat(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.lastHeartbeat = Date.now();
    return true;
  }

  /** Serialize all sessions for project persistence */
  toJSON(): object[] {
    return this.list().map((s) => ({ ...s }));
  }

  /** Restore sessions from persisted data */
  fromJSON(data: object[]): void {
    this.sessions.clear();
    for (const item of data) {
      const s = item as RegisteredSession;
      if (s.sessionId) {
        this.sessions.set(s.sessionId, s);
      }
    }
  }

  clear(): void {
    this.sessions.clear();
  }
}

export const sessionRegistry = new SessionRegistry();
