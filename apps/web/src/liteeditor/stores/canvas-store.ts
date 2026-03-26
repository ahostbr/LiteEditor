// @ts-nocheck
import { create } from "zustand";
import { cleanupPaneSession } from "../lib/session-cleanup";

// Late-bound workspace ID provider to avoid circular import (workspace-store imports canvas-store)
let _getActiveWorkspaceId: () => string | null = () => null;
export function setWorkspaceIdProvider(fn: () => string | null): void {
  _getActiveWorkspaceId = fn;
}

export type CanvasPaneType =
  | "terminal"
  | "editor"
  | "browser"
  | "unified-editor"
  | "claude"
  | "codex"
  | "git"
  | "chat"
  | "files"
  | "search"
  | "settings";
export type PaneLayoutMode = "single" | "grid" | "splitter" | "window" | "tabs";

export interface CanvasPaneState {
  id: string;
  type: CanvasPaneType;
  x: number;
  y: number;
  width: number;
  height: number;
  layoutMode: PaneLayoutMode;
  title: string;
  // Terminal panes
  terminalSessionId?: string;
  terminalSessionIds?: string[];
  terminalTabNames?: string[];
  activeTerminalIndex?: number;
  // Editor panes
  filePath?: string;
  isDirty?: boolean;
  // Browser panes (single-session legacy)
  browserSessionId?: string;
  browserUrl?: string;
  // Browser shell (multi-tab)
  browserShellTabs?: Array<{ id: string; url: string; title: string; workspaceColor?: string }>;
  browserShellActiveTabIndex?: number;
  browserShellSidebarCollapsed?: boolean;
  // Claude panes
  claudeSessionId?: string;
  // Codex panes
  codexSessionId?: string;
  // Chat panes
  threadId?: string;
  // Notification state
  hasNotification?: boolean;
  notificationCount?: number;
  // Minimized state
  minimized?: boolean;
  // Workspace ownership
  workspaceId?: string;
  // Pane linking
  linkedPaneId?: string;
  // Cross-mode sync identity (shared with zen-store)
  syncId?: string;
}

// Serializable pane for persistence (no session IDs — those are ephemeral)
export interface PersistedPane {
  id: string;
  type: CanvasPaneType;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  terminalTabNames?: string[];
  terminalTabCount?: number;
  filePath?: string;
  browserUrl?: string;
  minimized?: boolean;
  // Browser shell multi-tab persistence (URLs + titles only, no session IDs)
  browserTabs?: Array<{ url: string; title: string; workspaceColor?: string }>;
  browserActiveTabIndex?: number;
  browserSidebarCollapsed?: boolean;
}

export interface PersistedCanvasState {
  panes: PersistedPane[];
  viewportX: number;
  viewportY: number;
  zoom: number;
}

export type CanvasLayoutMode = "freeform" | "columns";

// --- Column model (Niri-inspired paper WM) ---
export interface CanvasColumn {
  id: string;
  paneIds: string[]; // ordered top-to-bottom
  width: number; // fixed width for this column
}

let columnCounter = 0;
function nextColumnId(): string {
  return `col-${++columnCounter}`;
}

interface CanvasState {
  panes: Map<string, CanvasPaneState>;
  viewportX: number;
  viewportY: number;
  focusedPaneId: string | null;
  maximizedPaneId: string | null;
  zoom: number;
  layoutMode: CanvasLayoutMode;

  // Column model state (used when layoutMode === 'columns')
  columns: CanvasColumn[];
  activeColumnIdx: number;

  // Spring animation target (null = no animation)
  springTarget: { x: number; y: number } | null;

  // Pane queries
  hasPane: (type: CanvasPaneType) => boolean;

  // Pane CRUD
  addPane: (type: CanvasPaneType, options?: Partial<CanvasPaneState>) => string;
  removePane: (id: string) => void;
  movePane: (id: string, x: number, y: number) => void;
  resizePane: (id: string, width: number, height: number) => void;
  updatePane: (id: string, updates: Partial<CanvasPaneState>) => void;

  // Focus
  setFocusedPane: (id: string | null) => void;
  toggleMaximizePane: (id: string) => void;

  // Viewport
  scrollTo: (x: number, y: number) => void;
  scrollBy: (dx: number, dy: number) => void;

  // Canvas bounds (computed)
  getCanvasBounds: () => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };

  // Get ordered panes (left-to-right, top-to-bottom)
  getOrderedPanes: () => CanvasPaneState[];

  // Get pane by index
  getPaneByIndex: (index: number) => CanvasPaneState | undefined;

  // Find nearest pane in a direction from focused
  findNearestPane: (direction: "left" | "right" | "up" | "down") => string | null;

  // Column navigation (O(1) index arithmetic)
  navigateColumn: (direction: "left" | "right" | "up" | "down") => void;

  // Column operations
  deriveColumnPositions: () => void;
  getColumnForPane: (
    paneId: string,
  ) => { column: CanvasColumn; colIdx: number; paneIdx: number } | null;
  addPaneToColumn: (paneId: string, columnIdx: number, position?: number) => void;
  springToColumn: (columnIdx: number) => void;

  // Workspace-aware queries
  getVisiblePanes: (activeWorkspaceId: string | null) => CanvasPaneState[];
  getHiddenTerminalPanes: (activeWorkspaceId: string | null) => CanvasPaneState[];
  tagPanesWithWorkspace: (workspaceId: string) => void;

  // Pane linking
  linkPanes: (paneId: string, targetPaneId: string) => void;
  unlinkPane: (paneId: string) => void;
  openTerminalForEditor: (editorPaneId: string) => string | null;

  // Layout mode
  toggleLayoutMode: () => void;
  autoArrangeColumns: () => void;

  // Bulk operations
  setPanes: (panes: Map<string, CanvasPaneState>) => void;
  clearPanes: () => void;
  clearWorkspacePanes: (workspaceId: string, keepTerminals?: boolean) => void;
  setViewport: (x: number, y: number, zoom?: number) => void;

  // Persistence
  getCanvasState: () => PersistedCanvasState;
  restoreCanvasState: (state: PersistedCanvasState) => void;
}

// Default pane dimensions
const DEFAULT_PANE_WIDTH = 800;
const DEFAULT_PANE_HEIGHT = 600;
const PANE_GAP = 24;

let paneCounter = 0;

function nextPaneId(): string {
  return `canvas-pane-${++paneCounter}`;
}

// Column layout constants
const COLUMN_GAP = 24;
const COLUMN_MARGIN = 40;
const COLUMN_PANE_GAP = 16;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  panes: new Map(),
  viewportX: 0,
  viewportY: 0,
  focusedPaneId: null,
  maximizedPaneId: null,
  zoom: 1,
  layoutMode: "freeform" as CanvasLayoutMode,
  columns: [],
  activeColumnIdx: 0,
  springTarget: null,

  hasPane: (type) => {
    for (const pane of get().panes.values()) {
      if (pane.type === type) return true;
    }
    return false;
  },

  addPane: (type, options = {}) => {
    const state = get();

    // Singleton dedup for utility panes — focus existing instead of creating
    const SINGLETON_TYPES = new Set(["settings", "files", "search", "git"]);
    if (SINGLETON_TYPES.has(type)) {
      const existing = [...state.panes.values()].find(p => p.type === type);
      if (existing) {
        set({ focusedPaneId: existing.id });
        return existing.id;
      }
    }

    const id = options.id || nextPaneId();

    // Per-type default dimensions
    const defaultWidth = options.width ?? getDefaultWidth(type);
    const defaultHeight = options.height ?? getDefaultHeight(type);

    // Default placement depends on layout mode
    let x = options.x ?? 0;
    let y = options.y ?? 0;

    if (state.layoutMode === "columns" && options.x === undefined && options.y === undefined) {
      // Column mode: positions will be derived after column insertion
      x = 0;
      y = 0;
    } else if (options.x === undefined || options.y === undefined) {
      // Freeform: right of focused pane, or origin if no panes
      const focused = state.focusedPaneId ? state.panes.get(state.focusedPaneId) : null;
      if (focused) {
        x = focused.x + focused.width + PANE_GAP;
        y = focused.y;
      } else if (state.panes.size > 0) {
        let maxRight = -Infinity;
        let rightY = 0;
        for (const pane of state.panes.values()) {
          const right = pane.x + pane.width;
          if (right > maxRight) {
            maxRight = right;
            rightY = pane.y;
          }
        }
        x = maxRight + PANE_GAP;
        y = rightY;
      }
    }

    // Tag pane with active workspace so it persists with the right workspace
    const activeWorkspaceId = options.workspaceId ?? _getActiveWorkspaceId() ?? undefined;

    const newPane: CanvasPaneState = {
      id,
      type,
      x,
      y,
      width: defaultWidth,
      height: defaultHeight,
      layoutMode: options.layoutMode ?? "single",
      title: options.title ?? getDefaultTitle(type),
      terminalSessionId: options.terminalSessionId,
      filePath: options.filePath,
      isDirty: options.isDirty,
      browserSessionId: options.browserSessionId,
      browserUrl: options.browserUrl,
      claudeSessionId: options.claudeSessionId,
      codexSessionId: options.codexSessionId,
      threadId: options.threadId,
      hasNotification: false,
      notificationCount: 0,
      minimized: false,
      workspaceId: activeWorkspaceId,
      syncId: options.syncId || `sync-${id}`,
    };

    const newPanes = new Map(state.panes);
    newPanes.set(id, newPane);

    if (state.layoutMode === "columns" && options.x === undefined) {
      // Column mode placement: new column by default, smart stack if active column has 1 pane
      const columns = [...state.columns];
      const activeCol = columns[state.activeColumnIdx];

      if (activeCol && activeCol.paneIds.length === 1) {
        // Smart stack: add to current column
        activeCol.paneIds = [...activeCol.paneIds, id];
        const newActiveIdx = state.activeColumnIdx;
        set({ panes: newPanes, focusedPaneId: id, columns, activeColumnIdx: newActiveIdx });
      } else {
        // New column to the right of active
        const insertIdx = state.activeColumnIdx + (columns.length > 0 ? 1 : 0);
        const newCol: CanvasColumn = {
          id: nextColumnId(),
          paneIds: [id],
          width: defaultWidth,
        };
        columns.splice(insertIdx, 0, newCol);
        set({ panes: newPanes, focusedPaneId: id, columns, activeColumnIdx: insertIdx });
      }
      // Derive positions from column structure
      get().deriveColumnPositions();
      get().springToColumn(get().activeColumnIdx);
    } else {
      set({ panes: newPanes, focusedPaneId: id });
    }

    return id;
  },

  removePane: (id) => {
    const state = get();
    const pane = state.panes.get(id);

    // Clean up backend sessions before removing from state
    if (pane) cleanupPaneSession(pane);

    const newPanes = new Map(state.panes);
    newPanes.delete(id);
    let focusedPaneId = state.focusedPaneId;

    // Remove from column structure if in column mode
    if (state.layoutMode === "columns") {
      const columns = state.columns
        .map((col) => ({
          ...col,
          paneIds: col.paneIds.filter((pid) => pid !== id),
        }))
        .filter((col) => col.paneIds.length > 0); // Remove empty columns
      const activeColumnIdx = Math.min(state.activeColumnIdx, Math.max(0, columns.length - 1));
      set({ columns, activeColumnIdx });
    }

    if (focusedPaneId === id) {
      const remaining = Array.from(newPanes.values());
      focusedPaneId = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
    }
    set({ panes: newPanes, focusedPaneId });

    if (state.layoutMode === "columns") {
      get().deriveColumnPositions();
    }
  },

  movePane: (id, x, y) => {
    const state = get();
    const pane = state.panes.get(id);
    if (!pane) return;
    const newPanes = new Map(state.panes);
    newPanes.set(id, { ...pane, x, y });
    set({ panes: newPanes });
  },

  resizePane: (id, width, height) => {
    const state = get();
    const pane = state.panes.get(id);
    if (!pane) return;
    const newPanes = new Map(state.panes);
    newPanes.set(id, { ...pane, width: Math.max(200, width), height: Math.max(150, height) });
    set({ panes: newPanes });
  },

  updatePane: (id, updates) => {
    const state = get();
    const pane = state.panes.get(id);
    if (!pane) return;
    const newPanes = new Map(state.panes);
    newPanes.set(id, { ...pane, ...updates });
    set({ panes: newPanes });
  },

  setFocusedPane: (id) => set({ focusedPaneId: id }),
  toggleMaximizePane: (id) =>
    set((s) => ({ maximizedPaneId: s.maximizedPaneId === id ? null : id })),

  scrollTo: (x, y) => set({ viewportX: x, viewportY: y }),

  scrollBy: (dx, dy) =>
    set((s) => ({
      viewportX: s.viewportX + dx,
      viewportY: s.viewportY + dy,
    })),

  getCanvasBounds: () => {
    const panes = get().panes;
    if (panes.size === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const pane of panes.values()) {
      minX = Math.min(minX, pane.x);
      minY = Math.min(minY, pane.y);
      maxX = Math.max(maxX, pane.x + pane.width);
      maxY = Math.max(maxY, pane.y + pane.height);
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  },

  getOrderedPanes: () => {
    const panes = Array.from(get().panes.values());
    // Sort by Y first (row), then X (column)
    return panes.sort((a, b) => {
      const rowDiff = a.y - b.y;
      if (Math.abs(rowDiff) > 50) return rowDiff; // Different rows
      return a.x - b.x; // Same row, sort by x
    });
  },

  getPaneByIndex: (index) => {
    return get().getOrderedPanes()[index];
  },

  findNearestPane: (direction) => {
    const state = get();
    const focused = state.focusedPaneId ? state.panes.get(state.focusedPaneId) : null;
    if (!focused) return null;

    const focusCenterX = focused.x + focused.width / 2;
    const focusCenterY = focused.y + focused.height / 2;

    let best: CanvasPaneState | null = null;
    let bestDist = Infinity;

    for (const pane of state.panes.values()) {
      if (pane.id === focused.id) continue;

      const paneCenterX = pane.x + pane.width / 2;
      const paneCenterY = pane.y + pane.height / 2;
      const dx = paneCenterX - focusCenterX;
      const dy = paneCenterY - focusCenterY;

      let valid = false;
      switch (direction) {
        case "left":
          valid = dx < -50;
          break;
        case "right":
          valid = dx > 50;
          break;
        case "up":
          valid = dy < -50;
          break;
        case "down":
          valid = dy > 50;
          break;
      }

      if (!valid) continue;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = pane;
      }
    }

    return best?.id ?? null;
  },

  // --- Column navigation (O(1) index arithmetic) ---
  navigateColumn: (direction) => {
    const state = get();
    if (state.layoutMode !== "columns" || state.columns.length === 0) return;

    const col = state.columns[state.activeColumnIdx];
    if (!col) return;

    // Find current pane index within active column
    const focusedId = state.focusedPaneId;
    let paneIdx = focusedId ? col.paneIds.indexOf(focusedId) : 0;
    if (paneIdx < 0) paneIdx = 0;

    let newColIdx = state.activeColumnIdx;
    let newPaneIdx = paneIdx;

    switch (direction) {
      case "left":
        newColIdx = Math.max(0, state.activeColumnIdx - 1);
        newPaneIdx = Math.min(paneIdx, (state.columns[newColIdx]?.paneIds.length ?? 1) - 1);
        break;
      case "right":
        newColIdx = Math.min(state.columns.length - 1, state.activeColumnIdx + 1);
        newPaneIdx = Math.min(paneIdx, (state.columns[newColIdx]?.paneIds.length ?? 1) - 1);
        break;
      case "up":
        newPaneIdx = Math.max(0, paneIdx - 1);
        break;
      case "down":
        newPaneIdx = Math.min(col.paneIds.length - 1, paneIdx + 1);
        break;
    }

    const targetCol = state.columns[newColIdx];
    if (!targetCol) return;
    const targetPaneId = targetCol.paneIds[newPaneIdx];
    if (!targetPaneId) return;

    set({ activeColumnIdx: newColIdx, focusedPaneId: targetPaneId });

    if (newColIdx !== state.activeColumnIdx) {
      get().springToColumn(newColIdx);
    }
  },

  // --- Derive pane positions from column structure ---
  deriveColumnPositions: () => {
    const state = get();
    if (state.columns.length === 0) return;

    const newPanes = new Map(state.panes);
    let colX = COLUMN_MARGIN;

    for (const col of state.columns) {
      let paneY = COLUMN_MARGIN;
      for (const paneId of col.paneIds) {
        const pane = newPanes.get(paneId);
        if (!pane) continue;
        newPanes.set(paneId, { ...pane, x: colX, y: paneY, width: col.width });
        paneY += pane.height + COLUMN_PANE_GAP;
      }
      colX += col.width + COLUMN_GAP;
    }

    set({ panes: newPanes });
  },

  getColumnForPane: (paneId) => {
    const state = get();
    for (let colIdx = 0; colIdx < state.columns.length; colIdx++) {
      const col = state.columns[colIdx];
      const paneIdx = col.paneIds.indexOf(paneId);
      if (paneIdx >= 0) return { column: col, colIdx, paneIdx };
    }
    return null;
  },

  addPaneToColumn: (paneId, columnIdx, position) => {
    const state = get();
    const columns = state.columns.map((col, i) => {
      if (i !== columnIdx) return col;
      const paneIds = [...col.paneIds];
      const insertAt = position ?? paneIds.length;
      paneIds.splice(insertAt, 0, paneId);
      return { ...col, paneIds };
    });
    set({ columns });
    get().deriveColumnPositions();
  },

  springToColumn: (columnIdx) => {
    const state = get();
    const col = state.columns[columnIdx];
    if (!col) return;

    // Compute column X position (sum of preceding widths + gaps)
    let colX = COLUMN_MARGIN;
    for (let i = 0; i < columnIdx; i++) {
      colX += state.columns[i].width + COLUMN_GAP;
    }

    // Center the column in the viewport
    // viewportWidth approximation: use window.innerWidth minus sidebar/activitybar
    const viewportWidth = (typeof window !== "undefined" ? window.innerWidth : 1200) - 300;
    const targetX = colX - Math.max(0, (viewportWidth / state.zoom - col.width) / 2);

    set({ springTarget: { x: targetX, y: state.viewportY } });
  },

  linkPanes: (paneId, targetPaneId) => {
    const newPanes = new Map(get().panes);
    const pane = newPanes.get(paneId);
    if (pane) {
      newPanes.set(paneId, { ...pane, linkedPaneId: targetPaneId });
    }
    set({ panes: newPanes });
  },

  unlinkPane: (paneId) => {
    const newPanes = new Map(get().panes);
    const pane = newPanes.get(paneId);
    if (pane) {
      const { linkedPaneId: _, ...rest } = pane;
      newPanes.set(paneId, rest as CanvasPaneState);
    }
    // Also unlink any pane that links to this one
    for (const [id, p] of newPanes) {
      if (p.linkedPaneId === paneId) {
        const { linkedPaneId: _, ...rest } = p;
        newPanes.set(id, rest as CanvasPaneState);
      }
    }
    set({ panes: newPanes });
  },

  openTerminalForEditor: (editorPaneId) => {
    const editorPane = get().panes.get(editorPaneId);
    if (!editorPane || !editorPane.filePath) return null;

    // Get directory from file path
    const lastSep = Math.max(
      editorPane.filePath.lastIndexOf("/"),
      editorPane.filePath.lastIndexOf("\\"),
    );
    const dir = lastSep > 0 ? editorPane.filePath.substring(0, lastSep) : editorPane.filePath;

    // Create terminal pane to the right of the editor
    const termId = get().addPane("terminal", {
      x: editorPane.x + editorPane.width + PANE_GAP,
      y: editorPane.y,
      title: `Terminal (${editorPane.filePath.replace(/^.*[\\/]/, "")})`,
    });

    // Link the terminal to the editor
    get().linkPanes(termId, editorPaneId);

    return termId;
  },

  toggleLayoutMode: () => {
    const current = get().layoutMode;
    const next = current === "freeform" ? "columns" : "freeform";
    set({ layoutMode: next });
    if (next === "columns") {
      get().autoArrangeColumns();
    }
  },

  autoArrangeColumns: () => {
    const panes = Array.from(get().panes.values());
    if (panes.length === 0) return;

    // Sort by X position to determine column assignment
    const sorted = [...panes].sort((a, b) => a.x - b.x);

    // Group into columns by proximity (panes within 100px of each other are same column)
    const paneGroups: CanvasPaneState[][] = [];
    let currentGroup: CanvasPaneState[] = [];
    let lastX = -Infinity;

    for (const pane of sorted) {
      if (pane.x - lastX > 100 || currentGroup.length === 0) {
        if (currentGroup.length > 0) paneGroups.push(currentGroup);
        currentGroup = [pane];
      } else {
        currentGroup.push(pane);
      }
      lastX = pane.x;
    }
    if (currentGroup.length > 0) paneGroups.push(currentGroup);

    // Build column structure from groups
    const columns: CanvasColumn[] = paneGroups.map((group) => {
      group.sort((a, b) => a.y - b.y);
      const maxWidth = Math.max(...group.map((p) => p.width));
      return {
        id: nextColumnId(),
        paneIds: group.map((p) => p.id),
        width: maxWidth,
      };
    });

    // Find which column contains the focused pane
    const focusedId = get().focusedPaneId;
    let activeColIdx = 0;
    if (focusedId) {
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].paneIds.includes(focusedId)) {
          activeColIdx = i;
          break;
        }
      }
    }

    set({ columns, activeColumnIdx: activeColIdx });
    get().deriveColumnPositions();
  },

  getVisiblePanes: (activeWorkspaceId) => {
    const panes = Array.from(get().panes.values());
    if (!activeWorkspaceId) return panes;
    return panes.filter((p) => !p.workspaceId || p.workspaceId === activeWorkspaceId);
  },

  getHiddenTerminalPanes: (activeWorkspaceId) => {
    if (!activeWorkspaceId) return [];
    const panes = Array.from(get().panes.values());
    return panes.filter(
      (p) => p.type === "terminal" && p.workspaceId && p.workspaceId !== activeWorkspaceId,
    );
  },

  tagPanesWithWorkspace: (workspaceId) => {
    const newPanes = new Map<string, CanvasPaneState>();
    for (const [id, pane] of get().panes) {
      if (!pane.workspaceId) {
        newPanes.set(id, { ...pane, workspaceId });
      } else {
        newPanes.set(id, pane);
      }
    }
    set({ panes: newPanes });
  },

  setPanes: (panes) => set({ panes }),

  clearPanes: () => set({ panes: new Map(), focusedPaneId: null }),

  clearWorkspacePanes: (workspaceId, keepTerminals = false) => {
    const newPanes = new Map<string, CanvasPaneState>();
    for (const [id, pane] of get().panes) {
      // Keep panes from other workspaces
      if (pane.workspaceId !== workspaceId) {
        newPanes.set(id, pane);
        continue;
      }
      // Optionally keep terminal panes (for CSS-hidden persistence)
      if (keepTerminals && pane.type === "terminal") {
        newPanes.set(id, pane);
      }
    }
    set({ panes: newPanes, focusedPaneId: null });
  },

  setViewport: (x, y, zoom) => {
    const update: Partial<CanvasState> = { viewportX: x, viewportY: y };
    if (zoom !== undefined) update.zoom = zoom;
    set(update);
  },

  getCanvasState: () => {
    const state = get();
    const panes: PersistedPane[] = [];
    for (const pane of state.panes.values()) {
      panes.push({
        id: pane.id,
        type: pane.type,
        x: pane.x,
        y: pane.y,
        width: pane.width,
        height: pane.height,
        title: pane.title,
        terminalTabNames: pane.terminalTabNames,
        terminalTabCount:
          pane.terminalSessionIds?.length ?? (pane.terminalSessionId ? 1 : undefined),
        filePath: pane.filePath,
        browserUrl: pane.browserUrl,
        minimized: pane.minimized,
        browserTabs: pane.browserShellTabs?.map(({ url, title, workspaceColor }) => ({ url, title, workspaceColor })),
        browserActiveTabIndex: pane.browserShellActiveTabIndex,
        browserSidebarCollapsed: pane.browserShellSidebarCollapsed,
      });
    }
    return {
      panes,
      viewportX: state.viewportX,
      viewportY: state.viewportY,
      zoom: state.zoom,
    };
  },

  restoreCanvasState: (saved) => {
    const newPanes = new Map<string, CanvasPaneState>();
    let maxCounter = 0;
    for (const p of saved.panes) {
      const match = p.id.match(/canvas-pane-(\d+)/);
      if (match) maxCounter = Math.max(maxCounter, parseInt(match[1]));

      newPanes.set(p.id, {
        id: p.id,
        type: p.type,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        layoutMode: "single",
        title: p.title,
        filePath: p.filePath,
        browserUrl: p.browserUrl,
        threadId: p.threadId,
        minimized: p.minimized,
        terminalTabNames: p.terminalTabNames,
        hasNotification: false,
        notificationCount: 0,
        browserShellTabs: p.browserTabs?.map((t) => ({ id: `tab-restored-${Math.random().toString(36).slice(2)}`, url: t.url, title: t.title, workspaceColor: t.workspaceColor })),
        browserShellActiveTabIndex: p.browserActiveTabIndex,
        browserShellSidebarCollapsed: p.browserSidebarCollapsed,
      });
    }
    paneCounter = maxCounter;
    set({
      panes: newPanes,
      viewportX: saved.viewportX,
      viewportY: saved.viewportY,
      zoom: saved.zoom,
      focusedPaneId: saved.panes.length > 0 ? saved.panes[0].id : null,
    });
  },
}));

function getDefaultWidth(type: CanvasPaneType): number {
  switch (type) {
    case "codex":
      return 1100;
    case "claude":
      return 900;
    case "browser":
      return 1000;
    case "git":
      return 900;
    case "chat":
      return 700;
    case "files":
      return 350;
    case "search":
      return 400;
    case "settings":
      return 500;
    default:
      return DEFAULT_PANE_WIDTH;
  }
}

function getDefaultHeight(type: CanvasPaneType): number {
  switch (type) {
    case "codex":
      return 700;
    case "claude":
      return 700;
    case "git":
      return 650;
    case "chat":
      return 700;
    case "files":
      return 600;
    case "search":
      return 500;
    case "settings":
      return 600;
    default:
      return DEFAULT_PANE_HEIGHT;
  }
}

function getDefaultTitle(type: CanvasPaneType): string {
  switch (type) {
    case "terminal":
      return "Terminal";
    case "editor":
      return "Editor";
    case "browser":
      return "Browser";
    case "unified-editor":
      return "Editor";
    case "claude":
      return "Claude Code";
    case "codex":
      return "Codex";
    case "git":
      return "Git";
    case "chat":
      return "Chat";
    case "files":
      return "Files";
    case "search":
      return "Search";
    case "settings":
      return "Settings";
  }
}
