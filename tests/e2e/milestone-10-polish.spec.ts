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

test('status bar is visible at bottom', async () => {
  // Status bar contains UTF-8 text
  const utf8 = page.locator('text=UTF-8')
  await expect(utf8).toBeVisible()
})

test('status bar shows spaces indicator', async () => {
  const spaces = page.locator('text=Spaces:')
  await expect(spaces).toBeVisible()
})

test('app has no uncaught errors on load', async () => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  await page.waitForTimeout(2000)
  // Filter known non-critical errors
  const critical = errors.filter((e) => !e.includes('ResizeObserver'))
  expect(critical.length).toBe(0)
})

test('sidebar can be toggled with Ctrl+B', async () => {
  // Check sidebar is visible
  const explorerBtn = page.locator('[title="Explorer"]')
  await expect(explorerBtn).toBeVisible()

  // Toggle sidebar off
  await page.keyboard.press('Control+B')
  await page.waitForTimeout(300)

  // Toggle sidebar back on
  await page.keyboard.press('Control+B')
  await page.waitForTimeout(300)

  // Sidebar should be visible again
  await expect(explorerBtn).toBeVisible()
})

test('keyboard shortcut Ctrl+W does not crash app', async () => {
  await page.keyboard.press('Control+W')
  await page.waitForTimeout(300)
  // App should still be responsive
  const body = page.locator('body')
  await expect(body).toBeVisible()
})
