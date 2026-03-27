/**
 * Pane Sync Middleware
 *
 * Bidirectional sync between canvas-store and zen-store.
 * When a pane is added/removed in either store, the change
 * propagates to the other store immediately.
 *
 * Uses syncId to match panes across stores and a re-entrancy
 * guard to prevent infinite loops.
 */

import { useCanvasStore, type CanvasPaneType } from "../stores/canvas-store";
import { useZenStore, type ZenPanelType } from "../stores/zen-store";
import { useUiStore } from "../stores/ui-store";

const PANE_GAP = 24;
const DEFAULT_X = 40;
const DEFAULT_Y = 40;

let syncDepth = 0;

/** Find auto-cascade position for a new canvas pane */
function getAutoCascadePosition(): { x: number; y: number } {
  const panes = useCanvasStore.getState().panes;
  if (panes.size === 0) return { x: DEFAULT_X, y: DEFAULT_Y };

  let maxRight = -Infinity;
  let rightY = 0;
  for (const pane of panes.values()) {
    const right = pane.x + pane.width;
    if (right > maxRight) {
      maxRight = right;
      rightY = pane.y;
    }
  }
  return { x: maxRight + PANE_GAP, y: rightY };
}

/** Check if a syncId already exists in the zen store */
function zenHasSyncId(syncId: string): boolean {
  return useZenStore.getState().panels.some((p) => p.syncId === syncId);
}

/** Check if a syncId already exists in the canvas store */
function canvasHasSyncId(syncId: string): boolean {
  for (const pane of useCanvasStore.getState().panes.values()) {
    if (pane.syncId === syncId) return true;
  }
  return false;
}

/** Propagate a canvas pane addition to zen store */
function syncCanvasAddToZen(pane: {
  type: CanvasPaneType;
  syncId?: string;
  terminalSessionId?: string;
  browserSessionId?: string;
  browserUrl?: string;
  claudeSessionId?: string;
  codexSessionId?: string;
  threadId?: string;
  filePath?: string;
}): void {
  if (!pane.syncId || zenHasSyncId(pane.syncId)) return;

  const zen = useZenStore.getState();
  const syncId = pane.syncId;

  switch (pane.type) {
    case "terminal":
      zen.addTerminalPanel(undefined, undefined, syncId, pane.terminalSessionId);
      break;
    case "browser":
      zen.addBrowserPanel(pane.browserUrl, syncId, pane.browserSessionId);
      break;
    case "claude":
      zen.addClaudePanel(syncId);
      // Copy session ID after panel is created
      if (pane.claudeSessionId) {
        const panels = useZenStore.getState().panels;
        const zenPanel = panels.find((p) => p.syncId === syncId);
        if (zenPanel) {
          useZenStore.setState({
            panels: panels.map((p) =>
              p.id === zenPanel.id ? { ...p, claudeSessionId: pane.claudeSessionId } : p,
            ),
          });
        }
      }
      break;
    case "codex":
      zen.addCodexPanel(syncId);
      if (pane.codexSessionId) {
        const panels = useZenStore.getState().panels;
        const zenPanel = panels.find((p) => p.syncId === syncId);
        if (zenPanel) {
          useZenStore.setState({
            panels: panels.map((p) =>
              p.id === zenPanel.id ? { ...p, codexSessionId: pane.codexSessionId } : p,
            ),
          });
        }
      }
      break;
    case "chat":
      zen.addChatPanel(pane.threadId, syncId);
      break;
    case "files":
      zen.addFilesPanel(syncId);
      break;
    case "search":
      zen.addSearchPanel(syncId);
      break;
    case "settings":
      zen.addSettingsPanel(syncId);
      break;
    case "git":
      zen.addGitPanel(syncId);
      break;
    case "unified-editor":
      zen.addUnifiedEditorPanel(syncId);
      break;
    case "editor":
      // Editor panels need filePath — skip if none (sync not meaningful)
      break;
  }
}

/** Propagate a zen panel addition to canvas store */
function syncZenAddToCanvas(panel: {
  type: ZenPanelType;
  syncId?: string;
  terminalSessionId?: string;
  browserSessionId?: string;
  browserUrl?: string;
  claudeSessionId?: string;
  codexSessionId?: string;
  threadId?: string;
}): void {
  if (!panel.syncId || canvasHasSyncId(panel.syncId)) return;

  const pos = getAutoCascadePosition();
  useCanvasStore.getState().addPane(panel.type as CanvasPaneType, {
    x: pos.x,
    y: pos.y,
    syncId: panel.syncId,
    terminalSessionId: panel.terminalSessionId,
    browserSessionId: panel.browserSessionId,
    browserUrl: panel.browserUrl,
    claudeSessionId: panel.claudeSessionId,
    codexSessionId: panel.codexSessionId,
    threadId: panel.threadId,
  });
}

/** Propagate a canvas pane removal to zen store */
function syncCanvasRemoveToZen(syncId: string): void {
  const panels = useZenStore.getState().panels;
  const zenPanel = panels.find((p) => p.syncId === syncId);
  if (zenPanel) {
    useZenStore.getState().removePanel(zenPanel.id);
  }
}

/** Propagate a zen panel removal to canvas store */
function syncZenRemoveToCanvas(syncId: string): void {
  for (const [id, pane] of useCanvasStore.getState().panes) {
    if (pane.syncId === syncId) {
      useCanvasStore.getState().removePane(id);
      break;
    }
  }
}

/** Collect all syncIds from a Map of canvas panes */
function canvasSyncIds(panes: Map<string, { syncId?: string }>): Set<string> {
  const ids = new Set<string>();
  for (const pane of panes.values()) {
    if (pane.syncId) ids.add(pane.syncId);
  }
  return ids;
}

/** Collect all syncIds from a list of zen panels */
function zenSyncIds(panels: Array<{ syncId?: string }>): Set<string> {
  const ids = new Set<string>();
  for (const p of panels) {
    if (p.syncId) ids.add(p.syncId);
  }
  return ids;
}

/**
 * Initialize bidirectional pane sync.
 * Call once on app mount after stores are ready.
 */
export function initPaneSync(): () => void {
  // Subscribe to canvas-store changes
  const unsubCanvas = useCanvasStore.subscribe((state, prev) => {
    if (syncDepth > 0) return;
    // Skip entirely if panes reference is unchanged (e.g. viewport scroll / zoom only)
    if (state.panes === prev.panes) return;
    syncDepth++;
    try {
      const prevIds = canvasSyncIds(prev.panes);
      const currIds = canvasSyncIds(state.panes);

      // Detect additions
      for (const [, pane] of state.panes) {
        if (pane.syncId && !prevIds.has(pane.syncId)) {
          syncCanvasAddToZen(pane);
        }
      }

      // Detect removals
      for (const [, pane] of prev.panes) {
        if (pane.syncId && !currIds.has(pane.syncId)) {
          syncCanvasRemoveToZen(pane.syncId);
        }
      }

      // Sync session ID updates (e.g., terminal/claude session assigned after creation)
      // Build a syncId → zen panel index once for O(1) lookups below.
      let zenPanelsBySyncId: Map<string, any> | null = null;
      const getZenIndex = () => {
        if (!zenPanelsBySyncId) {
          zenPanelsBySyncId = new Map();
          for (const panel of useZenStore.getState().panels) {
            if (panel.syncId) zenPanelsBySyncId.set(panel.syncId, panel);
          }
        }
        return zenPanelsBySyncId;
      };

      for (const [id, pane] of state.panes) {
        if (!pane.syncId) continue;
        const prevPane = prev.panes.get(id);
        if (!prevPane) continue;

        const sessionChanged =
          pane.terminalSessionId !== prevPane.terminalSessionId ||
          pane.browserSessionId !== prevPane.browserSessionId ||
          pane.claudeSessionId !== prevPane.claudeSessionId ||
          pane.codexSessionId !== prevPane.codexSessionId;

        if (sessionChanged) {
          const zenPanels = useZenStore.getState().panels;
          const zenPanel = getZenIndex().get(pane.syncId);
          if (zenPanel) {
            // Rebuild index after mutation so subsequent iterations stay accurate
            zenPanelsBySyncId = null;
            useZenStore.setState({
              panels: zenPanels.map((p) =>
                p.id === zenPanel.id
                  ? {
                      ...p,
                      terminalSessionId: pane.terminalSessionId ?? p.terminalSessionId,
                      browserSessionId: pane.browserSessionId ?? p.browserSessionId,
                      claudeSessionId: pane.claudeSessionId ?? p.claudeSessionId,
                      codexSessionId: pane.codexSessionId ?? p.codexSessionId,
                    }
                  : p,
              ),
            });
          }
        }

        // Sync title renames (canvas → zen)
        if (pane.title !== prevPane.title) {
          const zenPanel = getZenIndex().get(pane.syncId);
          if (zenPanel && zenPanel.title !== pane.title) {
            zenPanelsBySyncId = null; // invalidate after mutation
            useZenStore.getState().renamePanel(zenPanel.id, pane.title);
          }
        }
      }
    } finally {
      syncDepth--;
    }
  });

  // Subscribe to zen-store changes
  const unsubZen = useZenStore.subscribe((state, prev) => {
    if (syncDepth > 0) return;
    // Skip entirely if panels reference is unchanged (e.g. active tab index or other zen-only state)
    if (state.panels === prev.panels) return;
    syncDepth++;
    try {
      const prevIds = zenSyncIds(prev.panels);
      const currIds = zenSyncIds(state.panels);

      // Detect additions
      for (const panel of state.panels) {
        if (panel.syncId && !prevIds.has(panel.syncId)) {
          syncZenAddToCanvas(panel);
        }
      }

      // Detect removals
      for (const panel of prev.panels) {
        if (panel.syncId && !currIds.has(panel.syncId)) {
          syncZenRemoveToCanvas(panel.syncId);
        }
      }

      // Build a syncId → [canvasPaneId, canvasPane] index once for O(1) lookups below.
      let canvasPanesBySyncId: Map<string, [string, any]> | null = null;
      const getCanvasIndex = () => {
        if (!canvasPanesBySyncId) {
          canvasPanesBySyncId = new Map();
          for (const [id, pane] of useCanvasStore.getState().panes) {
            if (pane.syncId) canvasPanesBySyncId.set(pane.syncId, [id, pane]);
          }
        }
        return canvasPanesBySyncId;
      };

      // Build a prev-panel id→panel index for O(1) lookups during session sync.
      const prevPanelsById = new Map(prev.panels.map((p) => [p.id, p]));

      // Sync session ID updates (zen → canvas)
      for (const panel of state.panels) {
        if (!panel.syncId) continue;
        const prevPanel = prevPanelsById.get(panel.id);
        if (!prevPanel) continue;

        const sessionChanged =
          panel.terminalSessionId !== prevPanel.terminalSessionId ||
          panel.browserSessionId !== prevPanel.browserSessionId ||
          panel.claudeSessionId !== prevPanel.claudeSessionId ||
          panel.codexSessionId !== prevPanel.codexSessionId;

        if (sessionChanged) {
          const entry = getCanvasIndex().get(panel.syncId);
          if (entry) {
            const [id, pane] = entry;
            canvasPanesBySyncId = null; // invalidate after mutation
            useCanvasStore.getState().updatePane(id, {
              terminalSessionId: panel.terminalSessionId ?? pane.terminalSessionId,
              browserSessionId: panel.browserSessionId ?? pane.browserSessionId,
              claudeSessionId: panel.claudeSessionId ?? pane.claudeSessionId,
              codexSessionId: panel.codexSessionId ?? pane.codexSessionId,
            });
          }
        }

        // Sync title renames (zen → canvas)
        if (panel.title !== prevPanel.title) {
          const entry = getCanvasIndex().get(panel.syncId);
          if (entry) {
            const [id, pane] = entry;
            if (pane.title !== panel.title) {
              canvasPanesBySyncId = null; // invalidate after mutation
              useCanvasStore.getState().updatePane(id, { title: panel.title });
            }
          }
        }
      }
    } finally {
      syncDepth--;
    }
  });

  return () => {
    unsubCanvas();
    unsubZen();
  };
}

/**
 * Unified helper: add a pane to the current mode.
 * Sync middleware handles cross-mode propagation.
 */
export function addPaneToCurrentMode(
  type: CanvasPaneType,
  options?: Record<string, unknown>,
): void {
  const appMode = useUiStore.getState().appMode;

  if (appMode === "zen") {
    const zen = useZenStore.getState();
    const typeMap: Record<string, (() => void) | undefined> = {
      chat: () => zen.addChatPanel(options?.threadId as string | undefined),
      terminal: () => zen.addTerminalPanel(),
      files: () => zen.addFilesPanel(),
      search: () => zen.addSearchPanel(),
      settings: () => zen.addSettingsPanel(),
      git: () => zen.addGitPanel(),
      browser: () => zen.addBrowserPanel(options?.browserUrl as string | undefined),
      claude: () => zen.addClaudePanel(),
      codex: () => zen.addCodexPanel(),
      "unified-editor": () => zen.addUnifiedEditorPanel(),
    };
    typeMap[type]?.();
  } else {
    useCanvasStore.getState().addPane(type, options as any);
  }
}

/**
 * Sync existing panes when switching modes.
 * Populates the target mode from the source if the target is empty.
 */
export function syncOnModeSwitch(targetMode: "canvas" | "zen"): void {
  syncDepth++;
  try {
    if (targetMode === "zen") {
      // Populate zen from canvas
      const zenPanels = useZenStore.getState().panels;
      const zenIds = zenSyncIds(zenPanels);

      for (const [, pane] of useCanvasStore.getState().panes) {
        if (pane.syncId && !zenIds.has(pane.syncId)) {
          syncCanvasAddToZen(pane);
        }
      }
    } else {
      // Populate canvas from zen
      const canvasIds = canvasSyncIds(useCanvasStore.getState().panes);

      for (const panel of useZenStore.getState().panels) {
        if (panel.syncId && !canvasIds.has(panel.syncId)) {
          syncZenAddToCanvas(panel);
        }
      }
    }
  } finally {
    syncDepth--;
  }
}
