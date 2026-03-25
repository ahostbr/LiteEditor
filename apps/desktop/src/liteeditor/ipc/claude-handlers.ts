// @ts-nocheck
import { ipcMain, BrowserWindow } from "electron";
import { ClaudeManager } from "../services/claude-manager";
import { ClaudeBridge } from "../services/claude-bridge";
import { ptyManager } from "./pty-handlers";
import { type NativeViewBounds } from "../services/native-view-bounds";

const claudeManager = new ClaudeManager();
let activeMainWindow: BrowserWindow | null = null;

interface PendingHostOp {
  resolve: (payload: Record<string, unknown>) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

const pendingHostOps = new Map<string, PendingHostOp>();
let handlersRegistered = false;

async function invokeRendererHostOp(
  op: string,
  payload: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  if (!activeMainWindow || activeMainWindow.isDestroyed()) return {};

  const requestId = `claude-host-op-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingHostOps.delete(requestId);
      reject(new Error(`Timed out waiting for renderer op '${op}'`));
    }, 15000);

    pendingHostOps.set(requestId, { resolve, reject, timer });
    activeMainWindow?.webContents.send("claude:host-op", {
      id: requestId,
      op,
      payload,
    });
  });
}

const claudeBridge = new ClaudeBridge(claudeManager, {
  ptyManager,
  invokeRendererOp: invokeRendererHostOp,
});

export { claudeManager };

export function registerClaudeHandlers(mainWindow: BrowserWindow): void {
  activeMainWindow = mainWindow;
  if (handlersRegistered) {
    return;
  }
  handlersRegistered = true;

  // Lifecycle: create Claude WebContentsView
  ipcMain.handle("claude:create-session", async () => {
    const owner = activeMainWindow;
    if (!owner || owner.isDestroyed()) {
      throw new Error("Main window unavailable");
    }
    return claudeManager.createSession(owner);
  });

  // Lifecycle: destroy session
  ipcMain.on("claude:destroy-session", (_e, sessionId: string) => {
    claudeBridge.shutdownSession(sessionId);
    claudeManager.destroySession(sessionId);
  });

  // Lifecycle: set view bounds (from renderer rAF loop)
  ipcMain.on("claude:set-bounds", (_e, sessionId: string, bounds: NativeViewBounds) => {
    claudeManager.setBounds(sessionId, bounds);
  });

  // Lifecycle: show/hide view (tab visibility)
  ipcMain.on("claude:show-view", (_e, sessionId: string) => {
    claudeManager.showView(sessionId);
    claudeBridge.notifyVisibilityChanged(sessionId, true);
  });

  ipcMain.on("claude:hide-view", (_e, sessionId: string) => {
    claudeManager.hideView(sessionId);
    claudeBridge.notifyVisibilityChanged(sessionId, false);
  });

  // Message bridge: webview -> host -> claude.exe
  ipcMain.on("claude:webview-message", (_e, sessionId: string, message: any) => {
    claudeBridge.handleWebviewMessage(sessionId, message);
  });

  ipcMain.on("claude:host-op-result", (_e, result: any) => {
    const requestId = typeof result?.id === "string" ? result.id : null;
    if (!requestId) return;

    const pending = pendingHostOps.get(requestId);
    if (!pending) return;

    clearTimeout(pending.timer);
    pendingHostOps.delete(requestId);

    if (result?.ok) {
      const payload =
        result?.payload && typeof result.payload === "object"
          ? (result.payload as Record<string, unknown>)
          : {};
      pending.resolve(payload);
      return;
    }

    const errorText = typeof result?.error === "string" ? result.error : "Renderer host op failed";
    pending.reject(new Error(errorText));
  });
}

export function shutdownClaudeHandlers(): void {
  pendingHostOps.forEach((pending, requestId) => {
    clearTimeout(pending.timer);
    pending.reject(new Error(`Cancelled renderer op '${requestId}' during shutdown`));
  });
  pendingHostOps.clear();
  activeMainWindow = null;

  claudeBridge.shutdown();
  claudeManager.removeAll();
}
