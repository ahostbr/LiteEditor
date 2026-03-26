#!/usr/bin/env node

/**
 * E2E test: Verify panes fill the viewport when maximized
 * and that the default layout uses viewport-relative sizing.
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

const screenshotsDir = path.join(__dirname, "screenshots", "fullscreen");
fs.mkdirSync(screenshotsDir, { recursive: true });

let app, page;
let testIndex = 0;
let passed = 0, failed = 0;

async function screenshot(label) {
  testIndex++;
  const name = `${String(testIndex).padStart(2, "0")}-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
  const filePath = path.join(screenshotsDir, name);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  📸 ${name}`);
  return filePath;
}

async function run() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║  Pane Fullscreen Layout Tests         ║");
  console.log("╚══════════════════════════════════════╝\n");

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
    if (msg.type() === "error" && !msg.text().includes("net::ERR"))
      console.log(`  [err] ${msg.text().substring(0, 100)}`);
  });

  // Maximize the app window first
  const window = await app.browserWindow(page);
  await window.evaluate((win) => win.maximize());
  await page.waitForTimeout(1000);

  // Wait for backend
  console.log("Waiting 5s for backend...");
  await page.waitForTimeout(5000);

  // Get window dimensions after maximize
  const viewport = page.viewportSize() ?? { width: 1920, height: 1080 };
  console.log(`Window: ${viewport.width}x${viewport.height}\n`);

  // ── Test 1: Default layout sizing ──
  console.log("── Test 1: Default layout (welcome) ──");
  await screenshot("welcome-default");

  // Click a thread
  const threadEl = await page.$('text=/hey buddy/i');
  if (threadEl) {
    await threadEl.click();
    console.log("  Clicked thread, waiting 5s...");
    await page.waitForTimeout(5000);
  }

  await screenshot("thread-default-layout");

  // Measure pane sizes vs viewport
  const panes = await page.$$('[data-pane-type]');
  console.log(`  Panes found: ${panes.length}`);

  for (const pane of panes) {
    const type = await pane.getAttribute("data-pane-type");
    const box = await pane.boundingBox();
    if (box) {
      const widthPct = ((box.width / viewport.width) * 100).toFixed(0);
      const heightPct = ((box.height / viewport.height) * 100).toFixed(0);
      console.log(`  [${type}] ${Math.round(box.width)}x${Math.round(box.height)} (${widthPct}%W x ${heightPct}%H)`);

      if (parseInt(widthPct) < 30) {
        console.log(`  ❌ ${type} pane is only ${widthPct}% of viewport width — too small`);
        failed++;
      } else {
        console.log(`  ✅ ${type} pane fills ${widthPct}% width`);
        passed++;
      }
    }
  }

  // ── Test 2: Maximize chat pane ──
  console.log("\n── Test 2: Maximize chat pane ──");

  // Find fullscreen button — click the first one (should be on the chat pane)
  const fullscreenBtns = await page.$$('button[title="Fullscreen"]');
  console.log(`  Found ${fullscreenBtns.length} fullscreen button(s)`);
  if (fullscreenBtns.length > 0) {
    await fullscreenBtns[0].click();
    await page.waitForTimeout(2000);
    await screenshot("chat-maximized");

    // Measure maximized pane
    const maxPane = await page.$('[data-pane-type="chat"]');
    if (maxPane) {
      const box = await maxPane.boundingBox();
      if (box) {
        const widthPct = ((box.width / viewport.width) * 100).toFixed(0);
        const heightPct = ((box.height / viewport.height) * 100).toFixed(0);
        console.log(`  Maximized chat: ${Math.round(box.width)}x${Math.round(box.height)} (${widthPct}%W x ${heightPct}%H)`);

        if (parseInt(widthPct) > 80 && parseInt(heightPct) > 80) {
          console.log("  ✅ Chat fills viewport when maximized");
          passed++;
        } else {
          console.log("  ❌ Chat does NOT fill viewport when maximized");
          failed++;
        }
      }
    }

    // Un-maximize
    const restoreBtn = await page.$('button[title="Restore"]');
    if (restoreBtn) await restoreBtn.click();
    await page.waitForTimeout(500);
  } else {
    console.log("  Maximize button not found");
  }

  // ── Test 3: Open settings and maximize ──
  console.log("\n── Test 3: Settings pane maximized ──");

  // Open settings via sidebar button
  const settingsBtn = await page.$('text=/Settings/i');
  if (settingsBtn) {
    await settingsBtn.click();
    await page.waitForTimeout(2000);
    await screenshot("settings-opened");

    // Maximize settings
    const maxBtns2 = await page.$$('button[title="Fullscreen"]');
    if (maxBtns2.length > 0) {
      await maxBtns2[maxBtns2.length - 1].click(); // Last one is the newest pane
      await page.waitForTimeout(1000);
      await screenshot("settings-maximized");

      const settingsPane = await page.$('[data-pane-type="settings"]');
      if (settingsPane) {
        const box = await settingsPane.boundingBox();
        if (box) {
          const widthPct = ((box.width / viewport.width) * 100).toFixed(0);
          const heightPct = ((box.height / viewport.height) * 100).toFixed(0);
          console.log(`  Maximized settings: ${Math.round(box.width)}x${Math.round(box.height)} (${widthPct}%W x ${heightPct}%H)`);
        }
      }
    }
  }

  await screenshot("final-state");

  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  await app.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
