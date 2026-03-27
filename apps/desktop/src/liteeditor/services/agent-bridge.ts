// @ts-nocheck
import * as http from "http";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { app, BrowserWindow } from "electron";
import type { PtyManager } from "./pty-manager";
import type { BrowserManager } from "./browser-manager";
import { sessionRegistry } from "./session-registry";

const VALID_CLI_TYPES = new Set(["claude", "codex", "shell", "unknown"]);
import {
  DOM_INDEX_SCRIPT,
  getClickScript,
  getTypeScript,
  getScrollScript,
  getSelectOptionScript,
} from "./dom-helper";

const PORT = 7423;
const HOST = "127.0.0.1";

export class AgentBridge {
  private server: http.Server | null = null;
  private ptyManager: PtyManager;
  private browserManager: BrowserManager;
  private getMainWindow: () => BrowserWindow | null;
  readonly token: string;

  constructor(
    ptyManager: PtyManager,
    browserManager: BrowserManager,
    getMainWindow: () => BrowserWindow | null,
  ) {
    this.ptyManager = ptyManager;
    this.browserManager = browserManager;
    this.getMainWindow = getMainWindow;
    this.token = crypto.randomBytes(32).toString("hex");
  }

  private async focusTerminal(sessionId: string): Promise<void> {
    const win = this.getMainWindow();
    if (win) {
      await win.webContents
        .executeJavaScript(`window.__focusPtySession && window.__focusPtySession('${this.escapeForJs(sessionId)}')`)
        .catch(() => {});
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });
      this.server.on("error", reject);
      this.server.listen(PORT, HOST, () => {
        console.log(`Agent Bridge listening on ${HOST}:${PORT}`);
        this.persistToken();
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    this.removeTokenFile();
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  private get tokenFilePath(): string {
    const dir = path.join(app.getPath("home"), ".liteeditor");
    return path.join(dir, "bridge-token");
  }

  private persistToken(): void {
    try {
      const filePath = this.tokenFilePath;
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, this.token, { mode: 0o600 });
    } catch (err) {
      console.error("Failed to persist bridge token:", err);
    }
  }

  private removeTokenFile(): void {
    try {
      fs.unlinkSync(this.tokenFilePath);
    } catch {
      /* file may not exist */
    }
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Bearer token auth — reject requests without valid token
    const authHeader = req.headers["authorization"] || "";
    const expectedHeader = `Bearer ${this.token}`;
    if (authHeader !== expectedHeader) {
      this.json(res, 401, { error: "Unauthorized" });
      return;
    }

    const url = req.url || "";
    const method = req.method || "";

    // --- PTY endpoints ---

    if (method === "GET" && url === "/pty/list") {
      const sessions = this.ptyManager.listSessions();
      this.json(res, 200, { sessions });
      return;
    }

    if (method === "POST" && (url === "/pty/read" || url === "/pty/write" || url === "/pty/talk")) {
      this.readJsonBody(req, res, (parsed) => {
        if (url === "/pty/read") {
          this.handlePtyRead(res, parsed);
        } else if (url === "/pty/talk") {
          this.handlePtyTalk(res, parsed);
        } else {
          this.handlePtyWrite(res, parsed);
        }
      });
      return;
    }

    // --- Browser endpoints ---

    if (method === "GET" && url === "/browser/list") {
      const sessions = this.browserManager.listSessions();
      this.json(res, 200, { sessions });
      return;
    }

    if (method === "POST" && url.startsWith("/browser/")) {
      this.readJsonBody(req, res, (parsed) => {
        this.handleBrowserPost(url, res, parsed);
      });
      return;
    }

    // --- Panel CRUD endpoints ---

    if (method === "POST" && url === "/pty/create") {
      this.readJsonBody(req, res, (parsed) => this.handlePtyCreate(res, parsed), true);
      return;
    }

    if (method === "POST" && url === "/browser/create") {
      this.readJsonBody(req, res, (parsed) => this.handleBrowserCreate(res, parsed), true);
      return;
    }

    if (method === "POST" && url === "/editor/open") {
      this.readJsonBody(req, res, (parsed) => this.handleEditorOpen(res, parsed));
      return;
    }

    if (method === "DELETE" && url.startsWith("/pty/")) {
      const sessionId = url.slice("/pty/".length);
      if (!sessionId) {
        this.json(res, 400, { error: "Missing session_id" });
        return;
      }
      this.ptyManager.kill(sessionId);
      this.json(res, 200, { success: true });
      return;
    }

    if (method === "DELETE" && url.startsWith("/browser/")) {
      const sessionId = url.slice("/browser/".length);
      if (!sessionId) {
        this.json(res, 400, { error: "Missing session_id" });
        return;
      }
      this.browserManager.destroyView(sessionId);
      this.json(res, 200, { success: true });
      return;
    }

    // --- Session registry endpoints ---

    if (method === "GET" && url === "/session/list") {
      this.json(res, 200, { sessions: sessionRegistry.list() });
      return;
    }

    if (method === "POST" && url === "/session/register") {
      this.readJsonBody(req, res, (parsed) => {
        const { session_id, cli_type, pid, cwd, shell, label, agent_id, claude_session_id } = parsed;
        const rawCliType = String(cli_type || "unknown");
        const session = sessionRegistry.register(String(session_id), {
          cliType: VALID_CLI_TYPES.has(rawCliType) ? rawCliType as "claude" | "codex" | "shell" | "unknown" : "unknown",
          pid: Number(pid) || 0,
          cwd: String(cwd || ""),
          shell: String(shell || ""),
          label: label ? String(label) : undefined,
          agentId: agent_id ? String(agent_id) : undefined,
          claudeSessionId: claude_session_id ? String(claude_session_id) : undefined,
        });
        this.json(res, 200, { ok: true, session });
      });
      return;
    }

    if (method === "POST" && url === "/session/resolve") {
      this.readJsonBody(req, res, (parsed) => {
        const result = sessionRegistry.resolve({
          agentId: parsed.agent_id ? String(parsed.agent_id) : undefined,
          label: parsed.label ? String(parsed.label) : undefined,
          claudeSessionId: parsed.claude_session_id ? String(parsed.claude_session_id) : undefined,
          cliType: parsed.cli_type ? String(parsed.cli_type) : undefined,
        });
        this.json(res, 200, result);
      });
      return;
    }

    if (method === "DELETE" && url.startsWith("/session/")) {
      const sessionId = url.slice("/session/".length);
      const removed = sessionRegistry.unregister(sessionId);
      this.json(res, 200, { ok: removed });
      return;
    }

    this.json(res, 404, { error: "Not found" });
  }

  // --- PTY handlers ---

  private handlePtyRead(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined;
    if (!sessionId) {
      this.json(res, 400, { error: "Missing session_id" });
      return;
    }

    const output = this.ptyManager.readOutput(sessionId);
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` });
      return;
    }

    this.json(res, 200, { session_id: sessionId, output });
  }

  private handlePtyWrite(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined;
    const data = body.data as string | undefined;
    if (!sessionId) {
      this.json(res, 400, { error: "Missing session_id" });
      return;
    }
    if (data === undefined || data === null) {
      this.json(res, 400, { error: "Missing data" });
      return;
    }

    const output = this.ptyManager.readOutput(sessionId);
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` });
      return;
    }

    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, String(data));
        if (!success) {
          this.json(res, 500, { ok: false, error: `Write failed for session '${sessionId}'` });
          return;
        }
        this.json(res, 200, { ok: true, bytes: String(data).length });
      }, 200);
    });
  }

  private handlePtyTalk(res: http.ServerResponse, body: Record<string, unknown>): void {
    const sessionId = body.session_id as string | undefined;
    const command = body.command as string | undefined;
    if (!sessionId) {
      this.json(res, 400, { error: "Missing session_id" });
      return;
    }
    if (command === undefined || command === null) {
      this.json(res, 400, { error: "Missing command" });
      return;
    }

    const output = this.ptyManager.readOutput(sessionId);
    if (output === null) {
      this.json(res, 404, { error: `Session '${sessionId}' not found` });
      return;
    }

    this.focusTerminal(sessionId).then(() => {
      setTimeout(() => {
        const success = this.ptyManager.write(sessionId, command + "\r");
        if (!success) {
          this.json(res, 500, { ok: false, error: `Talk failed for session '${sessionId}'` });
          return;
        }
        this.json(res, 200, { ok: true, bytes: command.length + 1 });
      }, 200);
    });
  }

  // --- Browser handlers ---

  private async handleBrowserPost(
    url: string,
    res: http.ServerResponse,
    body: Record<string, unknown>,
  ): Promise<void> {
    const route = url.replace("/browser/", "");
    const sessionId = body.session_id as string | undefined;

    // Routes that don't require session_id
    if (route === "list") {
      const sessions = this.browserManager.listSessions();
      this.json(res, 200, { sessions });
      return;
    }

    if (!sessionId) {
      this.json(res, 400, { error: "Missing session_id" });
      return;
    }

    const wc = this.browserManager.getWebContents(sessionId);
    if (!wc) {
      this.json(res, 404, { error: `Browser session '${sessionId}' not found` });
      return;
    }

    try {
      switch (route) {
        case "navigate": {
          let targetUrl = body.url as string;
          if (!targetUrl) {
            this.json(res, 400, { error: "Missing url" });
            return;
          }
          if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith("file://")) {
            targetUrl = "https://" + targetUrl;
          }
          await wc.loadURL(targetUrl);
          this.json(res, 200, { success: true, url: wc.getURL() });
          break;
        }

        case "go-back": {
          if (!wc.canGoBack()) {
            this.json(res, 200, { success: false, error: "Cannot go back" });
            return;
          }
          wc.goBack();
          this.json(res, 200, { success: true });
          break;
        }

        case "go-forward": {
          if (!wc.canGoForward()) {
            this.json(res, 200, { success: false, error: "Cannot go forward" });
            return;
          }
          wc.goForward();
          this.json(res, 200, { success: true });
          break;
        }

        case "reload": {
          wc.reload();
          this.json(res, 200, { success: true });
          break;
        }

        case "read-page": {
          const result = await wc.executeJavaScript(DOM_INDEX_SCRIPT);
          this.json(res, 200, { success: true, ...result });
          break;
        }

        case "screenshot": {
          const image = await wc.capturePage();
          const dataUrl = "data:image/png;base64," + image.toPNG().toString("base64");
          this.json(res, 200, { success: true, dataUrl });
          break;
        }

        case "click": {
          const index = body.index as number;
          if (index === undefined || index === null) {
            this.json(res, 400, { error: "Missing index" });
            return;
          }
          const result = await wc.executeJavaScript(getClickScript(index));
          this.json(res, 200, result);
          break;
        }

        case "type": {
          const text = body.text as string;
          if (text === undefined || text === null) {
            this.json(res, 400, { error: "Missing text" });
            return;
          }
          const idx = body.index as number | undefined;
          const result = await wc.executeJavaScript(getTypeScript(text, idx));
          this.json(res, 200, result);
          break;
        }

        case "scroll": {
          const direction = body.direction as "up" | "down" | "left" | "right";
          const amount = (body.amount as number) || 300;
          if (!direction) {
            this.json(res, 400, { error: "Missing direction" });
            return;
          }
          const result = await wc.executeJavaScript(getScrollScript(direction, amount));
          this.json(res, 200, result);
          break;
        }

        case "select-option": {
          const elementIndex = body.element_index as number;
          const optionIndex = body.option_index as number;
          if (elementIndex === undefined || optionIndex === undefined) {
            this.json(res, 400, { error: "Missing element_index or option_index" });
            return;
          }
          const result = await wc.executeJavaScript(
            getSelectOptionScript(elementIndex, optionIndex),
          );
          this.json(res, 200, result);
          break;
        }

        case "execute-js": {
          const code = body.code as string;
          if (!code) {
            this.json(res, 400, { error: "Missing code" });
            return;
          }
          const result = await wc.executeJavaScript(code);
          this.json(res, 200, { success: true, result });
          break;
        }

        case "console-logs": {
          const since = body.since as number | undefined;
          const logs = this.browserManager.getConsoleLogs(sessionId, since);
          this.json(res, 200, { success: true, logs });
          break;
        }

        default:
          this.json(res, 404, { error: `Unknown browser route: ${route}` });
      }
    } catch (err) {
      this.json(res, 500, { success: false, error: String(err) });
    }
  }

  // --- Panel CRUD handlers ---

  private handlePtyCreate(res: http.ServerResponse, body: Record<string, unknown>): void {
    const shell = body.shell as string | undefined;
    const cwdRaw = body.cwd as string | undefined;

    const defaultCwd = os.homedir();
    let resolvedCwd: string;
    if (!cwdRaw) {
      resolvedCwd = defaultCwd;
    } else if (path.isAbsolute(cwdRaw)) {
      resolvedCwd = cwdRaw;
    } else {
      resolvedCwd = path.resolve(defaultCwd, cwdRaw);
    }

    const bridgeEnv: Record<string, string> = {
      LITEEDITOR_BRIDGE_TOKEN: this.token,
      LITEEDITOR_BRIDGE_URL: `http://${HOST}:${PORT}`,
    };

    const sessionId = this.ptyManager.create(
      shell,
      resolvedCwd,
      (data: string) => {
        for (const win of BrowserWindow.getAllWindows()) {
          win.webContents.send(`pty:data:${sessionId}`, data);
        }
      },
      (exitCode: number) => {
        for (const win of BrowserWindow.getAllWindows()) {
          win.webContents.send(`pty:exit:${sessionId}`, exitCode);
        }
      },
      bridgeEnv,
    );

    const pid = this.ptyManager.getSessionInfo(sessionId)?.pid;

    const win = this.getMainWindow();
    if (win) {
      const safe = this.escapeForJs(sessionId);
      win.webContents
        .executeJavaScript(`window.__createTerminalPane && window.__createTerminalPane('${safe}')`)
        .catch(() => {});
    }

    this.json(res, 200, { session_id: sessionId, pid });
  }

  private async handleBrowserCreate(
    res: http.ServerResponse,
    body: Record<string, unknown>,
  ): Promise<void> {
    const url = (body.url as string | undefined) || "about:blank";

    const win = this.getMainWindow();
    if (!win) {
      this.json(res, 500, { error: "No main window available" });
      return;
    }

    try {
      const sessionId = this.browserManager.createView(win, url);

      win.webContents
        .executeJavaScript(`window.__createBrowserPane && window.__createBrowserPane('${this.escapeForJs(sessionId)}')`)
        .catch(() => {});

      this.json(res, 200, { session_id: sessionId });
    } catch (err) {
      this.json(res, 500, { error: String(err) });
    }
  }

  private async handleEditorOpen(
    res: http.ServerResponse,
    body: Record<string, unknown>,
  ): Promise<void> {
    const filePath = body.filePath as string | undefined;
    if (!filePath) {
      this.json(res, 400, { error: "Missing filePath" });
      return;
    }

    const win = this.getMainWindow();
    if (win) {
      win.webContents
        .executeJavaScript(`window.__openEditorFile && window.__openEditorFile('${this.escapeForJs(filePath)}')`)
        .catch(() => {});
    }

    this.json(res, 200, { success: true });
  }

  // --- Helpers ---

  private json(res: http.ServerResponse, status: number, data: unknown): void {
    const payload = JSON.stringify(data);
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    });
    res.end(payload);
  }

  private readBody(req: http.IncomingMessage, cb: (err: Error | null, body: string) => void): void {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => cb(null, Buffer.concat(chunks).toString("utf-8")));
    req.on("error", (err) => cb(err, ""));
  }

  private readJsonBody(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    handler: (parsed: Record<string, unknown>) => void,
    allowEmpty = false,
  ): void {
    this.readBody(req, (err, body) => {
      if (err) {
        this.json(res, 400, { error: "Invalid request body" });
        return;
      }
      let parsed: Record<string, unknown>;
      try {
        parsed = allowEmpty && !body.trim() ? {} : JSON.parse(body);
      } catch {
        this.json(res, 400, { error: "Invalid JSON" });
        return;
      }
      handler(parsed);
    });
  }

  private escapeForJs(str: string): string {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }
}
