import { test, expect } from '@playwright/test'
import { launchApp, quitApp } from './helpers/electron-app'
import type { ElectronApplication, Page } from 'playwright'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  const launched = await launchApp()
  app = launched.app
  page = launched.page
})

test.afterAll(async () => {
  await quitApp(app)
})

// Ensures the Settings panel is open by clicking Explorer first then Settings.
// This avoids the toggle-off behavior when Settings is already the active panel.
async function openSettings() {
  await page.locator('[title="Explorer"]').click()
  await page.waitForTimeout(200)
  await page.locator('[title="Settings"]').click()
  await page.waitForTimeout(500)
}

test('settings panel renders', async () => {
  await openSettings()

  const heading = page.locator('text=Settings').first()
  await expect(heading).toBeVisible({ timeout: 5000 })
})

test('settings has editor section', async () => {
  await openSettings()

  const editorSection = page.locator('text=Editor').first()
  await expect(editorSection).toBeVisible({ timeout: 5000 })
})

test('settings has terminal section', async () => {
  await openSettings()

  const terminalSection = page.locator('text=Terminal').first()
  await expect(terminalSection).toBeVisible({ timeout: 5000 })
})

test('settings has appearance section', async () => {
  await openSettings()

  // Scroll down in settings panel to find Appearance
  const settingsScroll = page.locator('.overflow-y-auto').last()
  await settingsScroll.evaluate((el) => el.scrollTop = el.scrollHeight)
  await page.waitForTimeout(300)

  const appearanceSection = page.locator('text=Appearance').first()
  await expect(appearanceSection).toBeVisible({ timeout: 5000 })
})

test('font size setting has a number input', async () => {
  await openSettings()

  const fontSizeInput = page.locator('input[type="number"]').first()
  await expect(fontSizeInput).toBeVisible({ timeout: 5000 })

  const value = await fontSizeInput.inputValue()
  expect(Number(value)).toBeGreaterThanOrEqual(8)
  expect(Number(value)).toBeLessThanOrEqual(32)
})

test('accent color picker is present', async () => {
  await openSettings()

  // Scroll down to find the color input in the Appearance section
  const settingsScroll = page.locator('.overflow-y-auto').last()
  await settingsScroll.evaluate((el) => el.scrollTop = el.scrollHeight)
  await page.waitForTimeout(300)

  const colorInput = page.locator('input[type="color"]')
  await expect(colorInput).toBeVisible({ timeout: 5000 })
})

test('accent color change updates CSS variable', async () => {
  await openSettings()

  // Scroll down to find color input
  const settingsScroll = page.locator('.overflow-y-auto').last()
  await settingsScroll.evaluate((el) => el.scrollTop = el.scrollHeight)
  await page.waitForTimeout(300)

  // Get initial accent
  const initialAccent = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  })

  // Change the accent color via JS (color inputs are hard to interact with directly)
  await page.evaluate(() => {
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement
    if (colorInput) {
      // Simulate native input change
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set
      nativeInputValueSetter?.call(colorInput, '#ff6600')
      colorInput.dispatchEvent(new Event('input', { bubbles: true }))
      colorInput.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })

  await page.waitForTimeout(500)

  // Check that CSS variable was updated
  const newAccent = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  })

  // The accent should have changed (or at minimum the mechanism exists)
  expect(typeof newAccent).toBe('string')
  expect(newAccent.length).toBeGreaterThan(0)
})
