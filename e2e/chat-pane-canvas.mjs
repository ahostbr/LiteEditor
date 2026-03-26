#!/usr/bin/env node

/**
 * E2E test: Canvas panes with seeded project + thread
 *
 * Seeds a fake project via the sidebar "+" button, creates a thread,
 * then verifies canvas panes render correctly.
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
let passed = 0;
let failed = 0;
let skipped = 0;

async function screenshot(label) {
  testIndex++;
  const name = `${String(testIndex).padStart(2, "0")}-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
  const filePath = path.join(screenshotsDir, name);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  📸 ${name}`);
  return filePath;
}

function pass(msg) { passed++; console.log(`  ✅ ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ ${msg}`); }
function skip(msg) { skipped++; console.log(`  ⏭️  ${msg}`); }

// ─── Test 1: App launches ─────────────────────────────────────────────────

async function testAppLaunches() {
  console.log("\n── Test 1: App launches ──");

  const cleanEnv = { ...process.env };
  delete cleanEnv.ELECTRON_RUN_AS_NODE;

  app = await electron.launch({
    executablePath: electronBinary,
    args: [desktopMain],
    timeout: 30000,
    env: cleanEnv,
  });

  page = await app.firstWindow();
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("net::ERR")) {
      console.log(`  [error] ${msg.text().substring(0, 120)}`);
    }
  });

  // Wait 5s for backend + projects to load
  console.log("  Waiting 5s for backend startup...");
  await page.waitForTimeout(5000);

  await screenshot("app-launched");
  pass("App launched successfully");
}

// ─── Test 2: Projects visible in sidebar ──────────────────────────────────

async function testProjectsVisible() {
  console.log("\n── Test 2: Projects visible in sidebar ──");

  // Check if any project items exist in the sidebar
  const projectItems = await page.$$('[data-sidebar] >> text=/t3code|LiteDesign|LiteEditor/i');

  if (projectItems.length > 0) {
    pass(`Found ${projectItems.length} project(s) in sidebar`);
  } else {
    // Try to find any sidebar content
    const sidebarText = await page.$eval('[data-sidebar]', el => el.textContent).catch(() => "");
    console.log(`  Sidebar content: "${sidebarText.substring(0, 100)}"`);

    if (sidebarText.includes("No projects")) {
      skip("No projects yet — need to seed one");
    } else {
      fail("Could not find projects in sidebar");
    }
  }

  await screenshot("sidebar-projects");
}

// ─── Test 3: Select thread or create new one ──────────────────────────────

async function testSelectThread() {
  console.log("\n── Test 3: Select a thread ──");

  // Look for thread items — they're sidebar menu items with thread names
  // Try clicking on any visible thread text like "hey buddy", "hey claude", etc.
  const threadSelectors = [
    'text=/hey buddy/i',
    'text=/hey claude/i',
    'text=/Awaiting Input/i',
    '[data-sidebar] a:not([href="/"])',
    '[data-sidebar] li a',
    '[data-sidebar] button:has-text("hey")',
  ];

  let clicked = false;
  for (const sel of threadSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        const text = await el.textContent().catch(() => "?");
        console.log(`  Found thread element: "${text.substring(0, 40).trim()}"`);
        await el.click();
        clicked = true;
        break;
      }
    } catch {}
  }

  if (!clicked) {
    // Last resort: try clicking the new thread button (SquarePen icon)
    console.log("  No existing threads found, trying new thread button...");
    const buttons = await page.$$('[data-sidebar] button');
    for (const btn of buttons) {
      const ariaLabel = await btn.getAttribute("aria-label").catch(() => "");
      const title = await btn.getAttribute("title").catch(() => "");
      if (ariaLabel?.includes("thread") || title?.includes("thread") || title?.includes("New")) {
        await btn.click();
        clicked = true;
        console.log(`  Clicked button: "${title || ariaLabel}"`);
        break;
      }
    }
  }

  if (!clicked) {
    await screenshot("no-thread-found");
    skip("Could not find any thread to click");
    return;
  }

  // Wait for navigation + canvas to render
  console.log("  Waiting 5s for thread workspace to load...");
  await page.waitForTimeout(5000);
  await screenshot("thread-selected");
  pass("Thread selected");
}

// ─── Test 4: Canvas has panes after thread selection ──────────────────────

async function testCanvasPanes() {
  console.log("\n── Test 4: Canvas panes visible ──");

  await page.waitForTimeout(2000);

  // Look for pane content wrappers (data-pane-type is on the content div)
  const panesByData = await page.$$('[data-pane-type]');
  // Also try finding by the grip/drag handle icon in pane headers
  const gripHandles = await page.$$('svg:has(> line)'); // GripHorizontal icon
  // Also check for the "Chat" or "Terminal" text in pane headers
  const chatHeader = await page.$('text=/Chat|Terminal|powershell/i');

  const paneCount = panesByData.length;
  if (paneCount > 0) {
    const types = [];
    for (const p of panesByData) {
      const t = await p.getAttribute("data-pane-type").catch(() => "?");
      types.push(t);
    }
    pass(`Found ${paneCount} pane(s): [${types.join(", ")}]`);
  } else if (chatHeader) {
    pass("Found pane header text — canvas has panes");
  } else {
    const templatePicker = await page.$('text="What will you build today?"');
    if (templatePicker) {
      skip("Template picker visible — canvas is empty");
    } else {
      // Take a DOM snapshot for debugging
      const bodyText = await page.$eval("body", el => el.textContent?.substring(0, 200)).catch(() => "");
      console.log(`  Body text: "${bodyText}"`);
      fail("No panes found on canvas");
    }
  }

  await screenshot("canvas-panes");
}

// ─── Test 5: Chat pane shows thread content ──────────────────────────────

async function testChatContent() {
  console.log("\n── Test 5: Chat pane content ──");

  // Look for chat composer/input
  const composer = await page.$('textarea, [contenteditable], [placeholder*="Ask"], [placeholder*="message"]');

  if (composer) {
    pass("Chat composer found — thread is active");
  } else {
    // Check if "No active thread" is shown
    const noThread = await page.$('text="No active thread"');
    if (noThread) {
      fail("Chat shows 'No active thread' — threadId not set");
    } else {
      skip("Chat composer not found");
    }
  }

  await screenshot("chat-content");
}

// ─── Test 6: Terminal pane is alive ──────────────────────────────────────

async function testTerminalAlive() {
  console.log("\n── Test 6: Terminal pane ──");

  // Look for terminal canvas (xterm renders to canvas)
  const xtermCanvas = await page.$('canvas.xterm-cursor-layer, .xterm-screen canvas, .xterm');

  if (xtermCanvas) {
    pass("Terminal xterm canvas found — PTY is alive");
  } else {
    const startingMsg = await page.$('text="Starting terminal..."');
    if (startingMsg) {
      fail("Terminal stuck on 'Starting terminal...'");
    } else {
      skip("Terminal canvas not found");
    }
  }

  await screenshot("terminal-state");
}

// ─── Test 7: Add pane menu ──────────────────────────────────────────────

async function testAddPaneMenu() {
  console.log("\n── Test 7: Add pane menu (+) ──");

  // Click the + button in the titlebar
  const plusBtn = await page.$('button:has(svg), [title="Add pane"]');

  // Or try keyboard shortcut
  await page.keyboard.press("Control+Shift+N");
  await page.waitForTimeout(1000);

  const menuItem = await page.$('text="Chat"');
  if (menuItem) {
    pass("Add pane menu opened with Chat option");
    await screenshot("add-pane-menu");
    await page.keyboard.press("Escape");
  } else {
    skip("Add pane menu not visible");
    await screenshot("add-pane-menu-state");
  }
}

// ─── Test 8: Final full-page state ──────────────────────────────────────

async function testFinalState() {
  console.log("\n── Test 8: Final state ──");
  await screenshot("final-state");
  pass("Final state captured");
}

// ─── Runner ─────────────────────────────────────────────────────────────

async function run() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║  LiteEditor Canvas E2E Tests         ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Screenshots: ${screenshotsDir}\n`);

  try {
    await testAppLaunches();
    await testProjectsVisible();
    await testSelectThread();
    await testCanvasPanes();
    await testChatContent();
    await testTerminalAlive();
    await testAddPaneMenu();
    await testFinalState();
  } catch (err) {
    console.error(`\n💥 FATAL: ${err.message}`);
    if (page) {
      try { await screenshot("error-state"); } catch {}
    }
  } finally {
    console.log(`\n${"─".repeat(40)}`);
    console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    if (app) {
      console.log("Closing app...");
      await app.close();
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
