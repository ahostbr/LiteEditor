import { _electron as electron, type ElectronApplication, type Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app: ElectronApplication | null = null;
let page: Page | null = null;

const ELECTRON_PATH = path.resolve(
  __dirname,
  "../../apps/desktop/node_modules/.bin/electron"
);
const MAIN_JS = path.resolve(
  __dirname,
  "../../apps/desktop/dist-electron/main.js"
);

export async function launchApp(): Promise<{ app: ElectronApplication; page: Page }> {
  if (app && page) return { app, page };

  app = await electron.launch({
    executablePath: process.platform === "win32" ? ELECTRON_PATH + ".exe" : ELECTRON_PATH,
    args: [MAIN_JS],
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  });

  page = await app.firstWindow();
  await page.waitForLoadState("domcontentloaded");
  // Give the app time to fully initialize (renderer + services)
  await page.waitForTimeout(3000);

  // Wait for React app to fully mount and register window globals
  // The __createTerminalPane global is registered in a useEffect in App.tsx
  let retries = 10;
  while (retries > 0) {
    const hasGlobal = await page.evaluate(() =>
      typeof (window as any).__createTerminalPane === "function"
    );
    if (hasGlobal) break;
    await page.waitForTimeout(500);
    retries--;
  }

  return { app, page };
}

export async function closeApp(): Promise<void> {
  if (app) {
    await app.close();
    app = null;
    page = null;
  }
}

export async function screenshot(page: Page, name: string): Promise<string> {
  const dir = path.resolve(__dirname, "../screenshots");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

export function getApp(): ElectronApplication | null {
  return app;
}

export function getPage(): Page | null {
  return page;
}
