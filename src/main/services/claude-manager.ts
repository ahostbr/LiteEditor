import { WebContentsView, BrowserWindow, app } from 'electron'
import { join } from 'path'
import { readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { type NativeViewBounds, toContentBounds } from './native-view-bounds'
import { buildWebviewThemeCss } from './webview-theme'

let counter = 0

interface ClaudeSession {
  id: string
  view: WebContentsView
  mainWindow: BrowserWindow
  hidden: boolean
}

export class ClaudeManager {
  private sessions = new Map<string, ClaudeSession>()
  private extensionPath: string | null = null
  private wrapperHtmlPath: string | null = null

  findClaudeExtension(): string | null {
    if (this.extensionPath) return this.extensionPath

    const homeDir = process.env.USERPROFILE || process.env.HOME || ''
    const extensionsDir = join(homeDir, '.vscode', 'extensions')

    if (!existsSync(extensionsDir)) return null

    try {
      const entries = readdirSync(extensionsDir)
      const claudeExtensions = entries
        .filter((e) => e.startsWith('anthropic.claude-code-'))
        .sort()

      if (claudeExtensions.length === 0) return null

      // Use latest version (last in sorted order)
      const latest = claudeExtensions[claudeExtensions.length - 1]
      const fullPath = join(extensionsDir, latest)

      // Verify webview assets exist
      if (existsSync(join(fullPath, 'webview', 'index.js'))) {
        this.extensionPath = fullPath
        return fullPath
      }
    } catch {
      /* extension dir not readable */
    }

    return null
  }

  private getWrapperHtmlPath(extPath: string): string {
    if (this.wrapperHtmlPath) return this.wrapperHtmlPath

    // Generate the wrapper HTML at runtime and write to a temp location
    const tmpDir = join(app.getPath('temp'), 'liteeditor-claude')
    try { mkdirSync(tmpDir, { recursive: true }) } catch { /* exists */ }

    const cssUrl = `file:///${extPath.replace(/\\/g, '/')}/webview/index.css`
    const jsUrl = `file:///${extPath.replace(/\\/g, '/')}/webview/index.js`
    const themeCss = buildWebviewThemeCss()

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data: blob: https:; img-src 'self' file: data: blob: https:; style-src 'self' 'unsafe-inline' file:; script-src 'self' 'unsafe-inline' 'unsafe-eval' file:; connect-src 'self' https: wss:; font-src 'self' file: data:;" />
  <title>Claude Code</title>
  <link rel="stylesheet" href="${cssUrl}" />
${themeCss}
  <script>
    window.initialConfiguration = {};
    window.IS_SIDEBAR = false;
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${jsUrl}"></script>
</body>
</html>`

    const htmlPath = join(tmpDir, 'claude-webview.html')
    writeFileSync(htmlPath, html, 'utf-8')
    this.wrapperHtmlPath = htmlPath
    return htmlPath
  }

  createSession(mainWindow: BrowserWindow): string {
    const id = `claude-${++counter}-${Date.now()}`

    const preloadPath = join(__dirname, '../preload/claude-preload.mjs')

    const view = new WebContentsView({
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })

    // Start at zero bounds until the renderer reports real bounds
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    mainWindow.contentView.addChildView(view)

    const session: ClaudeSession = {
      id,
      view,
      mainWindow,
      hidden: false
    }
    this.sessions.set(id, session)

    // Send session ID to the preload script once the page loads
    view.webContents.on('did-finish-load', () => {
      view.webContents.send('claude:set-session-id', id)
    })

    // Load the wrapper HTML
    const extPath = this.findClaudeExtension()
    if (extPath) {
      const htmlPath = this.getWrapperHtmlPath(extPath)
      view.webContents.loadFile(htmlPath)
    } else {
      // No extension found — load a fallback message
      view.webContents.loadURL('data:text/html,<html><body style="background:%230c0c0f;color:%23999;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h2>Claude Code Extension Not Found</h2><p>Install the Claude Code VS Code extension first.</p></div></body></html>')
    }

    return id
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
