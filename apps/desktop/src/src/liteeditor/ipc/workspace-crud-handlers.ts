// @ts-nocheck
import { ipcMain } from "electron";
import { WorkspacePersistenceService } from "../services/workspace-persistence-service";

const workspacePersistence = new WorkspacePersistenceService();

export function registerWorkspaceCrudHandlers(): void {
  ipcMain.handle("workspaces:list", async (_e, projectId: string) => {
    return workspacePersistence.listWorkspaces(projectId);
  });

  ipcMain.handle("workspaces:load", async (_e, projectId: string, workspaceId: string) => {
    return workspacePersistence.loadWorkspace(projectId, workspaceId);
  });

  ipcMain.handle("workspaces:save", async (_e, projectId: string, workspace: string) => {
    return workspacePersistence.saveWorkspace(projectId, JSON.parse(workspace));
  });

  ipcMain.handle(
    "workspaces:create",
    async (
      _e,
      projectId: string,
      name: string,
      type?: string,
      branch?: string,
      worktreePath?: string,
    ) => {
      return workspacePersistence.createWorkspace(
        projectId,
        name,
        (type as "local" | "worktree") || "local",
        branch,
        worktreePath,
      );
    },
  );

  ipcMain.handle("workspaces:delete", async (_e, projectId: string, workspaceId: string) => {
    return workspacePersistence.deleteWorkspace(projectId, workspaceId);
  });

  ipcMain.handle(
    "workspaces:rename",
    async (_e, projectId: string, workspaceId: string, name: string) => {
      return workspacePersistence.renameWorkspace(projectId, workspaceId, name);
    },
  );
}

export { workspacePersistence };
