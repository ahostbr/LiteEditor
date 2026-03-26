// @ts-nocheck
import * as FS from "node:fs";
import * as Path from "node:path";

import { app, BrowserWindow, dialog, ipcMain, nativeImage, screen, shell } from "electron";
import type { Rectangle } from "electron";
import { registerBrowserHandlers, shutdownBrowserHandlers } from "./ipc/browser-handlers";
import { registerClaudeHandlers, shutdownClaudeHandlers } from "./ipc/claude-handlers";
import { registerCodexHandlers, shutdownCodexHandlers } from "./ipc/codex-handlers";
import { registerFsHandlers, shutdownFsHandlers } from "./ipc/fs-handlers";
import { registerGitHandlers } from "./ipc/git-handlers";
import { registerGitHubHandlers } from "./ipc/github-handlers";
import {
  registerIntegrationsHandlers,
  shutdownIntegrationsHandlers,
} from "./ipc/integrations-handlers";
import { registerProjectHandlers } from "./ipc/project-handlers";
import { registerPtyHandlers, shutdownPtyHandlers } from "./ipc/pty-handlers";
import { registerScriptHandlers, shutdownScriptHandlers } from "./ipc/script-handlers";
import { registerSearchHandlers } from "./ipc/search-handlers";
import { registerWorkspaceCrudHandlers } from "./ipc/workspace-crud-handlers";
import { registerWorkspaceHandlers } from "./ipc/workspace-handlers";

interface LiteEditorDesktopRegistrationOptions {
  appDescription: string;
  appDisplayName: string;
  commitHash: string | null;
  iconPath: string | null;
}

interface WindowSpanState {
  restoreBounds: Rectangle | null;
  spanned: boolean;
}

const DIALOG_OPEN_FOLDER_CHANNEL = "dialog:open-folder";
const DIALOG_OPEN_FILE_CHANNEL = "dialog:open-file";
const DIALOG_SAVE_FILE_CHANNEL = "dialog:save-file";
const DIALOG_SHOW_MESSAGE_BOX_CHANNEL = "dialog:show-message-box";
const SHELL_OPEN_EXTERNAL_CHANNEL = "shell:open-external";
const SHELL_OPEN_PATH_CHANNEL = "shell:open-path";
const WINDOW_MINIMIZE_CHANNEL = "window:minimize";
const WINDOW_MAXIMIZE_CHANNEL = "window:maximize";
const WINDOW_CLOSE_CHANNEL = "window:close";
const WINDOW_QUIT_CHANNEL = "window:quit";
const WINDOW_IS_MAXIMIZED_CHANNEL = "window:is-maximized";
const WINDOW_MAXIMIZE_CHANGE_CHANNEL = "window:maximize-change";
const WINDOW_SPAN_ALL_MONITORS_CHANNEL = "window:span-all-monitors";
const WINDOW_RESTORE_SPAN_CHANNEL = "window:restore-span";
const WINDOW_IS_SPANNED_CHANNEL = "window:is-spanned";
const WINDOW_DISPLAY_COUNT_CHANNEL = "window:display-count";
const WINDOW_SPAN_CHANGE_CHANNEL = "window:span-change";
const ABOUT_GET_INFO_CHANNEL = "about:get-info";
const ABOUT_GET_ICON_CHANNEL = "about:get-icon";

let globalHandlersRegistered = false;
let bridgeHandlersRegistered = false;
let activeMainWindow: BrowserWindow | null = null;
const spanStateByWindow = new WeakMap<BrowserWindow, WindowSpanState>();
const observedWindows = new WeakSet<BrowserWindow>();

function getWindowSpanState(window: BrowserWindow): WindowSpanState {
  const existing = spanStateByWindow.get(window);
  if (existing) {
    return existing;
  }

  const state: WindowSpanState = {
    restoreBounds: null,
    spanned: false,
  };
  spanStateByWindow.set(window, state);
  return state;
}

function getOwnerWindow(): BrowserWindow | null {
  const focused = BrowserWindow.getFocusedWindow();
  if (focused && !focused.isDestroyed()) {
    return focused;
  }

  if (activeMainWindow && !activeMainWindow.isDestroyed()) {
    return activeMainWindow;
  }

  return BrowserWindow.getAllWindows().find((window) => !window.isDestroyed()) ?? null;
}

function attachWindowObservers(window: BrowserWindow): void {
  if (observedWindows.has(window)) {
    return;
  }
  observedWindows.add(window);

  window.on("maximize", () => {
    window.webContents.send(WINDOW_MAXIMIZE_CHANGE_CHANNEL, true);
  });
  window.on("unmaximize", () => {
    window.webContents.send(WINDOW_MAXIMIZE_CHANGE_CHANNEL, false);
  });
  window.on("closed", () => {
    const state = spanStateByWindow.get(window);
    if (state) {
      state.restoreBounds = null;
      state.spanned = false;
    }
    if (activeMainWindow === window) {
      activeMainWindow = null;
    }
  });
}

function registerBridgeHandlers(options: LiteEditorDesktopRegistrationOptions): void {
  if (bridgeHandlersRegistered) {
    return;
  }
  bridgeHandlersRegistered = true;

  ipcMain.removeHandler(DIALOG_OPEN_FOLDER_CHANNEL);
  ipcMain.handle(DIALOG_OPEN_FOLDER_CHANNEL, async () => {
    const owner = getOwnerWindow();
    const result = owner
      ? await dialog.showOpenDialog(owner, {
          properties: ["openDirectory", "createDirectory"],
        })
      : await dialog.showOpenDialog({
          properties: ["openDirectory", "createDirectory"],
        });
    return result.canceled ? null : (result.filePaths[0] ?? null);
  });

  ipcMain.removeHandler(DIALOG_OPEN_FILE_CHANNEL);
  ipcMain.handle(
    DIALOG_OPEN_FILE_CHANNEL,
    async (
      _event,
      filters?: Array<{
        name?: string;
        extensions?: string[];
      }>,
    ) => {
      const owner = getOwnerWindow();
      const normalizedFilters = Array.isArray(filters)
        ? filters
            .filter((filter) => Array.isArray(filter?.extensions))
            .map((filter) => ({
              name:
                typeof filter?.name === "string" && filter.name.length > 0 ? filter.name : "Files",
              extensions: (filter?.extensions ?? []).filter((value) => typeof value === "string"),
            }))
            .filter((filter) => filter.extensions.length > 0)
        : undefined;
      const result = owner
        ? await dialog.showOpenDialog(owner, {
            properties: ["openFile"],
            ...(normalizedFilters ? { filters: normalizedFilters } : {}),
          })
        : await dialog.showOpenDialog({
            properties: ["openFile"],
            ...(normalizedFilters ? { filters: normalizedFilters } : {}),
          });
      return result.canceled ? null : (result.filePaths[0] ?? null);
    },
  );

  ipcMain.removeHandler(DIALOG_SAVE_FILE_CHANNEL);
  ipcMain.handle(DIALOG_SAVE_FILE_CHANNEL, async (_event, defaultName?: string) => {
    const owner = getOwnerWindow();
    const result = owner
      ? await dialog.showSaveDialog(owner, {
          ...(typeof defaultName === "string" && defaultName.length > 0
            ? { defaultPath: defaultName }
            : {}),
        })
      : await dialog.showSaveDialog({
          ...(typeof defaultName === "string" && defaultName.length > 0
            ? { defaultPath: defaultName }
            : {}),
        });
    return result.canceled ? null : (result.filePath ?? null);
  });

  ipcMain.removeHandler(DIALOG_SHOW_MESSAGE_BOX_CHANNEL);
  ipcMain.handle(
    DIALOG_SHOW_MESSAGE_BOX_CHANNEL,
    async (
      _event,
      rawOptions: {
        type?: string;
        title?: string;
        message: string;
        detail?: string;
        buttons?: string[];
        defaultId?: number;
        cancelId?: number;
      },
    ) => {
      const owner = getOwnerWindow();
      const type =
        rawOptions?.type === "none" ||
        rawOptions?.type === "info" ||
        rawOptions?.type === "error" ||
        rawOptions?.type === "question" ||
        rawOptions?.type === "warning"
          ? rawOptions.type
          : "info";
      const optionsForDialog = {
        type,
        title: rawOptions?.title ?? options.appDisplayName,
        message: rawOptions?.message ?? "",
        detail: rawOptions?.detail,
        buttons:
          Array.isArray(rawOptions?.buttons) && rawOptions.buttons.length > 0
            ? rawOptions.buttons
            : ["OK"],
        defaultId: rawOptions?.defaultId,
        cancelId: rawOptions?.cancelId,
      } as const;
      const result = owner
        ? await dialog.showMessageBox(owner, optionsForDialog)
        : await dialog.showMessageBox(optionsForDialog);
      return result.response;
    },
  );

  ipcMain.on(SHELL_OPEN_EXTERNAL_CHANNEL, (_event, rawUrl: unknown) => {
    if (typeof rawUrl === "string" && rawUrl.length > 0) {
      try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          void shell.openExternal(parsed.toString());
        }
      } catch {
        // Reject malformed URLs silently
      }
    }
  });

  ipcMain.on(SHELL_OPEN_PATH_CHANNEL, (_event, rawPath: unknown) => {
    if (typeof rawPath === "string" && rawPath.length > 0) {
      void shell.openPath(rawPath);
    }
  });

  ipcMain.on(WINDOW_MINIMIZE_CHANNEL, () => {
    getOwnerWindow()?.minimize();
  });

  ipcMain.on(WINDOW_MAXIMIZE_CHANNEL, () => {
    const owner = getOwnerWindow();
    if (!owner) {
      return;
    }
    if (owner.isMaximized()) {
      owner.unmaximize();
      return;
    }
    owner.maximize();
  });

  ipcMain.on(WINDOW_CLOSE_CHANNEL, () => {
    getOwnerWindow()?.close();
  });

  ipcMain.on(WINDOW_QUIT_CHANNEL, () => {
    app.quit();
  });

  ipcMain.removeHandler(WINDOW_IS_MAXIMIZED_CHANNEL);
  ipcMain.handle(WINDOW_IS_MAXIMIZED_CHANNEL, async () => {
    return getOwnerWindow()?.isMaximized() ?? false;
  });

  ipcMain.on(WINDOW_SPAN_ALL_MONITORS_CHANNEL, () => {
    const owner = getOwnerWindow();
    if (!owner) {
      return;
    }
    const state = getWindowSpanState(owner);
    if (!state.spanned) {
      state.restoreBounds = owner.getBounds();
    }
    const displays = screen.getAllDisplays();
    if (displays.length === 0) {
      return;
    }
    const union = displays.reduce(
      (accumulator, display) => ({
        x: Math.min(accumulator.x, display.bounds.x),
        y: Math.min(accumulator.y, display.bounds.y),
        width:
          Math.max(accumulator.x + accumulator.width, display.bounds.x + display.bounds.width) -
          Math.min(accumulator.x, display.bounds.x),
        height:
          Math.max(accumulator.y + accumulator.height, display.bounds.y + display.bounds.height) -
          Math.min(accumulator.y, display.bounds.y),
      }),
      { ...displays[0]!.bounds },
    );
    state.spanned = true;
    owner.setBounds(union);
    owner.webContents.send(WINDOW_SPAN_CHANGE_CHANNEL, true);
  });

  ipcMain.on(WINDOW_RESTORE_SPAN_CHANNEL, () => {
    const owner = getOwnerWindow();
    if (!owner) {
      return;
    }
    const state = getWindowSpanState(owner);
    if (state.restoreBounds) {
      owner.setBounds(state.restoreBounds);
    }
    state.restoreBounds = null;
    state.spanned = false;
    owner.webContents.send(WINDOW_SPAN_CHANGE_CHANNEL, false);
  });

  ipcMain.removeHandler(WINDOW_IS_SPANNED_CHANNEL);
  ipcMain.handle(WINDOW_IS_SPANNED_CHANNEL, async () => {
    const owner = getOwnerWindow();
    return owner ? getWindowSpanState(owner).spanned : false;
  });

  ipcMain.removeHandler(WINDOW_DISPLAY_COUNT_CHANNEL);
  ipcMain.handle(WINDOW_DISPLAY_COUNT_CHANNEL, async () => {
    return screen.getAllDisplays().length;
  });

  ipcMain.removeHandler(ABOUT_GET_INFO_CHANNEL);
  ipcMain.handle(ABOUT_GET_INFO_CHANNEL, async () => {
    return {
      appName: options.appDisplayName,
      appDescription: options.appDescription,
      version: app.getVersion(),
      commitHash: options.commitHash ?? undefined,
      buildDate: process.env.BUILD_DATE ?? undefined,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform,
      links: [
        {
          label: "LiteEditor",
          url: "https://github.com/t3tools/t3code",
        },
      ],
    };
  });

  ipcMain.removeHandler(ABOUT_GET_ICON_CHANNEL);
  ipcMain.handle(ABOUT_GET_ICON_CHANNEL, async () => {
    if (!options.iconPath || !FS.existsSync(options.iconPath)) {
      return null;
    }
    const image = nativeImage.createFromPath(options.iconPath);
    if (image.isEmpty()) {
      return null;
    }
    return `data:image/png;base64,${image.toPNG().toString("base64")}`;
  });
}

export function registerLiteEditorDesktop(
  mainWindow: BrowserWindow,
  options: LiteEditorDesktopRegistrationOptions,
): void {
  activeMainWindow = mainWindow;
  attachWindowObservers(mainWindow);
  registerBridgeHandlers(options);

  if (!globalHandlersRegistered) {
    registerFsHandlers();
    registerPtyHandlers();
    registerSearchHandlers();
    registerGitHandlers();
    registerProjectHandlers();
    registerWorkspaceHandlers();
    registerWorkspaceCrudHandlers();
    registerGitHubHandlers();
    registerScriptHandlers();
    globalHandlersRegistered = true;
  }

  registerBrowserHandlers(mainWindow);
  registerClaudeHandlers(mainWindow);
  registerCodexHandlers(mainWindow);
  registerIntegrationsHandlers(mainWindow);
}

export function shutdownLiteEditorDesktop(): void {
  shutdownIntegrationsHandlers();
  shutdownClaudeHandlers();
  shutdownCodexHandlers();
  shutdownBrowserHandlers();
  shutdownScriptHandlers();
  shutdownPtyHandlers();
  shutdownFsHandlers();
}
