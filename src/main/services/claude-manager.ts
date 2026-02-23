import { WebContentsView, BrowserWindow, app } from 'electron'
import { join } from 'path'
import { readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs'

let counter = 0

interface ClaudeSession {
  id: string
  view: WebContentsView
  mainWindow: BrowserWindow
  hidden: boolean
  attached: boolean
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

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data: blob: https:; img-src 'self' file: data: blob: https:; style-src 'self' 'unsafe-inline' file:; script-src 'self' 'unsafe-inline' 'unsafe-eval' file:; connect-src 'self' https: wss:; font-src 'self' file: data:;" />
  <title>Claude Code</title>
  <link rel="stylesheet" href="${cssUrl}" />
  <style>
    :root {
      --vscode-editor-background: #0c0c0f;
      --vscode-editor-foreground: #cccccc;
      --vscode-sideBar-background: #111114;
      --vscode-sideBar-foreground: #cccccc;
      --vscode-sideBarSectionHeader-background: #18181b;
      --vscode-panel-background: #0c0c0f;
      --vscode-panel-border: #2a2a2e;
      --vscode-input-background: #18181b;
      --vscode-input-foreground: #cccccc;
      --vscode-input-border: #2a2a2e;
      --vscode-input-placeholderForeground: #666666;
      --vscode-button-background: #6366f1;
      --vscode-button-foreground: #ffffff;
      --vscode-button-hoverBackground: #818cf8;
      --vscode-button-secondaryBackground: #2a2a2e;
      --vscode-button-secondaryForeground: #cccccc;
      --vscode-focusBorder: #6366f1;
      --vscode-foreground: #cccccc;
      --vscode-descriptionForeground: #888888;
      --vscode-errorForeground: #f87171;
      --vscode-textLink-foreground: #818cf8;
      --vscode-textLink-activeForeground: #a5b4fc;
      --vscode-font-family: system-ui, -apple-system, sans-serif;
      --vscode-font-size: 13px;
      --vscode-editor-font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
      --vscode-editor-font-size: 13px;
      --vscode-list-activeSelectionBackground: #2a2a2e;
      --vscode-list-activeSelectionForeground: #ffffff;
      --vscode-list-hoverBackground: #1e1e22;
      --vscode-scrollbarSlider-background: rgba(255,255,255,0.1);
      --vscode-scrollbarSlider-hoverBackground: rgba(255,255,255,0.15);
      --vscode-scrollbarSlider-activeBackground: rgba(255,255,255,0.2);
      --vscode-badge-background: #6366f1;
      --vscode-badge-foreground: #ffffff;
      --vscode-progressBar-background: #6366f1;
    }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-hoverBackground); }
  </style>
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

    const session: ClaudeSession = {
      id,
      view,
      mainWindow,
      hidden: true,
      attached: false
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

  setBounds(sessionId: string, bounds: { x: number; y: number; width: number; height: number }): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.view.setBounds(bounds)
  }

  showView(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    if (session.attached) {
      session.hidden = false
      return
    }
    session.hidden = false
    try {
      session.mainWindow.contentView.addChildView(session.view)
      session.attached = true
    } catch { /* window may be closed */ }
  }

  hideView(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.hidden = true
    session.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    if (!session.attached) return
    try {
      session.mainWindow.contentView.removeChildView(session.view)
      session.attached = false
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
    session.hidden = true
    session.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    try {
      if (session.attached) {
        session.mainWindow.contentView.removeChildView(session.view)
      }
      session.attached = false
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
