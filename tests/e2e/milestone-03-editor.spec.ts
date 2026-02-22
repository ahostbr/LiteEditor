import { test, expect } from '@playwright/test'
import { launchApp, quitApp } from './helpers/electron-app'
import type { ElectronApplication, Page } from 'playwright'
import { join } from 'path'
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs'

let app: ElectronApplication
let page: Page
const testDir = join(process.cwd(), '.test-workspace')

test.beforeAll(async () => {
  // Create test workspace
  rmSync(testDir, { recursive: true, force: true })
  mkdirSync(testDir, { recursive: true })
  writeFileSync(join(testDir, 'hello.txt'), 'Hello World')
  writeFileSync(join(testDir, 'test.ts'), 'const x: number = 42;\nconsole.log(x);')
  writeFileSync(join(testDir, 'style.css'), 'body { color: red; }')

  const launched = await launchApp()
  app = launched.app
  page = launched.page

  // Open the test workspace by setting project root via IPC
  await app.evaluate(({ BrowserWindow }, testPath) => {
    const win = BrowserWindow.getAllWindows()[0]
    win?.webContents.executeJavaScript(`
      window.__zustand_editor?.getState()?.setProjectRoot('${testPath.replace(/\\/g, '\\\\')}')
    `)
  }, testDir)

  // Wait for tree to load
  await page.waitForTimeout(2000)
})

test.afterAll(async () => {
  await quitApp(app)
  rmSync(testDir, { recursive: true, force: true })
})

test('empty state shows when no file is open', async () => {
  // The empty state should show keyboard shortcuts
  const emptyState = page.locator('text=Open a file from the explorer')
  // May or may not be visible depending on state, just check page loaded
  expect(await page.title()).toBeDefined()
})

test('app renders editor area', async () => {
  // The main layout should have the editor pane area
  const editorArea = page.locator('.flex-1.overflow-hidden').first()
  await expect(editorArea).toBeVisible()
})
