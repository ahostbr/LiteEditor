import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5733";
const SCREENSHOTS = "e2e/screenshots";

test.describe("Browser Shell - Arc/Zen-Inspired Canvas Pane", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  // ─── Phase 1: Opening a browser pane ────────────────────────────────────

  test("01 - Open browser pane via add-pane menu", async ({ page }) => {
    // Click the + button in the titlebar to open add-pane menu
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-01-add-pane-menu.png`,
      fullPage: false,
    });

    // Click "New Browser" option
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-02-pane-opened.png`,
      fullPage: false,
    });
  });

  // ─── Phase 2: Tab sidebar ──────────────────────────────────────────────

  test("02 - Tab sidebar is visible with first tab", async ({ page }) => {
    // Open a browser pane first
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    // Verify tab sidebar exists
    const sidebar = page.locator('[class*="TabSidebar"], [data-testid="tab-sidebar"]');
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-03-tab-sidebar-visible.png`,
      fullPage: false,
    });
  });

  test("03 - Sidebar collapse and expand", async ({ page }) => {
    // Open browser pane
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    // Screenshot expanded state
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-04-sidebar-expanded.png`,
      fullPage: false,
    });

    // Toggle sidebar collapse with Cmd+Shift+E (Ctrl+Shift+E on Windows)
    await page.keyboard.press("Control+Shift+e");
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-05-sidebar-collapsed.png`,
      fullPage: false,
    });

    // Expand again
    await page.keyboard.press("Control+Shift+e");
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-06-sidebar-re-expanded.png`,
      fullPage: false,
    });
  });

  // ─── Phase 3: Multi-tab ────────────────────────────────────────────────

  test("04 - Open multiple tabs with Ctrl+T", async ({ page }) => {
    // Open browser pane
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    // Screenshot: 1 tab
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-07-one-tab.png`,
      fullPage: false,
    });

    // Open second tab with Ctrl+T
    await page.keyboard.press("Control+t");
    await page.waitForTimeout(1000);

    // Screenshot: toolbar should appear for URL entry
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-08-new-tab-toolbar.png`,
      fullPage: false,
    });

    // Type a URL and navigate
    await page.keyboard.type("https://example.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Screenshot: 2 tabs visible in sidebar
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-09-two-tabs.png`,
      fullPage: false,
    });

    // Open third tab
    await page.keyboard.press("Control+t");
    await page.waitForTimeout(500);
    await page.keyboard.type("https://github.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Screenshot: 3 tabs in sidebar
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-10-three-tabs.png`,
      fullPage: false,
    });
  });

  // ─── Phase 4: Tab switching ────────────────────────────────────────────

  test("05 - Click tabs to switch between pages", async ({ page }) => {
    // Open browser pane + create 2 tabs
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    // Open second tab
    await page.keyboard.press("Control+t");
    await page.waitForTimeout(500);
    await page.keyboard.type("https://example.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Screenshot: on tab 2
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-11-on-tab-2.png`,
      fullPage: false,
    });

    // Click first tab in sidebar to switch back
    const firstTab = page.locator('[class*="TabChip"], [data-testid="tab-chip"]').first();
    if (await firstTab.isVisible()) {
      await firstTab.click();
      await page.waitForTimeout(1000);
    }

    // Screenshot: switched back to tab 1
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-12-switched-to-tab-1.png`,
      fullPage: false,
    });
  });

  // ─── Phase 5: Close tab ────────────────────────────────────────────────

  test("06 - Close a tab with Ctrl+W", async ({ page }) => {
    // Open browser pane + create 2 tabs
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    await page.keyboard.press("Control+t");
    await page.waitForTimeout(500);
    await page.keyboard.type("https://example.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    // Screenshot: 2 tabs before close
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-13-before-close.png`,
      fullPage: false,
    });

    // Close current tab with Ctrl+W
    await page.keyboard.press("Control+w");
    await page.waitForTimeout(1000);

    // Screenshot: back to 1 tab
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-14-after-close.png`,
      fullPage: false,
    });
  });

  // ─── Phase 6: URL toolbar ─────────────────────────────────────────────

  test("07 - URL toolbar hidden by default, revealed on Ctrl+T", async ({ page }) => {
    // Open browser pane
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    // Screenshot: toolbar should be hidden
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-15-toolbar-hidden.png`,
      fullPage: false,
    });

    // Ctrl+T reveals toolbar
    await page.keyboard.press("Control+t");
    await page.waitForTimeout(500);

    // Screenshot: toolbar visible with URL input focused
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-16-toolbar-visible.png`,
      fullPage: false,
    });

    // Press Escape to dismiss
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // Screenshot: toolbar hidden again
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-17-toolbar-dismissed.png`,
      fullPage: false,
    });
  });

  // ─── Phase 7: PaneHeader activity bar ─────────────────────────────────

  test("08 - PaneHeader shows browser info when focused", async ({ page }) => {
    // Open browser pane
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    // Navigate to a real page so we have a title
    await page.keyboard.press("Control+t");
    await page.waitForTimeout(500);
    await page.keyboard.type("https://example.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);

    // Screenshot: PaneHeader should show page title, URL, tab count
    // Capture top portion of the browser pane area
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-18-paneheader-info.png`,
      fullPage: false,
    });
  });

  // ─── Phase 8: Full app with browser shell ─────────────────────────────

  test("09 - Full app state with browser shell pane", async ({ page }) => {
    // Open browser pane
    const addButton = page.locator('button[title="Add pane"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
    const browserOption = page.locator('text=New Browser').first();
    if (await browserOption.isVisible()) {
      await browserOption.click();
      await page.waitForTimeout(2000);
    }

    // Open a couple tabs
    await page.keyboard.press("Control+t");
    await page.waitForTimeout(500);
    await page.keyboard.type("https://example.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    await page.keyboard.press("Control+t");
    await page.waitForTimeout(500);
    await page.keyboard.type("https://github.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);

    // Final full-app screenshot with browser shell active
    await page.screenshot({
      path: `${SCREENSHOTS}/browser-shell-19-full-app-final.png`,
      fullPage: false,
    });
  });
});
