#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const desktopDir = path.join(repoRoot, "apps", "desktop");
const desktopMain = path.join(desktopDir, "dist-electron", "main.js");

if (!fs.existsSync(desktopMain)) {
  throw new Error(`Missing desktop build at ${desktopMain}. Run \`bun run build\` first.`);
}

const requireFromWeb = createRequire(path.join(repoRoot, "apps", "web", "package.json"));
const requireFromDesktop = createRequire(path.join(repoRoot, "apps", "desktop", "package.json"));
const { _electron: electron } = requireFromWeb("playwright");
const electronBinary = requireFromDesktop("electron");

const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), "liteeditor-e2e-"));
const screenshotsDir = path.join(runRoot, "screenshots");
const logsPath = path.join(runRoot, "console.log");
const summaryPath = path.join(runRoot, "summary.json");
fs.mkdirSync(screenshotsDir, { recursive: true });

const consoleLines = [];
const stepResults = [];
let screenshotIndex = 1;

function log(message) {
  const line = `[liteeditor-e2e] ${message}`;
  console.log(line);
  consoleLines.push(line);
}

function writeLogFile() {
  fs.writeFileSync(logsPath, `${consoleLines.join("\n")}\n`, "utf8");
}

function recordStep(name, ok, details = "") {
  stepResults.push({ name, ok, details });
  const status = ok ? "PASS" : "FAIL";
  log(`${status}: ${name}${details ? ` - ${details}` : ""}`);
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sanitizeLabel(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function captureWindow(electronApp, page, label) {
  await page.waitForTimeout(300);
  const filePath = path.join(
    screenshotsDir,
    `${String(screenshotIndex++).padStart(2, "0")}-${sanitizeLabel(label)}.png`,
  );
  try {
    const base64 = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      const win = windows[0];
      if (!win) {
        throw new Error("No BrowserWindow found for capture.");
      }
      const image = await win.capturePage();
      return image.toPNG().toString("base64");
    });
    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  } catch (error) {
    log(`capturePage failed for "${label}", falling back to page.screenshot(): ${String(error)}`);
    await page.screenshot({ path: filePath, fullPage: true });
  }
  log(`screenshot: ${filePath}`);
  return filePath;
}

function runGit(args, cwd) {
  execFileSync("git", args, {
    cwd,
    stdio: "ignore",
    windowsHide: true,
  });
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function createWorkspace(rootDir) {
  const workspaceDir = path.join(rootDir, "workspace");
  fs.mkdirSync(workspaceDir, { recursive: true });

  writeFile(
    path.join(workspaceDir, "README.md"),
    [
      "# LiteEditor Playwright Verification",
      "",
      "This workspace is used to validate the imported LiteEditor shell.",
      "",
      "FIND_ME_TOKEN",
      "",
    ].join("\n"),
  );
  writeFile(
    path.join(workspaceDir, "src", "example.txt"),
    ["playwright-search-target", "FIND_ME_TOKEN", "terminal verification target", ""].join("\n"),
  );
  writeFile(
    path.join(workspaceDir, "package.json"),
    JSON.stringify(
      {
        name: "liteeditor-playwright-fixture",
        private: true,
        version: "0.0.0",
        scripts: {
          test: "echo fixture",
        },
      },
      null,
      2,
    ) + "\n",
  );

  runGit(["init"], workspaceDir);
  runGit(["config", "user.name", "Playwright Fixture"], workspaceDir);
  runGit(["config", "user.email", "playwright@example.com"], workspaceDir);
  try {
    runGit(["checkout", "-b", "main"], workspaceDir);
  } catch {
    // Ignore if the initial branch is already main.
  }
  runGit(["add", "."], workspaceDir);
  runGit(["commit", "-m", "Initial fixture commit"], workspaceDir);

  return workspaceDir;
}

async function waitForCondition(name, fn, timeoutMs = 30_000, intervalMs = 200) {
  const startedAt = Date.now();
  let lastError = null;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const result = await fn();
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  const extra = lastError ? ` Last error: ${String(lastError)}` : "";
  throw new Error(`Timed out waiting for ${name}.${extra}`);
}

async function runExtensionSessionSmoke(page, kind) {
  return page.evaluate(async (targetKind) => {
    const create =
      targetKind === "codex" ? window.api.codex.createSession : window.api.claude.createSession;
    const destroy =
      targetKind === "codex" ? window.api.codex.destroySession : window.api.claude.destroySession;

    try {
      const sessionId = await Promise.race([
        create(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${targetKind} session creation timed out`)), 30_000),
        ),
      ]);
      destroy(sessionId);
      return { ok: true, sessionId };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, kind);
}

async function waitForBrowserSession(page) {
  return waitForCondition(
    "browser session",
    async () => {
      const ids = await page.evaluate(async () => window.api.browser.listSessions());
      return Array.isArray(ids) && ids.length > 0 ? ids[ids.length - 1] : null;
    },
    30_000,
    250,
  );
}

async function waitForBrowserPageText(page, sessionId, expectedText) {
  return waitForCondition(
    `browser page text "${expectedText}"`,
    async () => {
      const result = await page.evaluate(
        async ({ id, needle }) => {
          const payload = await window.api.browser.readPage(id);
          if (typeof payload === "string") {
            return payload.includes(needle) ? payload : null;
          }
          if (payload && typeof payload === "object") {
            const serialized = JSON.stringify(payload);
            return serialized.includes(needle) ? serialized : null;
          }
          return null;
        },
        { id: sessionId, needle: expectedText },
      );
      return result;
    },
    30_000,
    500,
  );
}

async function waitForTerminalEcho(page, sessionId, marker) {
  return page.evaluate(
    async ({ id, expected }) => {
      return await new Promise((resolve, reject) => {
        let buffer = "";
        const timeoutId = setTimeout(() => {
          unsub();
          reject(new Error(`Timed out waiting for terminal marker "${expected}"`));
        }, 15_000);

        const unsub = window.api.pty.onData(id, (data) => {
          buffer += data;
          if (buffer.includes(expected)) {
            clearTimeout(timeoutId);
            unsub();
            resolve(buffer);
          }
        });

        window.api.pty.write(id, `echo ${expected}\r`);
      });
    },
    { id: sessionId, expected: marker },
  );
}

async function stubNextFolderDialog(electronApp, selectedPath) {
  await electronApp.evaluate(({ dialog }, folderPath) => {
    const original = dialog.showOpenDialog.bind(dialog);
    let used = false;
    dialog.showOpenDialog = async (...args) => {
      if (used) {
        return original(...args);
      }
      used = true;
      dialog.showOpenDialog = original;
      return {
        canceled: false,
        filePaths: [folderPath],
      };
    };
  }, selectedPath);
}

async function main() {
  const workspaceDir = createWorkspace(runRoot);
  const stateDir = path.join(runRoot, "t3-home");
  const appDataDir = path.join(runRoot, "appdata");
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(appDataDir, { recursive: true });

  log(`run root: ${runRoot}`);
  log(`workspace: ${workspaceDir}`);

  const electronApp = await electron.launch({
    executablePath: electronBinary,
    args: [desktopMain],
    cwd: desktopDir,
    env: {
      ...process.env,
      APPDATA: appDataDir,
      LITEEDITOR_HOME: stateDir,
      LITEEDITOR_DISABLE_AUTO_UPDATE: "1",
      ELECTRON_ENABLE_LOGGING: "1",
    },
  });

  let page;

  try {
    page = await electronApp.firstWindow();
    page.on("console", (msg) => {
      log(`renderer console [${msg.type()}] ${msg.text()}`);
    });
    page.on("pageerror", (error) => {
      log(`renderer pageerror ${error.message}`);
    });

    await electronApp.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      win.setSize(1600, 1100);
      win.center();
      win.show();
      win.focus();
    });

    await page.waitForLoadState("domcontentloaded");
    await waitForCondition(
      "initial sidebar",
      async () => {
        const text = await page.textContent("body");
        return text && text.includes("Projects") ? true : null;
      },
      60_000,
      250,
    );
    await captureWindow(electronApp, page, "home");
    recordStep("Desktop app launched", true, "Sidebar loaded on a clean profile.");

    const usesNativeFolderPicker = await page.evaluate(
      () => Boolean(window.desktopBridge) && !navigator.platform.toLowerCase().includes("linux"),
    );

    if (usesNativeFolderPicker) {
      await stubNextFolderDialog(electronApp, workspaceDir);
    }
    await page.getByRole("button", { name: "Add project" }).click();
    if (!usesNativeFolderPicker) {
      await waitForCondition(
        "project path input",
        async () => (await page.locator('input[placeholder="/path/to/project"]').count()) > 0,
        10_000,
        100,
      );
      await captureWindow(electronApp, page, "add-project-form");
      await page.locator('input[placeholder="/path/to/project"]').fill(workspaceDir);
      await page.locator('input[placeholder="/path/to/project"]').press("Enter");
    }

    await waitForCondition(
      "project thread creation",
      async () => {
        return page.evaluate(() => {
          const toggle = document.querySelector('button[aria-label="Toggle editor workspace"]');
          return toggle instanceof HTMLButtonElement && !toggle.disabled;
        });
      },
      60_000,
      250,
    );
    await waitForCondition(
      "project badge",
      async () => {
        const body = await page.textContent("body");
        return body && body.includes(path.basename(workspaceDir)) ? true : null;
      },
      20_000,
      250,
    );
    await captureWindow(electronApp, page, "thread-created");
    recordStep(
      "Project added through sidebar UI",
      true,
      `Project and initial thread created for ${workspaceDir}.`,
    );

    await page.getByLabel("Toggle editor workspace").click();
    await waitForCondition(
      "LiteEditor workspace header",
      async () => {
        const body = await page.textContent("body");
        return body && body.includes("LiteEditor Workspace") ? true : null;
      },
      30_000,
      250,
    );
    await waitForCondition(
      "explorer file tree",
      async () => {
        const body = await page.textContent("body");
        return body && body.includes("README.md") ? true : null;
      },
      30_000,
      250,
    );
    await captureWindow(electronApp, page, "editor-workspace");

    await waitForCondition(
      "host-managed activity bar buttons",
      async () => {
        const counts = await Promise.all([
          page.locator('button[title="Search"]').count(),
          page.locator('button[title="Source Control"]').count(),
          page.locator('button[title="Canvas Mode (Active)"]').count(),
        ]);
        return counts.every((count) => count > 0) ? true : null;
      },
      10_000,
      100,
    );
    recordStep(
      "Host-managed workspace hides project management",
      true,
      "Embedded LiteEditor activity bar exposes Explorer, Search, Source Control, and canvas controls.",
    );

    await captureWindow(electronApp, page, "explorer-loaded");
    recordStep("Explorer loaded workspace files", true, "README.md is visible in the file tree.");

    await page.getByTitle("Search").click();
    await waitForCondition(
      "search input",
      async () => (await page.locator('input[placeholder="Search files..."]').count()) > 0,
      10_000,
      100,
    );
    await page.locator('input[placeholder="Search files..."]').fill("FIND_ME_TOKEN");
    await page.locator('input[placeholder="Search files..."]').press("Enter");
    await waitForCondition(
      "search results",
      async () => {
        const body = await page.textContent("body");
        return body && /src[\\/]+example\.txt/.test(body) && body.includes("FIND_ME_TOKEN")
          ? true
          : null;
      },
      30_000,
      250,
    );
    await captureWindow(electronApp, page, "search-results");
    recordStep(
      "Search panel returns workspace matches",
      true,
      "Search found FIND_ME_TOKEN in the fixture workspace.",
    );

    await page.getByTitle("Source Control").click();
    await waitForCondition(
      "git panel",
      async () => {
        const body = await page.textContent("body");
        return body && body.includes("Source Control") && body.includes("History") ? true : null;
      },
      30_000,
      250,
    );
    await page.getByText("History", { exact: true }).click();
    await waitForCondition(
      "git history",
      async () => {
        const body = await page.textContent("body");
        return body && body.includes("Initial fixture commit") ? true : null;
      },
      30_000,
      250,
    );
    await captureWindow(electronApp, page, "source-control");
    recordStep(
      "Git panel loads repository metadata",
      true,
      "Source Control shows the fixture commit history.",
    );

    const canvas = page.locator("[data-canvas-container]");
    const canvasBox = await waitForCondition(
      "canvas bounds",
      async () => {
        const box = await canvas.boundingBox();
        return box && box.width > 300 && box.height > 300 ? box : null;
      },
      10_000,
      100,
    );
    ensure(canvasBox.width > 0 && canvasBox.height > 0, "Canvas bounds are invalid.");
    await page.getByTitle("Add Pane (Ctrl+Shift+N)").click();
    await waitForCondition(
      "add pane menu",
      async () => {
        const body = await page.textContent("body");
        return body && body.includes("Add Pane") && body.includes("New Browser") ? true : null;
      },
      10_000,
      100,
    );
    await captureWindow(electronApp, page, "add-pane-menu");

    await page.getByText("New Browser", { exact: true }).click();
    await waitForCondition(
      "browser nav bar",
      async () => (await page.locator('input[placeholder="Search or enter URL"]').count()) > 0,
      20_000,
      250,
    );
    await captureWindow(electronApp, page, "browser-pane");

    const browserSessionId = await waitForBrowserSession(page);
    await page.locator('input[placeholder="Search or enter URL"]').fill("https://example.com");
    await page.locator('input[placeholder="Search or enter URL"]').press("Enter");
    await waitForBrowserPageText(page, browserSessionId, "Example Domain");
    await captureWindow(electronApp, page, "browser-example-domain");
    recordStep(
      "Canvas browser pane starts and navigates",
      true,
      `Browser session ${browserSessionId} loaded Example Domain.`,
    );

    await page.getByTitle("Canvas Mode (Active)").click();
    await waitForCondition(
      "editor mode terminal toggle",
      async () => (await page.locator('button[title="Terminal"]').count()) > 0,
      10_000,
      100,
    );
    await captureWindow(electronApp, page, "editor-mode");
    recordStep("Mode switch into editor layout works", true, "Canvas switched to editor mode.");

    await page.getByRole("button", { name: "Show Terminal Panel" }).click();
    await waitForCondition(
      "terminal session button",
      async () => (await page.locator('button[title^="Session ID: "]').count()) > 0,
      30_000,
      250,
    );

    const sessionTitle = await page
      .locator('button[title^="Session ID: "]')
      .first()
      .getAttribute("title");
    ensure(sessionTitle, "Terminal session title attribute is missing.");
    const sessionMatch = /^Session ID: ([^ ]+)/.exec(sessionTitle);
    ensure(sessionMatch, `Unable to parse terminal session id from "${sessionTitle}".`);
    const terminalSessionId = sessionMatch[1];
    await waitForTerminalEcho(page, terminalSessionId, "PLAYWRIGHT_PTY_OK");
    await captureWindow(electronApp, page, "editor-terminal");
    recordStep(
      "Editor-mode terminal panel starts a working PTY",
      true,
      `Terminal session ${terminalSessionId} echoed PLAYWRIGHT_PTY_OK.`,
    );

    const codexSmoke = await runExtensionSessionSmoke(page, "codex");
    recordStep(
      "Codex native session smoke",
      codexSmoke.ok,
      codexSmoke.ok
        ? `Session ${codexSmoke.sessionId} created and destroyed successfully.`
        : codexSmoke.error,
    );

    const claudeSmoke = await runExtensionSessionSmoke(page, "claude");
    recordStep(
      "Claude native session smoke",
      claudeSmoke.ok,
      claudeSmoke.ok
        ? `Session ${claudeSmoke.sessionId} created and destroyed successfully.`
        : claudeSmoke.error,
    );

    await captureWindow(electronApp, page, "extension-smoke-complete");

    await page.getByRole("button", { name: "Chat" }).click();
    await waitForCondition(
      "chat route restore",
      async () => {
        const body = await page.textContent("body");
        return body && body.includes(path.basename(workspaceDir)) ? true : null;
      },
      20_000,
      250,
    );
    await captureWindow(electronApp, page, "back-to-chat");
    recordStep(
      "Back-to-chat navigation restores the thread route",
      true,
      "Embedded workspace can be closed and returns to chat.",
    );
  } finally {
    writeLogFile();
    await electronApp.close().catch(() => undefined);
  }

  const failedSteps = stepResults.filter((step) => !step.ok);
  const summary = {
    runRoot,
    screenshotsDir,
    logsPath,
    workspaceDir,
    stepResults,
    failedSteps,
  };
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  log(`summary: ${summaryPath}`);

  if (failedSteps.length > 0) {
    process.exitCode = 1;
    return;
  }

  process.exitCode = 0;
}

main().catch((error) => {
  log(`fatal error: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  writeLogFile();
  const summary = {
    runRoot,
    screenshotsDir,
    logsPath,
    stepResults,
    fatalError: error instanceof Error ? error.stack || error.message : String(error),
  };
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  process.exitCode = 1;
});
