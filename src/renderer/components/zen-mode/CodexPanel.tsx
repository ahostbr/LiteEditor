import { useEffect, useRef } from 'react'
import { useZenStore } from '../../stores/zen-store'

interface CodexPanelProps {
  panelId: string
  visible?: boolean
}

export function CodexPanel({ panelId, visible = true }: CodexPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(null)
  const visibleRef = useRef(visible)
  visibleRef.current = visible

  // Create or reuse session, manage lifecycle
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      // Check if zen panel already has a session from a previous mount
      const zenPanel = useZenStore.getState().panels.find((p) => p.id === panelId)
      let sessionId = zenPanel?.codexSessionId || null

      if (sessionId) {
        // Reuse existing session — just show/hide based on visibility
        sessionIdRef.current = sessionId
        if (visibleRef.current) {
          window.api.codex.showView(sessionId)
          sendBounds(sessionId)
        } else {
          window.api.codex.hideView(sessionId)
        }
      } else {
        // Create a new session
        sessionId = await window.api.codex.createSession()
        if (cancelled) {
          window.api.codex.destroySession(sessionId)
          return
        }

        sessionIdRef.current = sessionId

        // Store sessionId on zen panel
        useZenStore.setState((state) => ({
          panels: state.panels.map((p) =>
            p.id === panelId ? { ...p, codexSessionId: sessionId } : p
          )
        }))

        if (visibleRef.current) {
          sendBounds(sessionId)
        } else {
          window.api.codex.hideView(sessionId)
        }
      }
    }

    function sendBounds(sessionId: string) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        window.api.codex.setBounds(sessionId, {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        })
      }
    }

    init()

    return () => {
      cancelled = true
      // Hide but don't destroy — session survives layout switches.
      // Destruction happens in zen-store.removePanel().
      if (sessionIdRef.current) {
        window.api.codex.hideView(sessionIdRef.current)
      }
    }
  }, [])

  // rAF bounds tracking — handles drag, resize, splitter, and window moves
  useEffect(() => {
    let rafId: number | null = null
    let lastX = 0
    let lastY = 0
    let lastW = 0
    let lastH = 0

    function tick() {
      const sid = sessionIdRef.current
      if (!sid || !containerRef.current || !visibleRef.current) {
        rafId = requestAnimationFrame(tick)
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.round(rect.x)
      const y = Math.round(rect.y)
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)

      if (x !== lastX || y !== lastY || w !== lastW || h !== lastH) {
        lastX = x
        lastY = y
        lastW = w
        lastH = h
        window.api.codex.setBounds(sid, { x, y, width: w, height: h })
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
    if (visible) {
      window.api.codex.showView(sessionIdRef.current)
    } else {
      window.api.codex.hideView(sessionIdRef.current)
    }
  }, [visible])

  return <div ref={containerRef} className="w-full h-full" />
}
