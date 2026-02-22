import { useEffect, useRef, type MutableRefObject } from 'react'
import { useBrowserStore } from '../../stores/browser-store'
import { useZenStore } from '../../stores/zen-store'

interface BrowserPanelProps {
  panelId: string
  initialUrl: string
  webviewRef: MutableRefObject<Electron.WebviewTag | null>
}

export function BrowserPanel({ panelId, initialUrl, webviewRef }: BrowserPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(null)
  const registerSession = useBrowserStore((s) => s.registerSession)
  const removeSession = useBrowserStore((s) => s.removeSession)
  const updateSession = useBrowserStore((s) => s.updateSession)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create webview element imperatively to avoid React type issues
    const webview = document.createElement('webview') as Electron.WebviewTag
    webview.src = initialUrl
    webview.setAttribute('partition', 'persist:browser')
    webview.setAttribute('allowpopups', 'true')
    webview.style.width = '100%'
    webview.style.height = '100%'
    container.appendChild(webview)
    webviewRef.current = webview

    const handleDomReady = async () => {
      try {
        const wcId = (webview as any).getWebContentsId()
        const sessionId = await window.api.browser.register(wcId)
        sessionIdRef.current = sessionId
        registerSession(sessionId, wcId, webview.getURL())

        // Store sessionId on zen panel
        const panels = useZenStore.getState().panels
        const panel = panels.find((p) => p.id === panelId)
        if (panel) {
          useZenStore.setState((state) => ({
            panels: state.panels.map((p) =>
              p.id === panelId ? { ...p, browserSessionId: sessionId } : p
            )
          }))
        }
      } catch (err) {
        console.error('Failed to register browser session:', err)
      }
    }

    const handleDidNavigate = () => {
      if (!sessionIdRef.current) return
      const url = webview.getURL()
      const canGoBack = webview.canGoBack()
      const canGoForward = webview.canGoForward()
      updateSession(sessionIdRef.current, { url, canGoBack, canGoForward })

      // Update zen panel title
      useZenStore.setState((state) => ({
        panels: state.panels.map((p) =>
          p.id === panelId ? { ...p, title: webview.getTitle() || url } : p
        )
      }))
    }

    const handleDidNavigateInPage = () => {
      handleDidNavigate()
    }

    const handleStartLoading = () => {
      if (!sessionIdRef.current) return
      updateSession(sessionIdRef.current, { isLoading: true })
    }

    const handleStopLoading = () => {
      if (!sessionIdRef.current) return
      const url = webview.getURL()
      const canGoBack = webview.canGoBack()
      const canGoForward = webview.canGoForward()
      updateSession(sessionIdRef.current, {
        isLoading: false,
        url,
        canGoBack,
        canGoForward
      })
    }

    const handleTitleUpdated = (e: any) => {
      if (!sessionIdRef.current) return
      updateSession(sessionIdRef.current, { title: e.title })
      useZenStore.setState((state) => ({
        panels: state.panels.map((p) =>
          p.id === panelId ? { ...p, title: e.title } : p
        )
      }))
    }

    webview.addEventListener('dom-ready', handleDomReady)
    webview.addEventListener('did-navigate', handleDidNavigate)
    webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage)
    webview.addEventListener('did-start-loading', handleStartLoading)
    webview.addEventListener('did-stop-loading', handleStopLoading)
    webview.addEventListener('page-title-updated', handleTitleUpdated)

    return () => {
      webview.removeEventListener('dom-ready', handleDomReady)
      webview.removeEventListener('did-navigate', handleDidNavigate)
      webview.removeEventListener('did-navigate-in-page', handleDidNavigateInPage)
      webview.removeEventListener('did-start-loading', handleStartLoading)
      webview.removeEventListener('did-stop-loading', handleStopLoading)
      webview.removeEventListener('page-title-updated', handleTitleUpdated)

      if (sessionIdRef.current) {
        window.api.browser.unregister(sessionIdRef.current)
        removeSession(sessionIdRef.current)
      }

      webviewRef.current = null
      if (container.contains(webview)) {
        container.removeChild(webview)
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
