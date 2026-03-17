/**
 * NativeBoundsController — Centralized bounds tracking for all native WebContentsView overlays.
 *
 * Replaces the 3 separate rAF loops in BrowserPanel, ClaudePanel, and CodexPanel with
 * a single loop that batches all bounds updates into ONE IPC call per frame.
 *
 * Each native panel registers itself via register(). The controller runs a single
 * requestAnimationFrame loop that:
 *   1. Reads each panel's container bounds (getBoundingClientRect)
 *   2. Clips to the canvas container (if in canvas mode)
 *   3. Detects visibility and bounds changes
 *   4. Sends a single batched IPC call with all updates
 */

import { clipToCanvasContainer } from './clip-native-bounds'

export type NativeViewType = 'browser' | 'claude' | 'codex'

interface NativeViewDriver {
  setBounds: (sessionId: string, bounds: NativeViewBounds) => void
  showView: (sessionId: string) => void
  hideView: (sessionId: string) => void
}

interface NativeViewBounds {
  x: number
  y: number
  width: number
  height: number
  viewportWidth: number
  viewportHeight: number
}

interface RegisteredView {
  key: string
  type: NativeViewType
  sessionId: string
  containerRef: React.RefObject<HTMLDivElement | null>
  driver: NativeViewDriver
  visible: boolean // whether the panel wants to be visible (effectiveVisible)
  lastBounds: { x: number; y: number; w: number; h: number } | null
  lastShown: boolean
}

class NativeBoundsControllerImpl {
  private views = new Map<string, RegisteredView>()
  private rafId: number | null = null
  private running = false

  register(
    key: string,
    type: NativeViewType,
    sessionId: string,
    containerRef: React.RefObject<HTMLDivElement | null>,
    driver: NativeViewDriver,
    visible: boolean
  ): void {
    this.views.set(key, {
      key,
      type,
      sessionId,
      containerRef,
      driver,
      visible,
      lastBounds: null,
      lastShown: false
    })
    this.ensureRunning()
  }

  unregister(key: string): void {
    this.views.delete(key)
    if (this.views.size === 0) {
      this.stop()
    }
  }

  updateSessionId(key: string, sessionId: string): void {
    const view = this.views.get(key)
    if (view) {
      view.sessionId = sessionId
      view.lastBounds = null
      view.lastShown = false
    }
  }

  updateVisibility(key: string, visible: boolean): void {
    const view = this.views.get(key)
    if (view) {
      view.visible = visible
    }
  }

  private ensureRunning(): void {
    if (this.running) return
    this.running = true
    this.rafId = requestAnimationFrame(this.tick)
  }

  private stop(): void {
    this.running = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private tick = (): void => {
    if (!this.running) return

    const vpWidth = window.innerWidth
    const vpHeight = window.innerHeight

    for (const view of Array.from(this.views.values())) {
      if (!view.sessionId || !view.containerRef.current) continue

      // Panel wants to be hidden
      if (!view.visible) {
        if (view.lastShown) {
          view.lastShown = false
          view.driver.hideView(view.sessionId)
        }
        continue
      }

      // Read DOM bounds and clip to canvas container
      const rect = view.containerRef.current.getBoundingClientRect()
      const clipped = clipToCanvasContainer(rect)

      if (!clipped.visible) {
        if (view.lastShown) {
          view.lastShown = false
          view.driver.hideView(view.sessionId)
        }
        continue
      }

      // Show if was hidden
      if (!view.lastShown) {
        view.lastShown = true
        view.driver.showView(view.sessionId)
      }

      // Check if bounds changed
      const { x, y, width: w, height: h } = clipped
      const last = view.lastBounds
      if (!last || x !== last.x || y !== last.y || w !== last.w || h !== last.h) {
        view.lastBounds = { x, y, w, h }
        view.driver.setBounds(view.sessionId, {
          x, y, width: w, height: h,
          viewportWidth: vpWidth,
          viewportHeight: vpHeight
        })
      }
    }

    this.rafId = requestAnimationFrame(this.tick)
  }
}

/** Singleton controller — all native panels share one rAF loop */
export const nativeBoundsController = new NativeBoundsControllerImpl()
