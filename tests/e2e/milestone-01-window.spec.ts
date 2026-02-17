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

test('window opens and is visible', async () => {
  const isVisible = await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0]
    return win?.isVisible() ?? false
  })
  expect(isVisible).toBe(true)
})

test('window has correct minimum size', async () => {
  const size = await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0]
    return win?.getMinimumSize() ?? [0, 0]
  })
  expect(size[0]).toBe(800)
  expect(size[1]).toBe(600)
})

test('window is frameless', async () => {
  const frame = await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0]
    // Frameless windows don't have native frame
    return win?.isMenuBarVisible() ?? true
  })
  // Frameless windows have no menu bar
  expect(frame).toBe(false)
})

test('titlebar renders with app name', async () => {
  const titleText = await page.locator('text=LiteEditor').first()
  await expect(titleText).toBeVisible()
})

test('window controls are present', async () => {
  // Minimize, maximize, close buttons
  const minimizeBtn = page.locator('[aria-label="Minimize"]')
  const maximizeBtn = page.locator('[aria-label="Maximize"]')
  const closeBtn = page.locator('[aria-label="Close"]')

  await expect(minimizeBtn).toBeVisible()
  await expect(maximizeBtn).toBeVisible()
  await expect(closeBtn).toBeVisible()
})

test('dark theme is applied', async () => {
  const bgColor = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim()
  })
  expect(bgColor).toBe('#0c0c0f')
})
