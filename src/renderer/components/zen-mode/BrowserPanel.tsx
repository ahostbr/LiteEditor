import { useEffect, useRef } from 'react'
import { useBrowserStore } from '../../stores/browser-store'
import { useZenStore } from '../../stores/zen-store'
import { useUiStore } from '../../stores/ui-store'
import { clipToCanvasContainer } from '../../lib/clip-native-bounds'

function toNativeBounds(rect: DOMRect | { x: number; y: number; width: number; height: number }) {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  }
}

interface BrowserPanelProps {
  panelId: string
  initialUrl: string
  visible?: boolean
}

export function BrowserPanel({ panelId, initialUrl, visible = true }: BrowserPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(null)
  const nativeOverlayOpen = useUiStore((s) => s.nativeOverlayOpen)
  const effectiveVisible = visible && !nativeOverlayOpen
  const visibleRef = useRef(effectiveVisible)
  visibleRef.current = effectiveVisible

  const registerSession = useBrowserStore((s) => s.registerSession)
  const updateSession = useBrowserStore((s) => s.updateSession)

  // Create or reuse view, wire up state updates
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      // Check if zen panel already has a session from a previous mount
      const zenPanel = useZenStore.getState().panels.find((p) => p.id === panelId)
      let sessionId = zenPanel?.browserSessionId || null

      if (sessionId) {
        // Reuse existing session — just show/hide based on visibility
        sessionIdRef.current = sessionId
        registerSession(sessionId, initialUrl)
        if (visibleRef.current) {
          window.api.browser.showView(sessionId)
          sendBounds(sessionId)
        } else {
          window.api.browser.hideView(sessionId)
        }
      } else {
        // Create a new session
        sessionId = await window.api.browser.createView(initialUrl)
        if (cancelled) {
          window.api.browser.destroyView(sessionId)
          return
        }

        sessionIdRef.current = sessionId
        registerSession(sessionId, initialUrl)

        // Store sessionId on zen panel
        useZenStore.setState((state) => ({
          panels: state.panels.map((p) =>
            p.id === panelId ? { ...p, browserSessionId: sessionId } : p
          )
        }))

        if (visibleRef.current) {
          sendBounds(sessionId)
        } else {
          window.api.browser.hideView(sessionId)
        }
      }
    }

    function sendBounds(sessionId: string) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        window.api.browser.setBounds(sessionId, toNativeBounds(rect))
      }
    }

    init()

    // State updates from main process
    const unsub = window.api.browser.onStateUpdate((_event, data) => {
      if (data.sessionId !== sessionIdRef.current) return
      updateSession(data.sessionId, data)
      if (data.title) {
        useZenStore.setState((state) => ({
          panels: state.panels.map((p) =>
            p.id === panelId ? { ...p, title: data.title! } : p
          )
        }))
      }
    })

    return () => {
      cancelled = true
      unsub()
      // Hide but don't destroy — session survives layout switches.
      // Destruction happens in zen-store.removePanel().
      if (sessionIdRef.current) {
        window.api.browser.hideView(sessionIdRef.current)
      }
    }
  }, [])

  // rAF bounds tracking — handles drag, resize, splitter, and window moves
  // Clips to canvas container so native views don't overflow the viewport
  useEffect(() => {
    let rafId: number | null = null
    let lastX = 0
    let lastY = 0
    let lastW = 0
    let lastH = 0
    let lastVisible = true

    function tick() {
      const sid = sessionIdRef.current
      if (!sid || !containerRef.current || !visibleRef.current) {
        rafId = requestAnimationFrame(tick)
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const clipped = clipToCanvasContainer(rect)

      if (!clipped.visible) {
        if (lastVisible) {
          lastVisible = false
          window.api.browser.hideView(sid)
        }
        rafId = requestAnimationFrame(tick)
        return
      }

      if (!lastVisible) {
        lastVisible = true
        window.api.browser.showView(sid)
      }

      const { x, y, width: w, height: h } = clipped
      if (x !== lastX || y !== lastY || w !== lastW || h !== lastH) {
        lastX = x
        lastY = y
        lastW = w
        lastH = h
        window.api.browser.setBounds(sid, {
          x, y, width: w, height: h,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        })
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  // Show/hide view when visibility changes
  useEffect(() => {
    if (!sessionIdRef.current) return
    if (effectiveVisible) {
      window.api.browser.showView(sessionIdRef.current)
    } else {
      window.api.browser.hideView(sessionIdRef.current)
    }
  }, [effectiveVisible])

  return <div ref={containerRef} className="w-full h-full" />
}
