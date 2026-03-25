// @ts-nocheck
import { create } from "zustand";
import type { CanvasPaneType, CanvasPaneState } from "./canvas-store";

export interface TemplatePaneConfig {
  type: CanvasPaneType;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  panes: TemplatePaneConfig[];
  builtIn: boolean;
}

const BUILT_IN_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: "default",
    name: "Default",
    description: "Chat and Terminal side by side",
    builtIn: true,
    panes: [
      { type: "chat", x: 20, y: 20, width: 700, height: 700, title: "Chat" },
      { type: "terminal", x: 740, y: 20, width: 600, height: 400, title: "Terminal" },
    ],
  },
  {
    id: "development",
    name: "Development",
    description: "Chat, Editor, and Terminal",
    builtIn: true,
    panes: [
      { type: "chat", x: 20, y: 20, width: 500, height: 700, title: "Chat" },
      { type: "unified-editor", x: 540, y: 20, width: 600, height: 500, title: "Editor" },
      { type: "terminal", x: 540, y: 540, width: 600, height: 250, title: "Terminal" },
    ],
  },
  {
    id: "code-review",
    name: "Code Review",
    description: "Chat, Git, and Editor for reviewing changes",
    builtIn: true,
    panes: [
      { type: "chat", x: 20, y: 20, width: 500, height: 700, title: "Chat" },
      { type: "git", x: 540, y: 20, width: 400, height: 700, title: "Git" },
      { type: "unified-editor", x: 960, y: 20, width: 500, height: 700, title: "Editor" },
    ],
  },
  {
    id: "research",
    name: "Research",
    description: "Chat, Browser, and Files for exploring",
    builtIn: true,
    panes: [
      { type: "chat", x: 20, y: 20, width: 500, height: 700, title: "Chat" },
      { type: "browser", x: 540, y: 20, width: 600, height: 700, title: "Browser" },
      { type: "files", x: 1160, y: 20, width: 350, height: 700, title: "Files" },
    ],
  },
];

interface TemplateStoreState {
  templates: WorkspaceTemplate[];
  getTemplate: (id: string) => WorkspaceTemplate | undefined;
  getDefaultTemplate: () => WorkspaceTemplate;
}

export const useTemplateStore = create<TemplateStoreState>((set, get) => ({
  templates: BUILT_IN_TEMPLATES,

  getTemplate: (id: string) => {
    return get().templates.find((t) => t.id === id);
  },

  getDefaultTemplate: () => {
    return BUILT_IN_TEMPLATES[0];
  },
}));
