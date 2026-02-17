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
