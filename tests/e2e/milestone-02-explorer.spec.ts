import { test, expect } from '@playwright/test'
import { launchApp, quitApp } from './helpers/electron-app'
import type { ElectronApplication, Page } from 'playwright'
import { join } from 'path'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import { homedir } from 'os'

let app: ElectronApplication
let page: Page
const testDir = join(process.cwd(), '.test-workspace')

test.beforeAll(async () => {
  // Create test workspace
  rmSync(testDir, { recursive: true, force: true })
  mkdirSync(testDir, { recursive: true })
  mkdirSync(join(testDir, 'src'))
  writeFileSync(join(testDir, 'hello.txt'), 'Hello World')
  writeFileSync(join(testDir, 'src', 'index.ts'), 'console.log("hello")')
  writeFileSync(join(testDir, 'package.json'), '{ "name": "test" }')

  // Clear any saved projectRoot so the app starts fresh (no folder opened)
  const wsFile = join(homedir(), '.liteeditor', 'workspace.json')
  try { writeFileSync(wsFile, JSON.stringify({})) } catch {}

  const launched = await launchApp()
  app = launched.app
  page = launched.page
})

test.afterAll(async () => {
  await quitApp(app)
  rmSync(testDir, { recursive: true, force: true })
})

test('activity bar is visible with icons', async () => {
  // Activity bar should have file explorer, search, git, settings icons
  const activityBar = page.locator('[title="Explorer"]')
  await expect(activityBar).toBeVisible()

  const searchBtn = page.locator('[title="Search"]')
  await expect(searchBtn).toBeVisible()

  const gitBtn = page.locator('[title="Source Control"]')
  await expect(gitBtn).toBeVisible()

  const settingsBtn = page.locator('[title="Settings"]')
  await expect(settingsBtn).toBeVisible()
})

test('shows "No folder opened" when no project', async () => {
  const noFolder = page.locator('text=No folder opened')
  await expect(noFolder).toBeVisible()
})

test('shows Open Folder button', async () => {
  const openBtn = page.getByRole('button', { name: 'Open Folder' })
  await expect(openBtn).toBeVisible()
})

test('sidebar panel switching works', async () => {
  // Click search
  await page.locator('[title="Search"]').click()
  await expect(page.locator('.text-xs.font-semibold.uppercase >> text=Search')).toBeVisible()

  // Click git
  await page.locator('[title="Source Control"]').click()
  await page.waitForTimeout(200)

  // Click settings
  await page.locator('[title="Settings"]').click()
  await expect(page.locator('.text-xs.font-semibold.uppercase >> text=Settings')).toBeVisible()

  // Click back to files
  await page.locator('[title="Explorer"]').click()
})
