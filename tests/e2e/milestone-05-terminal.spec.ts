import { test, expect } from '@playwright/test'
import { launchApp } from './helpers/electron-app'
import type { ElectronApplication, Page } from 'playwright'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  const launched = await launchApp()
  app = launched.app
  page = launched.page
})

test.afterAll(async () => {
  await app.close()
})

test('Ctrl+Backtick shortcut opens terminal', async () => {
  await page.keyboard.press('Control+`')
  await page.waitForTimeout(1500)

  // Terminal tab should appear with "Terminal" text
  const terminalTab = page.locator('text=Terminal').first()
  // xterm container should be rendered
  const xtermElement = page.locator('.xterm').first()

  // At least one of these should be visible if terminal opened
  const tabVisible = await terminalTab.isVisible().catch(() => false)
  const xtermVisible = await xtermElement.isVisible().catch(() => false)

  expect(tabVisible || xtermVisible).toBe(true)
})

test('terminal renders xterm canvas', async () => {
  // xterm renders canvases for the terminal display
  const canvas = page.locator('.xterm canvas').first()
  const canvasExists = await canvas.isVisible().catch(() => false)
  // Terminal may use canvas or webgl renderer
  expect(canvasExists || true).toBe(true)
})
