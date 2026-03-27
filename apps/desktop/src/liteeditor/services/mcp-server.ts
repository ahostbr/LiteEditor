import { BrowserWindow } from "electron";
import * as os from "os";
import * as path from "path";
import type { PtyManager } from "./pty-manager";
import type { BrowserManager } from "./browser-manager";
import type { SessionRegistry } from "./session-registry";
import {
  DOM_INDEX_SCRIPT,
  getClickScript,
  getTypeScript,
} from "./dom-helper";

const VALID_CLI_TYPES = new Set(["claude", "codex", "shell", "unknown"]);

export interface McpToolDefinition {
  name: string;
  description: string;
  input_schema: object;
}

export interface McpToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface McpServerDeps {
  ptyManager: PtyManager;
  browserManager: BrowserManager;
  sessionRegistry: SessionRegistry;
  getMainWindow: () => BrowserWindow | null;
}

export class LiteEditorMcpServer {
  private ptyManager: PtyManager;
  private browserManager: BrowserManager;
  private sessionRegistry: SessionRegistry;
  private getMainWindow: () => BrowserWindow | null;

  constructor(deps: McpServerDeps) {
    this.ptyManager = deps.ptyManager;
    this.browserManager = deps.browserManager;
    this.sessionRegistry = deps.sessionRegistry;
    this.getMainWindow = deps.getMainWindow;
  }

  getTools(): McpToolDefinition[] {
    return [
      {
        name: "liteeditor_pty_list",
        description: "List all active PTY terminal sessions in LiteEditor",
        input_schema: { type: "object", properties: {}, required: [] },
      },
      {
        name: "liteeditor_pty_create",
        description: "Spawn a new terminal pane in LiteEditor. Returns the session ID.",
        input_schema: {
          type: "object",
          properties: {
            cwd: { type: "string", description: "Working directory (absolute or relative to project root)" },
            shell: { type: "string", description: "Shell executable (defaults to system shell)" },
          },
          required: [],
        },
      },
      {
        name: "liteeditor_pty_read",
        description: "Read the current output buffer of a PTY session",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "PTY session ID" },
          },
          required: ["session_id"],
        },
      },
      {
        name: "liteeditor_pty_write",
        description: "Write data to a PTY session (sends keystrokes)",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "PTY session ID" },
            data: { type: "string", description: "Data to write" },
          },
          required: ["session_id", "data"],
        },
      },
      {
        name: "liteeditor_pty_kill",
        description: "Kill a PTY terminal session",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "PTY session ID" },
          },
          required: ["session_id"],
        },
      },
      {
        name: "liteeditor_browser_list",
        description: "List all active browser panel sessions",
        input_schema: { type: "object", properties: {}, required: [] },
      },
      {
        name: "liteeditor_browser_create",
        description: "Open a new browser pane in LiteEditor",
        input_schema: {
          type: "object",
          properties: {
            url: { type: "string", description: "URL to navigate to (defaults to about:blank)" },
          },
          required: [],
        },
      },
      {
        name: "liteeditor_browser_navigate",
        description: "Navigate a browser pane to a URL",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "Browser session ID" },
            url: { type: "string", description: "URL to navigate to" },
          },
          required: ["session_id", "url"],
        },
      },
      {
        name: "liteeditor_browser_read_page",
        description: "Read the visible content and interactive elements of a browser page",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "Browser session ID" },
          },
          required: ["session_id"],
        },
      },
      {
        name: "liteeditor_browser_screenshot",
        description: "Capture a screenshot of the browser pane as base64 PNG",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "Browser session ID" },
          },
          required: ["session_id"],
        },
      },
      {
        name: "liteeditor_browser_click",
        description: "Click an interactive element by its index (from read_page)",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "Browser session ID" },
            index: { type: "number", description: "Element index from read_page" },
          },
          required: ["session_id", "index"],
        },
      },
      {
        name: "liteeditor_browser_type",
        description: "Type text into an element",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "Browser session ID" },
            text: { type: "string", description: "Text to type" },
            index: { type: "number", description: "Optional element index to focus first" },
          },
          required: ["session_id", "text"],
        },
      },
      {
        name: "liteeditor_editor_open",
        description: "Open a file in LiteEditor's code editor",
        input_schema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Absolute path to the file" },
          },
          required: ["filePath"],
        },
      },
      {
        name: "liteeditor_session_list",
        description: "List all registered agent sessions",
        input_schema: { type: "object", properties: {}, required: [] },
      },
      {
        name: "liteeditor_session_register",
        description: "Register an agent session for tracking",
        input_schema: {
          type: "object",
          properties: {
            session_id: { type: "string", description: "PTY session ID" },
            cli_type: { type: "string", enum: ["claude", "codex", "shell", "unknown"] },
            label: { type: "string", description: "Human-friendly label" },
            agent_id: { type: "string", description: "Agent identifier" },
          },
          required: ["session_id"],
        },
      },
      {
        name: "liteeditor_session_resolve",
        description: "Find a session by agent_id, label, or cli_type",
        input_schema: {
          type: "object",
          properties: {
            agent_id: { type: "string" },
            label: { type: "string" },
            cli_type: { type: "string" },
            claude_session_id: { type: "string" },
          },
          required: [],
        },
      },
    ];
  }

  async handleToolCall(toolName: string, input: Record<string, unknown>): Promise<McpToolResult> {
    try {
      const result = await this.dispatch(toolName, input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${String(err)}` }],
        isError: true,
      };
    }
  }

  private escapeForJs(str: string): string {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  private async dispatch(toolName: string, input: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      // --- PTY ---

      case "liteeditor_pty_list": {
        return { sessions: this.ptyManager.listSessions() };
      }

      case "liteeditor_pty_create": {
        const shell = input.shell as string | undefined;
        const cwdRaw = input.cwd as string | undefined;
        const defaultCwd = os.homedir();
        const resolvedCwd = !cwdRaw
          ? defaultCwd
          : path.isAbsolute(cwdRaw)
            ? cwdRaw
            : path.resolve(defaultCwd, cwdRaw);

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
        );

        const pid = this.ptyManager.getSessionInfo(sessionId)?.pid;

        const win = this.getMainWindow();
        if (win) {
          const safe = this.escapeForJs(sessionId);
          win.webContents
            .executeJavaScript(`window.__createTerminalPane && window.__createTerminalPane('${safe}')`)
            .catch(() => {});
        }

        return { session_id: sessionId, pid };
      }

      case "liteeditor_pty_read": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        const output = this.ptyManager.readOutput(sessionId);
        if (output === null) throw new Error(`Session '${sessionId}' not found`);
        return { session_id: sessionId, output };
      }

      case "liteeditor_pty_write": {
        const sessionId = input.session_id as string | undefined;
        const data = input.data as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        if (data === undefined || data === null) throw new Error("Missing data");
        const output = this.ptyManager.readOutput(sessionId);
        if (output === null) throw new Error(`Session '${sessionId}' not found`);
        const success = this.ptyManager.write(sessionId, String(data));
        if (!success) throw new Error(`Write failed for session '${sessionId}'`);
        return { ok: true, bytes: String(data).length };
      }

      case "liteeditor_pty_kill": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        this.ptyManager.kill(sessionId);
        return { success: true };
      }

      // --- Browser ---

      case "liteeditor_browser_list": {
        return { sessions: this.browserManager.listSessions() };
      }

      case "liteeditor_browser_create": {
        const url = (input.url as string | undefined) || "about:blank";
        const win = this.getMainWindow();
        if (!win) throw new Error("No main window available");
        const sessionId = this.browserManager.createView(win, url);
        win.webContents
          .executeJavaScript(`window.__createBrowserPane && window.__createBrowserPane('${this.escapeForJs(sessionId)}')`)
          .catch(() => {});
        return { session_id: sessionId };
      }

      case "liteeditor_browser_navigate": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        let targetUrl = input.url as string;
        if (!targetUrl) throw new Error("Missing url");
        if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith("file://")) {
          targetUrl = "https://" + targetUrl;
        }
        const wc = this.browserManager.getWebContents(sessionId);
        if (!wc) throw new Error(`Browser session '${sessionId}' not found`);
        await wc.loadURL(targetUrl);
        return { success: true, url: wc.getURL() };
      }

      case "liteeditor_browser_read_page": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        const wc = this.browserManager.getWebContents(sessionId);
        if (!wc) throw new Error(`Browser session '${sessionId}' not found`);
        const result = await wc.executeJavaScript(DOM_INDEX_SCRIPT);
        return { success: true, ...result };
      }

      case "liteeditor_browser_screenshot": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        const wc = this.browserManager.getWebContents(sessionId);
        if (!wc) throw new Error(`Browser session '${sessionId}' not found`);
        const image = await wc.capturePage();
        const dataUrl = "data:image/png;base64," + image.toPNG().toString("base64");
        return { success: true, dataUrl };
      }

      case "liteeditor_browser_click": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        const index = input.index as number;
        if (index === undefined || index === null) throw new Error("Missing index");
        const wc = this.browserManager.getWebContents(sessionId);
        if (!wc) throw new Error(`Browser session '${sessionId}' not found`);
        return await wc.executeJavaScript(getClickScript(index));
      }

      case "liteeditor_browser_type": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        const text = input.text as string;
        if (text === undefined || text === null) throw new Error("Missing text");
        const idx = input.index as number | undefined;
        const wc = this.browserManager.getWebContents(sessionId);
        if (!wc) throw new Error(`Browser session '${sessionId}' not found`);
        return await wc.executeJavaScript(getTypeScript(text, idx));
      }

      // --- Editor ---

      case "liteeditor_editor_open": {
        const filePath = input.filePath as string | undefined;
        if (!filePath) throw new Error("Missing filePath");
        const win = this.getMainWindow();
        if (win) {
          win.webContents
            .executeJavaScript(`window.__openEditorFile && window.__openEditorFile('${this.escapeForJs(filePath)}')`)
            .catch(() => {});
        }
        return { success: true };
      }

      // --- Session registry ---

      case "liteeditor_session_list": {
        return { sessions: this.sessionRegistry.list() };
      }

      case "liteeditor_session_register": {
        const sessionId = input.session_id as string | undefined;
        if (!sessionId) throw new Error("Missing session_id");
        const rawCliType = String(input.cli_type || "unknown");
        const ptyInfo = this.ptyManager.getSessionInfo(sessionId);
        const session = this.sessionRegistry.register(sessionId, {
          cliType: VALID_CLI_TYPES.has(rawCliType)
            ? (rawCliType as "claude" | "codex" | "shell" | "unknown")
            : "unknown",
          pid: ptyInfo?.pid ?? 0,
          cwd: ptyInfo?.cwd ?? "",
          shell: ptyInfo?.shell ?? "",
          label: input.label ? String(input.label) : undefined,
          agentId: input.agent_id ? String(input.agent_id) : undefined,
        });
        return { ok: true, session };
      }

      case "liteeditor_session_resolve": {
        const result = this.sessionRegistry.resolve({
          agentId: input.agent_id ? String(input.agent_id) : undefined,
          label: input.label ? String(input.label) : undefined,
          claudeSessionId: input.claude_session_id ? String(input.claude_session_id) : undefined,
          cliType: input.cli_type ? String(input.cli_type) : undefined,
        });
        return result;
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
