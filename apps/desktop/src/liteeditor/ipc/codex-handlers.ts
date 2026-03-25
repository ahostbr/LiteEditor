// @ts-nocheck
import { ipcMain, BrowserWindow } from "electron";
import { CodexManager } from "../services/codex-manager";
import { CodexBridge } from "../services/codex-bridge";
import { type NativeViewBounds } from "../services/native-view-bounds";

const codexManager = new CodexManager();
const codexBridge = new CodexBridge(codexManager);
let activeMainWindow: BrowserWindow | null = null;
let handlersRegistered = false;

export function registerCodexHandlers(mainWindow: BrowserWindow): void {
  activeMainWindow = mainWindow;
  if (handlersRegistered) {
    return;
  }
  handlersRegistered = true;

  // Lifecycle: create Codex WebContentsView
  ipcMain.handle("codex:create-session", async () => {
    const owner = activeMainWindow;
    if (!owner || owner.isDestroyed()) {
      throw new Error("Main window unavailable");
    }
    return codexManager.createSession(owner);
  });

  // Lifecycle: destroy session
  ipcMain.on("codex:destroy-session", (_e, sessionId: string) => {
    codexBridge.removeSession(sessionId);
    codexManager.destroySession(sessionId);
  });

  // Lifecycle: set view bounds (from renderer rAF loop)
  ipcMain.on("codex:set-bounds", (_e, sessionId: string, bounds: NativeViewBounds) => {
    codexManager.setBounds(sessionId, bounds);
  });

  // Lifecycle: show/hide view (tab visibility)
  ipcMain.on("codex:show-view", (_e, sessionId: string) => {
    codexManager.showView(sessionId);
  });

  ipcMain.on("codex:hide-view", (_e, sessionId: string) => {
    codexManager.hideView(sessionId);
  });

  // Workspace context sync from renderer (project root)
  ipcMain.on("codex:set-project-root", (_e, projectRoot: string | null) => {
    codexBridge.setProjectRoot(typeof projectRoot === "string" ? projectRoot : null);
  });

  // Message bridge: webview -> host
  ipcMain.on("codex:webview-message", (_e, sessionId: string, message: any) => {
    codexBridge.handleWebviewMessage(sessionId, message);
  });
}

export function shutdownCodexHandlers(): void {
  codexBridge.shutdown();
  codexManager.removeAll();
}
