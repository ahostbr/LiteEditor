// @ts-nocheck
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

export interface Project {
  id: string;
  name: string;
  rootPath: string;
  lastActiveWorkspaceId: string;
  lastActivity: number;
  pinned: boolean;
  createdAt: number;
}

const LITEEDITOR_DIR = join(homedir(), ".liteeditor");
const PROJECTS_FILE = join(LITEEDITOR_DIR, "projects.json");

let projectIdCounter = 0;

function generateId(): string {
  return `proj-${Date.now()}-${++projectIdCounter}`;
}

export class ProjectService {
  private projects: Project[] = [];
  private loaded = false;

  async loadProjects(): Promise<Project[]> {
    try {
      const content = await readFile(PROJECTS_FILE, "utf-8");
      this.projects = JSON.parse(content);
      if (!Array.isArray(this.projects)) {
        this.projects = [];
      }
    } catch {
      this.projects = [];
    }
    this.loaded = true;
    return this.projects;
  }

  async saveProjects(): Promise<void> {
    try {
      await mkdir(LITEEDITOR_DIR, { recursive: true });
      await writeFile(PROJECTS_FILE, JSON.stringify(this.projects, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save projects:", e);
    }
  }

  async addProject(rootPath: string, name?: string): Promise<Project> {
    if (!this.loaded) await this.loadProjects();

    const existing = this.projects.find((p) => p.rootPath === rootPath);
    if (existing) return existing;

    const projectName = name || rootPath.replace(/^.*[\\/]/, "") || "Project";
    const project: Project = {
      id: generateId(),
      name: projectName,
      rootPath,
      lastActiveWorkspaceId: "",
      lastActivity: Date.now(),
      pinned: false,
      createdAt: Date.now(),
    };

    this.projects.push(project);
    await this.saveProjects();
    return project;
  }

  async removeProject(id: string): Promise<void> {
    if (!this.loaded) await this.loadProjects();
    this.projects = this.projects.filter((p) => p.id !== id);
    await this.saveProjects();
  }

  async updateProject(id: string, updates: Partial<Omit<Project, "id">>): Promise<Project | null> {
    if (!this.loaded) await this.loadProjects();
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;

    Object.assign(project, updates);
    await this.saveProjects();
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    if (!this.loaded) await this.loadProjects();
    return this.projects.find((p) => p.id === id) || null;
  }

  getProjectByPath(rootPath: string): Project | undefined {
    return this.projects.find((p) => p.rootPath === rootPath);
  }
}
