import { useEffect, useRef, type RefObject } from 'react'
import { useZenStore, type ZenPanel } from '../../stores/zen-store'

type SessionField = 'browserSessionId' | 'claudeSessionId' | 'codexSessionId'

interface BoundsRect {
  x: number
  y: number
  width: number
  height: number
}

interface NativeViewDriver {
  createSession: () => Promise<string>
  destroySession: (sessionId: string) => void
  setBounds: (sessionId: string, bounds: BoundsRect) => void
  showView: (sessionId: string) => void
  hideView: (sessionId: string) => void
}

interface UseNativePanelViewOptions {
  panelId: string
  sessionField: SessionField
  visible: boolean
  driver: NativeViewDriver
  onSessionReady?: (sessionId: string, reused: boolean) => void
}

const ZERO_BOUNDS: BoundsRect = { x: 0, y: 0, width: 0, height: 0 }
const EPSILON = 1

function toPanelBounds(element: HTMLElement | null): BoundsRect | null {
  if (!element) return null
  const rect = element.getBoundingClientRect()

  const x = Math.max(0, Math.round(rect.x))
  const y = Math.max(0, Math.round(rect.y))
  const width = Math.max(0, Math.round(rect.width))
  const height = Math.max(0, Math.round(rect.height))

  if (width <= EPSILON || height <= EPSILON) return null

  return { x, y, width, height }
}

function isSameBounds(a: BoundsRect | null, b: BoundsRect | null): boolean {
  if (!a || !b) return false
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

function getStoredSession(panelId: string, sessionField: SessionField): string | null {
  const panel = useZenStore.getState().panels.find((item) => item.id === panelId)
  const sessionId = panel?.[sessionField]
  return typeof sessionId === 'string' ? sessionId : null
}

function storeSession(panelId: string, sessionField: SessionField, sessionId: string): void {
  useZenStore.setState((state) => ({
    panels: state.panels.map((panel) => {
      if (panel.id !== panelId) return panel
      return {
        ...panel,
        [sessionField]: sessionId
      } as ZenPanel
    })
  }))
}

export function useNativePanelView({
  panelId,
  sessionField,
  visible,
  driver,
  onSessionReady
}: UseNativePanelViewOptions): {
  containerRef: RefObject<HTMLDivElement | null>
  sessionIdRef: RefObject<string | null>
} {
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(null)
  const visibleRef = useRef(visible)
  const lastBoundsRef = useRef<BoundsRect | null>(null)
  const rafIdRef = useRef<number | null>(null)

  visibleRef.current = visible

  const syncBounds = (sessionId: string, force = false): boolean => {
    const bounds = toPanelBounds(containerRef.current)
    if (!bounds) return false

    if (!force && isSameBounds(lastBoundsRef.current, bounds)) return true

    lastBoundsRef.current = bounds
    driver.setBounds(sessionId, bounds)
    return true
  }

  const syncVisibility = (sessionId: string, forceBounds = false): void => {
    if (!visibleRef.current) {
      driver.hideView(sessionId)
      driver.setBounds(sessionId, ZERO_BOUNDS)
      return
    }

    const hasBounds = syncBounds(sessionId, forceBounds)
    if (!hasBounds) {
      driver.hideView(sessionId)
      driver.setBounds(sessionId, ZERO_BOUNDS)
      return
    }

    driver.showView(sessionId)
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const existing = getStoredSession(panelId, sessionField)
      if (existing) {
        sessionIdRef.current = existing
        onSessionReady?.(existing, true)
        syncVisibility(existing, true)
        return
      }

      const created = await driver.createSession()
      if (cancelled) {
        driver.hideView(created)
        driver.setBounds(created, ZERO_BOUNDS)
        driver.destroySession(created)
        return
      }

      sessionIdRef.current = created
      storeSession(panelId, sessionField, created)
      onSessionReady?.(created, false)
      syncVisibility(created, true)
    }

    init().catch(() => {})

    return () => {
      cancelled = true
      const sessionId = sessionIdRef.current
      if (sessionId) {
        driver.hideView(sessionId)
        driver.setBounds(sessionId, ZERO_BOUNDS)
      }
    }
  }, [])

  useEffect(() => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return
    syncVisibility(sessionId, true)
  }, [visible])

  useEffect(() => {
    const schedule = () => {
      if (rafIdRef.current !== null) return
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        const sessionId = sessionIdRef.current
        if (!sessionId || !visibleRef.current) return
        syncBounds(sessionId)
      })
    }

    const resizeObserver = new ResizeObserver(schedule)
    const node = containerRef.current
    if (node) resizeObserver.observe(node)

    window.addEventListener('resize', schedule)

    let rafLoopId: number | null = null
    const loop = () => {
      if (visibleRef.current) schedule()
      rafLoopId = requestAnimationFrame(loop)
    }
    rafLoopId = requestAnimationFrame(loop)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', schedule)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      if (rafLoopId !== null) cancelAnimationFrame(rafLoopId)
    }
  }, [])

  return { containerRef, sessionIdRef }
}
