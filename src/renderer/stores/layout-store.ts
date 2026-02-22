import { create } from 'zustand'

export type LayoutMode = 'grid' | 'splitter' | 'window' | 'tabs'
export type GridLayout = 'auto' | '2x2' | '3x3'

export interface WindowState {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

interface LayoutState {
  layoutMode: LayoutMode
  gridLayout: GridLayout
  splitterSizes: number[]
  windowStates: Record<string, WindowState>
  nextZIndex: number

  setLayoutMode: (mode: LayoutMode) => void
  cycleLayoutMode: () => void
  setGridLayout: (layout: GridLayout) => void
  setSplitterSizes: (sizes: number[]) => void
  updateWindowState: (termId: string, updates: Partial<WindowState>) => void
  bringToFront: (termId: string) => void
  initWindowState: (termId: string, containerWidth: number, containerHeight: number, index: number) => void
  removeWindowState: (termId: string) => void
  loadLayout: () => Promise<void>
  saveLayout: () => Promise<void>
}

const LAYOUT_MODES: LayoutMode[] = ['grid', 'splitter', 'window', 'tabs']

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layoutMode: 'grid',
  gridLayout: 'auto',
  splitterSizes: [],
  windowStates: {},
  nextZIndex: 1,

  setLayoutMode: (mode) => {
    set({ layoutMode: mode })
    get().saveLayout()
  },

  cycleLayoutMode: () => {
    const current = get().layoutMode
    const idx = LAYOUT_MODES.indexOf(current)
    const next = LAYOUT_MODES[(idx + 1) % LAYOUT_MODES.length]
    set({ layoutMode: next })
    get().saveLayout()
  },

  setGridLayout: (layout) => {
    set({ gridLayout: layout })
    get().saveLayout()
  },

  setSplitterSizes: (sizes) => {
    set({ splitterSizes: sizes })
  },

  updateWindowState: (termId, updates) => {
    set((state) => ({
      windowStates: {
        ...state.windowStates,
        [termId]: { ...state.windowStates[termId], ...updates } as WindowState
      }
    }))
  },

  bringToFront: (termId) => {
    set((state) => {
      const z = state.nextZIndex
      return {
        nextZIndex: z + 1,
        windowStates: {
          ...state.windowStates,
          [termId]: { ...state.windowStates[termId], zIndex: z }
        }
      }
    })
  },

  initWindowState: (termId, containerWidth, containerHeight, index) => {
    const offset = index * 30
    const width = Math.min(600, containerWidth * 0.6)
    const height = Math.min(400, containerHeight * 0.6)
    set((state) => ({
      nextZIndex: state.nextZIndex + 1,
      windowStates: {
        ...state.windowStates,
        [termId]: {
          x: 40 + offset,
          y: 40 + offset,
          width,
          height,
          zIndex: state.nextZIndex
        }
      }
    }))
  },

  removeWindowState: (termId) => {
    set((state) => {
      const { [termId]: _, ...rest } = state.windowStates
      return { windowStates: rest }
    })
  },

  loadLayout: async () => {
    try {
      const data = await window.api.settings.load()
      if (data && typeof data === 'object') {
        const s = data as Record<string, unknown>
        if (s.zenLayoutMode && typeof s.zenLayoutMode === 'string') {
          set({ layoutMode: s.zenLayoutMode as LayoutMode })
        }
        if (s.zenGridLayout && typeof s.zenGridLayout === 'string') {
          set({ gridLayout: s.zenGridLayout as GridLayout })
        }
      }
    } catch { /* ignore */ }
  },

  saveLayout: async () => {
    try {
      const existing = await window.api.settings.load()
      const data = (existing && typeof existing === 'object') ? existing as Record<string, unknown> : {}
      const state = get()
      data.zenLayoutMode = state.layoutMode
      data.zenGridLayout = state.gridLayout
      await window.api.settings.save(JSON.stringify(data, null, 2))
    } catch { /* ignore */ }
  }
}))
