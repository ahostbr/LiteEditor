export interface LiteEditorHostConfig {
  projectId: string;
  projectName: string;
  projectRoot: string;
  workspaceId: string;
  workspaceName: string;
  threadId?: string;
}

let currentLiteEditorHostConfig: LiteEditorHostConfig | null = null;

export function getLiteEditorHostConfig(): LiteEditorHostConfig | null {
  return currentLiteEditorHostConfig;
}

export function setLiteEditorHostConfig(config: LiteEditorHostConfig | null): void {
  currentLiteEditorHostConfig = config;
}

export function isLiteEditorHostManaged(): boolean {
  return currentLiteEditorHostConfig !== null;
}
