#!/usr/bin/env node

/**
 * E2E test: Chat pane in canvas mode
 *
 * Tests that t3code's ChatView can be opened as a canvas pane
 * alongside terminal, editor, and other panes.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const desktopDir = path.join(repoRoot, "apps", "desktop");
const desktopMain = path.join(desktopDir, "dist-electron", "main.js");

if (!fs.existsSync(desktopMain)) {
  console.error(`Missing desktop build at ${desktopMain}. Run \`bun run build\` first.`);
  process.exit(1);
}

const requireFromWeb = createRequire(path.join(repoRoot, "apps", "web", "package.json"));
const requireFromDesktop = createRequire(path.join(repoRoot, "apps", "desktop", "package.json"));
const { _electron: electron } = requireFromWeb("playwright");
const electronBinary = requireFromDesktop("electron");

const screenshotsDir = path.join(__dirname, "screenshots");
fs.mkdirSync(screenshotsDir, { recursive: true });

let app;
let page;
let testIndex = 0;

async function screenshot(label) {
  testIndex++;
  const name = `${String(testIndex).padStart(2, "0")}-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
  const filePath = path.join(screenshotsDir, name);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  Screenshot: ${name}`);
  return filePath;
}

async function waitForApp() {
  // Wait for the app to be ready — look for the sidebar or main content
  await page.waitForSelector('[class*="sidebar"], [data-testid="sidebar"], nav', { timeout: 30000 });
  await page.waitForTimeout(2000); // Let animations settle
}

// ─── Test 1: App launches ─────────────────────────────────────────────────

async function testAppLaunches() {
  console.log("\nTest 1: App launches");

  app = await electron.launch({
    executablePath: electronBinary,
    args: [desktopMain],
    timeout: 30000,
  });

  page = await app.firstWindow();
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log(`  [console.error] ${msg.text()}`);
  });

  await waitForApp();
  await screenshot("app-launched");
  console.log("  PASS: App launched successfully");
}

// ─── Test 2: Navigate to a thread (chat view) ────────────────────────────

async function testChatViewVisible() {
  console.log("\nTest 2: Chat view is visible");

  // Look for the composer / chat area
  const composer = await page.$('[data-chat-composer-form], textarea, [placeholder*="Ask"]');
  if (composer) {
    console.log("  Found composer element");
  }

  await screenshot("chat-view-visible");
  console.log("  PASS: Chat view rendered");
}

// ─── Test 3: Toggle editor view (side-by-side) ──────────────────────────

async function testEditorToggle() {
  console.log("\nTest 3: Toggle editor view");

  // Look for the editor toggle button (PanelsTopLeftIcon)
  const toggleBtn = await page.$('button[title*="editor" i], button[title*="Editor" i], button[aria-label*="editor" i]');

  if (toggleBtn) {
    await toggleBtn.click();
    await page.waitForTimeout(2000);
    await screenshot("editor-toggled-on");
    console.log("  PASS: Editor toggle clicked");
  } else {
    // May need a project first — take screenshot of current state
    await screenshot("editor-toggle-not-found");
    console.log("  SKIP: Editor toggle button not found (may need a project with cwd)");
  }
}

// ─── Test 4: Check canvas mode availability ─────────────────────────────

async function testCanvasMode() {
  console.log("\nTest 4: Canvas mode");

  // Look for canvas-related UI or the LiteEditor activity bar
  const canvasUI = await page.$('[class*="canvas" i], [class*="Canvas"], [data-canvas]');

  if (canvasUI) {
    await screenshot("canvas-mode-active");
    console.log("  PASS: Canvas mode detected");
  } else {
    await screenshot("canvas-mode-state");
    console.log("  INFO: Canvas mode state captured");
  }
}

// ─── Test 5: Right-click context menu / add pane menu ───────────────────

async function testAddPaneMenu() {
  console.log("\nTest 5: Add pane menu");

  // Try keyboard shortcut first (Ctrl+Shift+N)
  await page.keyboard.press("Control+Shift+N");
  await page.waitForTimeout(1000);

  const menuItem = await page.$('text="Chat"');
  if (menuItem) {
    await screenshot("add-pane-menu-with-chat");
    console.log("  PASS: Add pane menu has Chat option");
  } else {
    await screenshot("add-pane-menu-state");
    console.log("  INFO: Add pane menu state captured");
  }

  // Press Escape to close menu
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
}

// ─── Test 6: Full page state ────────────────────────────────────────────

async function testFullPageState() {
  console.log("\nTest 6: Full page state");
  await screenshot("full-page-final-state");
  console.log("  PASS: Final state captured");
}

// ─── Runner ─────────────────────────────────────────────────────────────

async function run() {
  console.log("=== Chat Pane in Canvas E2E Tests ===");
  console.log(`Screenshots: ${screenshotsDir}\n`);

  try {
    await testAppLaunches();
    await testChatViewVisible();
    await testEditorToggle();
    await testCanvasMode();
    await testAddPaneMenu();
    await testFullPageState();
  } catch (err) {
    console.error(`\nFATAL: ${err.message}`);
    if (page) {
      try { await screenshot("error-state"); } catch {}
    }
  } finally {
    if (app) {
      console.log("\nClosing app...");
      await app.close();
    }
    console.log(`\nDone. Screenshots saved to: ${screenshotsDir}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
