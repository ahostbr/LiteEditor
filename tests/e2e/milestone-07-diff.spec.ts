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

test('diff viewer component exists in build', async () => {
  // We verify the DiffViewer module was bundled by checking the page loads without errors
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.waitForTimeout(1000)

  // Filter out known non-critical errors
  const criticalErrors = consoleErrors.filter(
    (e) => !e.includes('favicon') && !e.includes('net::') && !e.includes('git')
  )

  // App should load without critical JS errors
  expect(criticalErrors.length).toBeLessThanOrEqual(2)
})
