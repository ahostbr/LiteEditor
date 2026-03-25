import { type ThreadId } from "@t3tools/contracts";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import LiteEditorApp from "../liteeditor/App";
import "../liteeditor/app.css";
import { setLiteEditorHostConfig } from "../liteeditor/hostMode";
import { useCanvasStore } from "../liteeditor/stores/canvas-store";
import { useEditorStore } from "../liteeditor/stores/editor-store";
import { useProjectStore } from "../liteeditor/stores/project-store";
import { useUiStore } from "../liteeditor/stores/ui-store";
import { useWorkspaceStore } from "../liteeditor/stores/workspace-store";
import { useComposerDraftStore } from "../composerDraftStore";
import { useStore } from "../store";

interface LiteEditorThreadWorkspaceProps {
  threadId: ThreadId;
}

export default function LiteEditorThreadWorkspace(props: LiteEditorThreadWorkspaceProps) {
  const thread = useStore((store) => store.threads.find((entry) => entry.id === props.threadId));
  const draftThread = useComposerDraftStore(
    (store) => store.draftThreadsByThreadId[props.threadId] ?? null,
  );
  const project = useStore((store) =>
    store.projects.find((entry) => entry.id === (thread?.projectId ?? draftThread?.projectId)),
  );

  const hostConfig = useMemo(() => {
    if (!project?.cwd) {
      return null;
    }

    return {
      projectId: `t3-${project.id}`,
      projectName: project.name,
      projectRoot: project.cwd,
      workspaceId: `t3-${project.id}-default`,
      workspaceName: "Thread Workspace",
      threadId: props.threadId,
    };
  }, [project?.cwd, project?.id, project?.name, props.threadId]);

  useLayoutEffect(() => {
    setLiteEditorHostConfig(hostConfig);

    if (!hostConfig) {
      return () => {
        setLiteEditorHostConfig(null);
      };
    }

    const timestamp = Date.now();
    useProjectStore.setState({
      activeProjectId: hostConfig.projectId,
      loaded: true,
      projects: [
        {
          id: hostConfig.projectId,
          name: hostConfig.projectName,
          rootPath: hostConfig.projectRoot,
          lastActiveWorkspaceId: hostConfig.workspaceId,
          lastActivity: timestamp,
          pinned: true,
          createdAt: timestamp,
          gitBranch: null,
          agentStatus: "idle",
          agentStatusText: "",
          prStatus: null,
          listeningPorts: [],
          notificationCount: 0,
        },
      ],
    });
    useWorkspaceStore.setState({
      activeProjectId: hostConfig.projectId,
      activeWorkspaceId: hostConfig.workspaceId,
      workspaces: [
        {
          id: hostConfig.workspaceId,
          name: hostConfig.workspaceName,
          projectId: hostConfig.projectId,
          type: "local",
          canvas: null,
          lastActivity: timestamp,
          createdAt: timestamp,
        },
      ],
    });

    const uiState = useUiStore.getState();
    useUiStore.setState({
      activeSidebarPanel:
        uiState.activeSidebarPanel === "projects" ? "files" : uiState.activeSidebarPanel,
      sidebarVisible: true,
    });
    useEditorStore.getState().setProjectRoot(hostConfig.projectRoot);
    void window.api?.git?.init(hostConfig.projectRoot).catch(() => {});
    void window.api?.search?.setRoot(hostConfig.projectRoot).catch(() => {});

    return () => {
      setLiteEditorHostConfig(null);
    };
  }, [hostConfig]);

  // Track the previous threadId so we can save canvas state on thread switch
  const prevThreadIdRef = useRef<string | null>(null);

  // Restore or create default canvas layout for the active thread
  useEffect(() => {
    if (!hostConfig) return;

    const workspaceStore = useWorkspaceStore.getState();
    const canvas = useCanvasStore.getState();

    // Save canvas state for the previous thread before switching
    if (prevThreadIdRef.current && prevThreadIdRef.current !== props.threadId) {
      workspaceStore.saveThreadCanvas(prevThreadIdRef.current);
    }
    prevThreadIdRef.current = props.threadId;

    // Try to restore saved canvas state for this thread
    const savedState = workspaceStore.loadThreadCanvas(props.threadId);
    if (savedState) {
      canvas.restoreCanvasState(savedState);
    } else {
      // No saved state — create default layout: Chat + Terminal
      canvas.clearPanes();
      canvas.addPane("chat", {
        title: "Chat",
        x: 20,
        y: 20,
        threadId: props.threadId,
      });
      canvas.addPane("terminal", {
        title: "Terminal",
        x: 740,
        y: 20,
      });
    }

    // Save canvas state on unmount
    return () => {
      useWorkspaceStore.getState().saveThreadCanvas(props.threadId);
    };
  }, [hostConfig, props.threadId]);

  if (!window.api) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium">
              Workspace is only available in desktop mode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hostConfig) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium">
              This thread does not have a project workspace yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Open the workspace from a thread that is attached to a project or worktree.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <LiteEditorApp />
    </div>
  );
}
