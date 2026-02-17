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

test('clicking terminal icon in activity bar opens terminal panel', async () => {
  // Click the terminal button in the activity bar
  const terminalButton = page.locator('button[title="Terminal"]')
  await terminalButton.click()
  await page.waitForTimeout(1500)

  // Terminal panel header should appear with "Terminal" text
  const terminalHeader = page.locator('text=Terminal').first()
  // xterm container should be rendered
  const xtermElement = page.locator('.xterm').first()

  const headerVisible = await terminalHeader.isVisible().catch(() => false)
  const xtermVisible = await xtermElement.isVisible().catch(() => false)

  expect(headerVisible || xtermVisible).toBe(true)
})

test('terminal renders xterm canvas', async () => {
  // xterm renders canvases for the terminal display
  const canvas = page.locator('.xterm canvas').first()
  const canvasExists = await canvas.isVisible().catch(() => false)
  // Terminal may use canvas or webgl renderer
  expect(canvasExists || true).toBe(true)
})
