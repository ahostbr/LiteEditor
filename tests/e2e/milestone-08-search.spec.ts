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

test('search panel renders when clicked', async () => {
  await page.locator('[title="Search"]').click()
  await page.waitForTimeout(500)

  // Search input should be visible
  const searchInput = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first()
  await expect(searchInput).toBeVisible()
})

test('search panel has toggle buttons', async () => {
  await page.locator('[title="Search"]').click()
  await page.waitForTimeout(300)

  // Should have regex, case, whole word toggle buttons
  const buttons = page.locator('button[title]')
  const count = await buttons.count()
  // At least the sidebar buttons + search toggles
  expect(count).toBeGreaterThanOrEqual(4)
})

test('Ctrl+Shift+F opens search panel', async () => {
  // First go to files panel
  await page.locator('[title="Explorer"]').click()
  await page.waitForTimeout(200)

  // Now use keyboard shortcut
  await page.keyboard.press('Control+Shift+F')
  await page.waitForTimeout(500)

  // Search input should be visible
  const searchInput = page.locator('input[placeholder*="earch"], input[placeholder*="Search"]').first()
  const isVisible = await searchInput.isVisible().catch(() => false)
  expect(isVisible).toBe(true)
})
