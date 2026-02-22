import { useEffect, useRef } from 'react'
import { useBrowserStore } from '../../stores/browser-store'
import { useZenStore } from '../../stores/zen-store'

interface BrowserPanelProps {
  panelId: string
  initialUrl: string
  visible?: boolean
}

export function BrowserPanel({ panelId, initialUrl, visible = true }: BrowserPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(null)
  const visibleRef = useRef(visible)
  visibleRef.current = visible

  const registerSession = useBrowserStore((s) => s.registerSession)
  const removeSession = useBrowserStore((s) => s.removeSession)
  const updateSession = useBrowserStore((s) => s.updateSession)

  // Create view and wire up bounds reporting + state updates
  useEffect(() => {
    let destroyed = false

    const init = async () => {
      const sessionId = await window.api.browser.createView(initialUrl)
      if (destroyed) {
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

      // Send initial bounds if visible, otherwise hide
      if (visibleRef.current) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          window.api.browser.setBounds(sessionId, {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          })
        }
      } else {
        window.api.browser.hideView(sessionId)
      }
    }

    init()

    // ResizeObserver reports bounds to main process
    const observer = new ResizeObserver(() => {
      if (!sessionIdRef.current || !containerRef.current || !visibleRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      window.api.browser.setBounds(sessionIdRef.current, {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      })
    })
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

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
      destroyed = true
      observer.disconnect()
      unsub()
      if (sessionIdRef.current) {
        window.api.browser.destroyView(sessionIdRef.current)
        removeSession(sessionIdRef.current)
      }
    }
  }, [])

  // Show/hide view when visibility changes
  useEffect(() => {
    if (!sessionIdRef.current) return
    if (visible) {
      window.api.browser.showView(sessionIdRef.current)
      // Re-send bounds when becoming visible
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        window.api.browser.setBounds(sessionIdRef.current, {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        })
      }
    } else {
      window.api.browser.hideView(sessionIdRef.current)
    }
  }, [visible])

  return <div ref={containerRef} className="w-full h-full" />
}
