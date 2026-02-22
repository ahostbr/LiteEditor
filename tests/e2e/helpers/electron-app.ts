import { _electron as electron, type ElectronApplication, type Page } from 'playwright'
import { join } from 'path'

export async function launchApp(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    args: [join(process.cwd(), 'out/main/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  })

  const page = await app.firstWindow()
  // Wait for the app to be fully loaded
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
  return { app, page }
}

/**
 * Gracefully quit the Electron app.
 * The app intercepts window close to minimize instead, so we must
 * send a quit IPC first to set forceQuit=true before closing.
 */
export async function quitApp(app: ElectronApplication): Promise<void> {
  if (!app) return
  try {
    await app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0]
      return win?.webContents.executeJavaScript('window.api.window.quit()')
    })
  } catch { /* app may already be gone */ }
  await new Promise((r) => setTimeout(r, 1000))
  await app.close().catch(() => {})
}
