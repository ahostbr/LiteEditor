/**
 * Type declarations for the Electron preload bridge (window.api).
 *
 * Source of truth: apps/desktop/src/liteeditor/preloadApi.ts
 * These types mirror the api object exposed via contextBridge.exposeInMainWorld.
 */
type NativeViewBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportWidth?: number;
  viewportHeight?: number;
};

type PtySessionInfo = {
  id: string;
  pid: number;
  shell: string;
  cwd: string;
  createdAt: number;
};

type IntegrationId = "codex" | "claude";

type IntegrationState =
  | "not_installed"
  | "installed_managed"
  | "installed_external"
  | "update_available"
  | "broken"
  | "verifying"
  | "downloading"
  | "installing"
  | "failed";

type IntegrationStatus = {
  id: IntegrationId;
  state: IntegrationState;
  installedVersion: string | null;
  latestVersion: string | null;
  source: "managed" | "external" | null;
  verified: boolean;
  lastVerifiedAt: number | null;
  message?: string;
};

type IntegrationProgress = {
  id: IntegrationId;
  stage:
    | "checking"
    | "downloading"
    | "verifying"
    | "extracting"
    | "installing"
    | "finalizing"
    | "done"
    | "error";
  percent?: number;
  message?: string;
};

type BrowserStateUpdate = {
  sessionId: string;
  url?: string;
  title?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  isLoading?: boolean;
};

type HostOpRequest = {
  id: string;
  op: string;
  payload?: Record<string, unknown>;
};

type HostOpResult = {
  id: string;
  ok: boolean;
  payload?: Record<string, unknown>;
  error?: string;
};

type MessageBoxOptions = {
  type?: string;
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
};

interface PreloadApi {
  appInfo: {
    version: string;
    commitHash: string;
    buildDate: string;
    electronVersion: string;
    nodeVersion: string;
    platform: string;
    homeDir: string;
  };

  fs: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    ensureDir(path: string): Promise<void>;
    deleteFile(path: string): Promise<void>;
    readTree(root: string, depth?: number): Promise<unknown[]>;
    readDir(dirPath: string): Promise<unknown[]>;
    watchStart(path: string): void;
    watchStop(): void;
    watchDir(path: string): void;
    unwatchDir(path: string): void;
    onFileChange(callback: (event: string, path: string) => void): () => void;
    showInExplorer(path: string): void;
  };

  git: {
    init(root: string): Promise<void>;
    status(): Promise<unknown[]>;
    diff(path: string): Promise<string>;
    diffCached(path: string): Promise<string>;
    stage(path: string): Promise<void>;
    stageAll(): Promise<void>;
    unstage(path: string): Promise<void>;
    unstageAll(): Promise<void>;
    commit(summary: string, description?: string): Promise<void>;
    push(): Promise<unknown>;
    pull(): Promise<void>;
    fetch(): Promise<void>;
    log(limit?: number): Promise<unknown[]>;
    branches(): Promise<unknown[]>;
    currentBranch(): Promise<unknown>;
    currentBranchForPath(rootPath: string): Promise<unknown>;
    checkout(name: string): Promise<void>;
    createBranch(name: string): Promise<void>;
    deleteBranch(name: string, force?: boolean): Promise<void>;
    getFileAtRevision(path: string, rev: string): Promise<string>;
    discardChanges(path: string): Promise<void>;
    showCommit(hash: string): Promise<string>;
    diffCommitFile(hash: string, path: string): Promise<string>;
    statusPorcelain(): Promise<string>;
    worktreeList(): Promise<unknown[]>;
    worktreeAdd(path: string, branch: string, createBranch: boolean): Promise<void>;
    worktreeRemove(path: string): Promise<void>;
    branchList(): Promise<unknown[]>;
    statusPorcelainForPath(rootPath: string): Promise<string>;
  };

  pty: {
    create(shell?: string, cwd?: string): Promise<string>;
    getSessionInfo(sessionId: string): Promise<PtySessionInfo | null>;
    write(sessionId: string, data: string): void;
    resize(sessionId: string, cols: number, rows: number): void;
    kill(sessionId: string): void;
    onData(sessionId: string, callback: (data: string) => void): () => void;
    onExit(sessionId: string, callback: (exitCode: number) => void): () => void;
  };

  search: {
    setRoot(root: string): Promise<void>;
    searchFiles(query: string, options: unknown): Promise<unknown[]>;
  };

  browser: {
    createView(initialUrl: string): Promise<string>;
    destroyView(sessionId: string): void;
    setBounds(sessionId: string, bounds: NativeViewBounds): void;
    showView(sessionId: string): void;
    hideView(sessionId: string): void;
    onStateUpdate(
      callback: (event: unknown, data: BrowserStateUpdate) => void,
    ): () => void;
    navigate(sessionId: string, url: string): Promise<unknown>;
    goBack(sessionId: string): Promise<unknown>;
    goForward(sessionId: string): Promise<unknown>;
    reload(sessionId: string): Promise<unknown>;
    stop(sessionId: string): Promise<unknown>;
    readPage(sessionId: string): Promise<unknown>;
    screenshot(sessionId: string): Promise<unknown>;
    click(sessionId: string, index: number): Promise<unknown>;
    type(sessionId: string, text: string, index?: number): Promise<unknown>;
    scroll(sessionId: string, direction: string, amount: number): Promise<unknown>;
    selectOption(sessionId: string, elementIndex: number, optionIndex: number): Promise<unknown>;
    executeJs(sessionId: string, code: string): Promise<unknown>;
    consoleLogs(sessionId: string, since?: number): Promise<unknown>;
    listSessions(): Promise<string[]>;
  };

  claude: {
    createSession(): Promise<string>;
    destroySession(sessionId: string): void;
    setBounds(sessionId: string, bounds: NativeViewBounds): void;
    showView(sessionId: string): void;
    hideView(sessionId: string): void;
    onHostOp(callback: (request: HostOpRequest) => void): () => void;
    sendHostOpResult(result: HostOpResult): void;
  };

  codex: {
    createSession(): Promise<string>;
    destroySession(sessionId: string): void;
    setProjectRoot(projectRoot: string | null): void;
    setBounds(sessionId: string, bounds: NativeViewBounds): void;
    showView(sessionId: string): void;
    hideView(sessionId: string): void;
  };

  about: {
    getInfo(): Promise<unknown>;
    getIcon(): Promise<unknown>;
  };

  scripts: {
    detect(rootPath: string): Promise<unknown[]>;
    start(projectId: string, scriptName: string, cwd: string): Promise<string>;
    stop(sessionId: string): Promise<void>;
    running(): Promise<unknown[]>;
  };

  shell: {
    openExternal(url: string): void;
    openPath(path: string): void;
  };

  window: {
    minimize(): void;
    maximize(): void;
    close(): void;
    quit(): void;
    isMaximized(): Promise<boolean>;
    onMaximizeChange(callback: (maximized: boolean) => void): () => void;
    zoomIn(): number;
    zoomOut(): number;
    zoomReset(): number;
    getZoomLevel(): number;
    setZoomLevel(level: number): void;
    spanAllMonitors(): void;
    restoreSpan(): void;
    isSpanned(): Promise<boolean>;
    getDisplayCount(): Promise<number>;
    onSpanChange(callback: (spanned: boolean) => void): () => void;
  };

  settings: {
    load(): Promise<unknown>;
    save(data: string): Promise<void>;
  };

  integrations: {
    listStatus(): Promise<IntegrationStatus[]>;
    checkUpdates(integrationId?: IntegrationId): Promise<IntegrationStatus[]>;
    install(
      integrationId: IntegrationId,
      options?: { reinstall?: boolean },
    ): Promise<IntegrationStatus>;
    update(integrationId: IntegrationId): Promise<IntegrationStatus>;
    verify(integrationId: IntegrationId): Promise<IntegrationStatus>;
    revealPath(integrationId: IntegrationId): Promise<string | null>;
    revealLog(integrationId: IntegrationId): Promise<string | null>;
    onProgress(callback: (progress: IntegrationProgress) => void): () => void;
  };

  github: {
    checkCli(): Promise<unknown>;
    installCli(): Promise<unknown>;
    setCwd(cwd: string): Promise<void>;
    repoInfo(): Promise<unknown>;
    prList(state?: string): Promise<unknown[]>;
    prGet(number: number): Promise<unknown>;
    prDiff(number: number): Promise<string>;
    prCreate(
      title: string,
      body: string,
      base: string,
      head: string,
      reviewers?: string[],
      labels?: string[],
    ): Promise<unknown>;
    prMerge(number: number, method: string, deleteBranch?: boolean): Promise<string>;
    prClose(number: number): Promise<string>;
    prReviews(number: number): Promise<unknown[]>;
    prReviewComments(number: number): Promise<unknown[]>;
    prReviewSubmit(
      number: number,
      event: string,
      body: string,
      comments?: unknown[],
    ): Promise<string>;
    issueList(state?: string): Promise<unknown[]>;
    issueGet(number: number): Promise<unknown>;
    issueCreate(
      title: string,
      body: string,
      labels?: string[],
      assignees?: string[],
    ): Promise<unknown>;
    issueComment(number: number, body: string): Promise<string>;
    issueClose(number: number): Promise<string>;
    issueReopen(number: number): Promise<string>;
    issueComments(number: number): Promise<unknown[]>;
    labelsList(): Promise<unknown[]>;
    collaboratorsList(): Promise<string[]>;
    prTemplate(): Promise<string | null>;
  };

  project: {
    list(): Promise<unknown[]>;
    add(rootPath: string, name?: string): Promise<unknown>;
    remove(id: string): Promise<void>;
    update(id: string, updates: Record<string, unknown>): Promise<unknown>;
    get(id: string): Promise<unknown>;
    detectScripts(rootPath: string): Promise<unknown[]>;
  };

  workspaces: {
    list(projectId: string): Promise<unknown[]>;
    load(projectId: string, workspaceId: string): Promise<unknown>;
    save(projectId: string, workspace: string): Promise<void>;
    create(
      projectId: string,
      name: string,
      type?: string,
      branch?: string,
      worktreePath?: string,
    ): Promise<unknown>;
    delete(projectId: string, workspaceId: string): Promise<void>;
    rename(projectId: string, workspaceId: string, name: string): Promise<unknown>;
  };

  workspace: {
    load(): Promise<unknown>;
    save(data: string): Promise<void>;
    loadState(projectRoot: string): Promise<unknown>;
    saveState(projectRoot: string, state: string): Promise<void>;
    loadSettings(projectRoot: string): Promise<unknown>;
    saveSettings(projectRoot: string, data: string): Promise<void>;
  };

  dialog: {
    openFolder(): Promise<string | null>;
    openFile(filters?: Array<{ name?: string; extensions?: string[] }>): Promise<string | null>;
    saveFile(defaultName?: string): Promise<string | null>;
    showMessageBox(options: MessageBoxOptions): Promise<number>;
  };

  onOpenFile(callback: (filePath: string) => void): () => void;
  onIpcHealthWarning(callback: (missingChannels: string[]) => void): () => void;
}

interface Window {
  api: PreloadApi;
}
