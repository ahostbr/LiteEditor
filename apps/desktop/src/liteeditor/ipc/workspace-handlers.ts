// @ts-nocheck
import { ipcMain } from "electron";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { WorkspaceService } from "../services/workspace-service";

const workspaceService = new WorkspaceService();

export function registerWorkspaceHandlers(): void {
  const settingsDir = join(homedir(), ".liteeditor");
  const workspaceFile = join(settingsDir, "workspace.json");
  const settingsFile = join(settingsDir, "settings.json");

  // Global workspace (unchanged — stores projectRoot + zoomLevel)
  ipcMain.handle("workspace:load", async () => {
    try {
      const content = await readFile(workspaceFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  });

  ipcMain.handle("workspace:save", async (_e, data: string) => {
    try {
      await mkdir(settingsDir, { recursive: true });
      await writeFile(workspaceFile, data, "utf-8");
    } catch {
      /* ignore */
    }
  });

  // Global settings
  ipcMain.handle("settings:load", async () => {
    try {
      const content = await readFile(settingsFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  });

  ipcMain.handle("settings:save", async (_e, data: string) => {
    try {
      await mkdir(settingsDir, { recursive: true });
      await writeFile(settingsFile, data, "utf-8");
    } catch {
      /* ignore */
    }
  });

  // Per-project workspace state
  ipcMain.handle("workspace:load-state", async (_e, projectRoot: string) => {
    return workspaceService.loadState(projectRoot);
  });

  ipcMain.handle("workspace:save-state", async (_e, projectRoot: string, state: string) => {
    return workspaceService.saveState(projectRoot, state);
  });

  // Per-project workspace settings
  ipcMain.handle("workspace:load-settings", async (_e, projectRoot: string) => {
    return workspaceService.loadSettings(projectRoot);
  });

  ipcMain.handle("workspace:save-settings", async (_e, projectRoot: string, data: string) => {
    return workspaceService.saveSettings(projectRoot, data);
  });
}
