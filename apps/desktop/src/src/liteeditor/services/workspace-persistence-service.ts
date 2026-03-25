// @ts-nocheck
import { readFile, writeFile, mkdir, readdir, unlink } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

export interface PersistedWorkspace {
  id: string;
  name: string;
  projectId: string;
  type: "local" | "worktree";
  branch?: string;
  worktreePath?: string;
  canvas: unknown;
  lastActivity: number;
  createdAt: number;
}

const WORKSPACES_DIR = join(homedir(), ".liteeditor", "workspaces");

function projectDir(projectId: string): string {
  return join(WORKSPACES_DIR, projectId);
}

function workspaceFile(projectId: string, workspaceId: string): string {
  return join(projectDir(projectId), `${workspaceId}.json`);
}

export class WorkspacePersistenceService {
  async listWorkspaces(projectId: string): Promise<PersistedWorkspace[]> {
    const dir = projectDir(projectId);
    try {
      const files = await readdir(dir);
      const workspaces: PersistedWorkspace[] = [];
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          const content = await readFile(join(dir, file), "utf-8");
          workspaces.push(JSON.parse(content));
        } catch {
          // Skip corrupted files
        }
      }
      return workspaces;
    } catch {
      return [];
    }
  }

  async loadWorkspace(projectId: string, workspaceId: string): Promise<PersistedWorkspace | null> {
    try {
      const content = await readFile(workspaceFile(projectId, workspaceId), "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async saveWorkspace(projectId: string, workspace: PersistedWorkspace): Promise<void> {
    try {
      const dir = projectDir(projectId);
      await mkdir(dir, { recursive: true });
      await writeFile(
        workspaceFile(projectId, workspace.id),
        JSON.stringify(workspace, null, 2),
        "utf-8",
      );
    } catch (e) {
      console.error("Failed to save workspace:", e);
    }
  }

  async deleteWorkspace(projectId: string, workspaceId: string): Promise<void> {
    try {
      await unlink(workspaceFile(projectId, workspaceId));
    } catch {
      // File may not exist
    }
  }

  async createWorkspace(
    projectId: string,
    name: string,
    type: "local" | "worktree" = "local",
    branch?: string,
    worktreePath?: string,
  ): Promise<PersistedWorkspace> {
    const workspace: PersistedWorkspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      projectId,
      type,
      branch,
      worktreePath,
      canvas: null,
      lastActivity: Date.now(),
      createdAt: Date.now(),
    };
    await this.saveWorkspace(projectId, workspace);
    return workspace;
  }

  async renameWorkspace(
    projectId: string,
    workspaceId: string,
    name: string,
  ): Promise<PersistedWorkspace | null> {
    const workspace = await this.loadWorkspace(projectId, workspaceId);
    if (!workspace) return null;
    workspace.name = name;
    await this.saveWorkspace(projectId, workspace);
    return workspace;
  }
}
