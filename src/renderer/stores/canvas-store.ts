import { create } from 'zustand'

export type CanvasPaneType = 'terminal' | 'editor' | 'browser' | 'unified-editor' | 'claude' | 'codex' | 'git'
export type PaneLayoutMode = 'single' | 'grid' | 'splitter' | 'window' | 'tabs'

export interface CanvasPaneState {
  id: string
  type: CanvasPaneType
  x: number
  y: number
  width: number
  height: number
  layoutMode: PaneLayoutMode
  title: string
  // Terminal panes
  terminalSessionId?: string
  terminalSessionIds?: string[]
  terminalTabNames?: string[]
  activeTerminalIndex?: number
  // Editor panes
  filePath?: string
  isDirty?: boolean
  // Browser panes
  browserSessionId?: string
  browserUrl?: string
  // Claude panes
  claudeSessionId?: string
  // Codex panes
  codexSessionId?: string
  // Notification state
  hasNotification?: boolean
  notificationCount?: number
  // Minimized state
  minimized?: boolean
  // Workspace ownership
  workspaceId?: string
}

interface CanvasState {
  panes: Map<string, CanvasPaneState>
  viewportX: number
  viewportY: number
  focusedPaneId: string | null
  zoom: number

  // Pane CRUD
  addPane: (type: CanvasPaneType, options?: Partial<CanvasPaneState>) => string
  removePane: (id: string) => void
  movePane: (id: string, x: number, y: number) => void
  resizePane: (id: string, width: number, height: number) => void
  updatePane: (id: string, updates: Partial<CanvasPaneState>) => void

  // Focus
  setFocusedPane: (id: string | null) => void

  // Viewport
  scrollTo: (x: number, y: number) => void
  scrollBy: (dx: number, dy: number) => void

  // Canvas bounds (computed)
  getCanvasBounds: () => { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number }

  // Get ordered panes (left-to-right, top-to-bottom)
  getOrderedPanes: () => CanvasPaneState[]

  // Get pane by index
  getPaneByIndex: (index: number) => CanvasPaneState | undefined

  // Find nearest pane in a direction from focused
  findNearestPane: (direction: 'left' | 'right' | 'up' | 'down') => string | null

  // Workspace-aware queries
  getVisiblePanes: (activeWorkspaceId: string | null) => CanvasPaneState[]
  getHiddenTerminalPanes: (activeWorkspaceId: string | null) => CanvasPaneState[]
  tagPanesWithWorkspace: (workspaceId: string) => void

  // Bulk operations
  setPanes: (panes: Map<string, CanvasPaneState>) => void
  clearPanes: () => void
  clearWorkspacePanes: (workspaceId: string, keepTerminals?: boolean) => void
  setViewport: (x: number, y: number, zoom?: number) => void
}

// Default pane dimensions
const DEFAULT_PANE_WIDTH = 800
const DEFAULT_PANE_HEIGHT = 600
const PANE_GAP = 24

let paneCounter = 0

function nextPaneId(): string {
  return `canvas-pane-${++paneCounter}`
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  panes: new Map(),
  viewportX: 0,
  viewportY: 0,
  focusedPaneId: null,
  zoom: 1,

  addPane: (type, options = {}) => {
    const state = get()
    const id = options.id || nextPaneId()

    // Default placement: right of focused pane, or origin if no panes
    let x = options.x ?? 0
    let y = options.y ?? 0

    if (options.x === undefined || options.y === undefined) {
      const focused = state.focusedPaneId ? state.panes.get(state.focusedPaneId) : null
      if (focused) {
        x = focused.x + focused.width + PANE_GAP
        y = focused.y
      } else if (state.panes.size > 0) {
        // Place right of the rightmost pane
        let maxRight = -Infinity
        let rightY = 0
        for (const pane of state.panes.values()) {
          const right = pane.x + pane.width
          if (right > maxRight) {
            maxRight = right
            rightY = pane.y
          }
        }
        x = maxRight + PANE_GAP
        y = rightY
      }
    }

    // Per-type default dimensions
    const defaultWidth = options.width ?? getDefaultWidth(type)
    const defaultHeight = options.height ?? getDefaultHeight(type)

    const newPane: CanvasPaneState = {
      id,
      type,
      x,
      y,
      width: defaultWidth,
      height: defaultHeight,
      layoutMode: options.layoutMode ?? 'single',
      title: options.title ?? getDefaultTitle(type),
      terminalSessionId: options.terminalSessionId,
      filePath: options.filePath,
      isDirty: options.isDirty,
      browserSessionId: options.browserSessionId,
      browserUrl: options.browserUrl,
      claudeSessionId: options.claudeSessionId,
      codexSessionId: options.codexSessionId,
      hasNotification: false,
      notificationCount: 0,
      minimized: false
    }

    const newPanes = new Map(state.panes)
    newPanes.set(id, newPane)
    set({ panes: newPanes, focusedPaneId: id })
    return id
  },

  removePane: (id) => {
    const state = get()
    const newPanes = new Map(state.panes)
    newPanes.delete(id)
    let focusedPaneId = state.focusedPaneId
    if (focusedPaneId === id) {
      // Focus the last pane if available
      const remaining = Array.from(newPanes.values())
      focusedPaneId = remaining.length > 0 ? remaining[remaining.length - 1].id : null
    }
    set({ panes: newPanes, focusedPaneId })
  },

  movePane: (id, x, y) => {
    const state = get()
    const pane = state.panes.get(id)
    if (!pane) return
    const newPanes = new Map(state.panes)
    newPanes.set(id, { ...pane, x, y })
    set({ panes: newPanes })
  },

  resizePane: (id, width, height) => {
    const state = get()
    const pane = state.panes.get(id)
    if (!pane) return
    const newPanes = new Map(state.panes)
    newPanes.set(id, { ...pane, width: Math.max(200, width), height: Math.max(150, height) })
    set({ panes: newPanes })
  },

  updatePane: (id, updates) => {
    const state = get()
    const pane = state.panes.get(id)
    if (!pane) return
    const newPanes = new Map(state.panes)
    newPanes.set(id, { ...pane, ...updates })
    set({ panes: newPanes })
  },

  setFocusedPane: (id) => set({ focusedPaneId: id }),

  scrollTo: (x, y) => set({ viewportX: x, viewportY: y }),

  scrollBy: (dx, dy) => set((s) => ({
    viewportX: s.viewportX + dx,
    viewportY: s.viewportY + dy
  })),

  getCanvasBounds: () => {
    const panes = get().panes
    if (panes.size === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const pane of panes.values()) {
      minX = Math.min(minX, pane.x)
      minY = Math.min(minY, pane.y)
      maxX = Math.max(maxX, pane.x + pane.width)
      maxY = Math.max(maxY, pane.y + pane.height)
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
  },

  getOrderedPanes: () => {
    const panes = Array.from(get().panes.values())
    // Sort by Y first (row), then X (column)
    return panes.sort((a, b) => {
      const rowDiff = a.y - b.y
      if (Math.abs(rowDiff) > 50) return rowDiff // Different rows
      return a.x - b.x // Same row, sort by x
    })
  },

  getPaneByIndex: (index) => {
    return get().getOrderedPanes()[index]
  },

  findNearestPane: (direction) => {
    const state = get()
    const focused = state.focusedPaneId ? state.panes.get(state.focusedPaneId) : null
    if (!focused) return null

    const focusCenterX = focused.x + focused.width / 2
    const focusCenterY = focused.y + focused.height / 2

    let best: CanvasPaneState | null = null
    let bestDist = Infinity

    for (const pane of state.panes.values()) {
      if (pane.id === focused.id) continue

      const paneCenterX = pane.x + pane.width / 2
      const paneCenterY = pane.y + pane.height / 2
      const dx = paneCenterX - focusCenterX
      const dy = paneCenterY - focusCenterY

      let valid = false
      switch (direction) {
        case 'left': valid = dx < -50; break
        case 'right': valid = dx > 50; break
        case 'up': valid = dy < -50; break
        case 'down': valid = dy > 50; break
      }

      if (!valid) continue

      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < bestDist) {
        bestDist = dist
        best = pane
      }
    }

    return best?.id ?? null
  },

  getVisiblePanes: (activeWorkspaceId) => {
    const panes = Array.from(get().panes.values())
    if (!activeWorkspaceId) return panes
    return panes.filter((p) => !p.workspaceId || p.workspaceId === activeWorkspaceId)
  },

  getHiddenTerminalPanes: (activeWorkspaceId) => {
    if (!activeWorkspaceId) return []
    const panes = Array.from(get().panes.values())
    return panes.filter(
      (p) => p.type === 'terminal' && p.workspaceId && p.workspaceId !== activeWorkspaceId
    )
  },

  tagPanesWithWorkspace: (workspaceId) => {
    const newPanes = new Map<string, CanvasPaneState>()
    for (const [id, pane] of get().panes) {
      if (!pane.workspaceId) {
        newPanes.set(id, { ...pane, workspaceId })
      } else {
        newPanes.set(id, pane)
      }
    }
    set({ panes: newPanes })
  },

  setPanes: (panes) => set({ panes }),

  clearPanes: () => set({ panes: new Map(), focusedPaneId: null }),

  clearWorkspacePanes: (workspaceId, keepTerminals = false) => {
    const newPanes = new Map<string, CanvasPaneState>()
    for (const [id, pane] of get().panes) {
      // Keep panes from other workspaces
      if (pane.workspaceId !== workspaceId) {
        newPanes.set(id, pane)
        continue
      }
      // Optionally keep terminal panes (for CSS-hidden persistence)
      if (keepTerminals && pane.type === 'terminal') {
        newPanes.set(id, pane)
      }
    }
    set({ panes: newPanes, focusedPaneId: null })
  },

  setViewport: (x, y, zoom) => {
    const update: Partial<CanvasState> = { viewportX: x, viewportY: y }
    if (zoom !== undefined) update.zoom = zoom
    set(update)
  }
}))

function getDefaultWidth(type: CanvasPaneType): number {
  switch (type) {
    case 'codex': return 1100
    case 'claude': return 900
    case 'browser': return 1000
    case 'git': return 900
    default: return DEFAULT_PANE_WIDTH
  }
}

function getDefaultHeight(type: CanvasPaneType): number {
  switch (type) {
    case 'codex': return 700
    case 'claude': return 700
    case 'git': return 650
    default: return DEFAULT_PANE_HEIGHT
  }
}

function getDefaultTitle(type: CanvasPaneType): string {
  switch (type) {
    case 'terminal': return 'Terminal'
    case 'editor': return 'Editor'
    case 'browser': return 'Browser'
    case 'unified-editor': return 'Editor'
    case 'claude': return 'Claude Code'
    case 'codex': return 'Codex'
    case 'git': return 'Git'
  }
}
