// @ts-nocheck
import { contextBridge, ipcRenderer } from "electron";

// Persistent state for the VS Code API shim
let _state: Record<string, any> = {};

// The session ID is passed from the main process after creation
let _sessionId: string | null = null;
let _pendingMessages: any[] = [];

ipcRenderer.on("claude:set-session-id", (_e, id: string) => {
  _sessionId = id;
  // Flush any messages that were buffered before the session ID arrived
  for (const msg of _pendingMessages) {
    ipcRenderer.send("claude:webview-message", id, msg);
  }
  _pendingMessages = [];
});

// Expose acquireVsCodeApi shim
contextBridge.exposeInMainWorld("acquireVsCodeApi", () => ({
  postMessage: (msg: any) => {
    if (_sessionId) {
      ipcRenderer.send("claude:webview-message", _sessionId, msg);
    } else {
      // Buffer messages until session ID is set
      _pendingMessages.push(msg);
    }
  },
  getState: () => _state,
  setState: (newState: any) => {
    _state = { ..._state, ...newState };
    return _state;
  },
}));

// Host → Webview: dispatch messages from the extension host
ipcRenderer.on("claude:host-message", (_e, message: any) => {
  window.postMessage({ type: "from-extension", message }, "*");
});
