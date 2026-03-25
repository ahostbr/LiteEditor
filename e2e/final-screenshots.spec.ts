import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5733";

test.describe("LiteEditor Final State Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("01 - Empty state with hero background", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "e2e/screenshots/01-empty-state-hero.png", fullPage: false });
  });

  test("02 - Sidebar expanded with projects", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "e2e/screenshots/02-sidebar-expanded.png", fullPage: false });
  });

  test("03 - Sidebar collapsed (Ctrl+B)", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    await page.keyboard.press("Control+b");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "e2e/screenshots/03-sidebar-collapsed.png", fullPage: false });
  });

  test("04 - Add pane menu (no thread)", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    // Click the + button in the titlebar
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: "e2e/screenshots/04-add-pane-menu.png", fullPage: false });
  });

  test("05 - Settings pane via sidebar", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    // Click Settings button in sidebar footer
    const settingsBtn = page.locator('button:has-text("Settings")').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: "e2e/screenshots/05-settings-pane.png", fullPage: false });
  });

  test("06 - UnifiedTitlebar with controls", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    // Capture just the top portion showing the titlebar
    await page.screenshot({
      path: "e2e/screenshots/06-unified-titlebar.png",
      clip: { x: 0, y: 0, width: 1280, height: 40 }
    });
  });

  test("07 - StatusBar at bottom", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    // Capture just the bottom portion showing the status bar
    await page.screenshot({
      path: "e2e/screenshots/07-statusbar.png",
      clip: { x: 0, y: 775, width: 1280, height: 25 }
    });
  });

  test("08 - Full app final state", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "e2e/screenshots/08-full-app-final.png", fullPage: false });
  });
});
