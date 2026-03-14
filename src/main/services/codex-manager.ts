import { WebContentsView, BrowserWindow, app } from 'electron'
import { join } from 'path'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { type NativeViewBounds, toContentBounds } from './native-view-bounds'
import { buildWebviewThemeCss } from './webview-theme'
import { integrationsManager } from './integrations-manager'

let counter = 0

interface CodexSession {
  id: string
  view: WebContentsView
  mainWindow: BrowserWindow
  hidden: boolean
}

export class CodexManager {
  private sessions = new Map<string, CodexSession>()
  private wrapperHtmlPathByExtension = new Map<string, string>()

  findCodexExtension(): string | null {
    return integrationsManager.resolve('codex')?.path ?? null
  }

  private getWrapperHtmlPath(extPath: string): string {
    const existing = this.wrapperHtmlPathByExtension.get(extPath)
    if (existing) return existing

    const tmpDir = join(app.getPath('temp'), 'liteeditor-codex')
    try { mkdirSync(tmpDir, { recursive: true }) } catch { /* exists */ }

    const srcHtml = readFileSync(join(extPath, 'webview', 'index.html'), 'utf-8')
    const webviewDir = join(extPath, 'webview').replace(/\\/g, '/')

    let html = srcHtml
      .replace(
        '<html lang="en">',
        '<html lang="en" data-codex-window-type="electron">'
      )
      .replace(
        '<!-- PROD_BASE_TAG_HERE -->',
        `<base href="file:///${webviewDir}/" />`
      )
      .replace(
        '<!-- PROD_CSP_TAG_HERE -->',
        `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data: blob: https:; img-src 'self' file: data: blob: https:; style-src 'self' 'unsafe-inline' 'unsafe-eval' file:; connect-src 'self' https: wss:; font-src 'self' file: data:;" />`
      )
      .replace(/\s+crossorigin/g, '')

    const cssVars = buildWebviewThemeCss()

    // Guard: the bundle unconditionally overwrites data-codex-window-type and data-window-type
    // to "extension" at module init. This MutationObserver reverts them to "electron" immediately.
    const windowTypeGuard = `<script>(function(){var l=false;new MutationObserver(function(m){if(l)return;for(var i=0;i<m.length;i++){var a=m[i].attributeName;if((a==="data-codex-window-type"||a==="data-window-type")&&document.documentElement.getAttribute(a)!=="electron"){l=true;document.documentElement.setAttribute(a,"electron");l=false}}}).observe(document.documentElement,{attributes:true,attributeFilter:["data-codex-window-type","data-window-type"]})})()</script>`

    html = html.replace('</head>', `${windowTypeGuard}\n${cssVars}\n</head>`)

    const htmlPath = join(tmpDir, `codex-webview-${this.toFileSafe(extPath)}.html`)
    writeFileSync(htmlPath, html, 'utf-8')
    this.wrapperHtmlPathByExtension.set(extPath, htmlPath)
    return htmlPath
  }

  private toFileSafe(value: string): string {
    return value.replace(/[\\/:*?"<>|]/g, '_')
  }

  createSession(mainWindow: BrowserWindow): string {
    const id = `codex-${++counter}-${Date.now()}`

    const preloadPath = join(__dirname, '../preload/codex-preload.mjs')

    const view = new WebContentsView({
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })

    view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    mainWindow.contentView.addChildView(view)

    const session: CodexSession = {
      id,
      view,
      mainWindow,
      hidden: false
    }
    this.sessions.set(id, session)

    view.webContents.on('did-fail-load', (_e, errorCode, errorDescription, validatedURL) => {
      console.error('[codex] did-fail-load:', errorCode, errorDescription, validatedURL)
    })

    view.webContents.on('did-finish-load', () => {
      view.webContents.send('codex:set-session-id', id)
      // Close sidebar by default for canvas pane sizing
      this.closeSidebar(view)
    })

    const extPath = this.findCodexExtension()
    if (extPath) {
      const htmlPath = this.getWrapperHtmlPath(extPath)
      view.webContents.loadFile(htmlPath)
    } else {
      view.webContents.loadURL('data:text/html,<html><body style="background:%230c0c0f;color:%23999;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h2>Codex Extension Not Found</h2><p>Open Settings -> Integrations to install OpenAI Codex.</p></div></body></html>')
    }

    return id
  }

  private closeSidebar(view: WebContentsView): void {
    // Inject CSS + JS to collapse the sidebar on load
    view.webContents.executeJavaScript(`
      (function() {
        // Try common sidebar patterns: nav, aside, [data-sidebar], .sidebar
        function tryClose() {
          // Method 1: Click sidebar toggle/close button if it exists
          var toggleBtn = document.querySelector('[data-testid="close-sidebar-button"], button[aria-label*="Close sidebar"], button[aria-label*="close sidebar"], button[aria-label*="Toggle sidebar"]');
          if (toggleBtn) { toggleBtn.click(); return; }

          // Method 2: Hide sidebar via CSS (covers most layouts)
          var style = document.createElement('style');
          style.id = 'liteeditor-sidebar-hide';
          style.textContent = 'nav:first-of-type, aside:first-of-type, [data-sidebar], .sidebar, .side-nav { display: none !important; }';
          if (!document.getElementById('liteeditor-sidebar-hide')) {
            document.head.appendChild(style);
          }
        }
        // Try immediately and after short delay for dynamic rendering
        tryClose();
        setTimeout(tryClose, 500);
        setTimeout(tryClose, 1500);
      })();
    `).catch(() => {})
  }

  setBounds(sessionId: string, bounds: NativeViewBounds): void {
    const session = this.sessions.get(sessionId)
    if (!session || session.hidden) return
    session.view.setBounds(toContentBounds(session.mainWindow, bounds))
  }

  showView(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session || !session.hidden) return
    session.hidden = false
    try {
      session.mainWindow.contentView.addChildView(session.view)
    } catch { /* window may be closed */ }
  }

  hideView(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session || session.hidden) return
    session.hidden = true
    try {
      session.mainWindow.contentView.removeChildView(session.view)
    } catch { /* window may be closed */ }
  }

  getWebContents(sessionId: string) {
    const session = this.sessions.get(sessionId)
    if (!session) return undefined
    return session.view.webContents
  }

  getMainWindow(sessionId: string): BrowserWindow | undefined {
    const session = this.sessions.get(sessionId)
    return session?.mainWindow
  }

  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    this.sessions.delete(sessionId)
    try {
      session.mainWindow.contentView.removeChildView(session.view)
    } catch { /* window may already be closed */ }
    try {
      session.view.webContents.close()
    } catch { /* already destroyed */ }
  }

  removeAll(): void {
    for (const sessionId of Array.from(this.sessions.keys())) {
      this.destroySession(sessionId)
    }
  }
}
