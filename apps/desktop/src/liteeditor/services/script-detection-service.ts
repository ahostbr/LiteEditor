// @ts-nocheck
import { readFile } from "fs/promises";
import { join } from "path";

const DEV_SERVER_KEYWORDS = ["dev", "start", "serve", "watch", "preview"];

export interface DetectedScript {
  id: string;
  name: string;
  command: string;
  source: "package.json" | "makefile" | "custom";
  icon: "play" | "build" | "test" | "lint" | "configure" | "debug" | "rocket" | "custom";
  autoDetected: boolean;
  isDevServer: boolean;
}

function inferIcon(name: string): DetectedScript["icon"] {
  const n = name.toLowerCase();
  if (n.includes("dev") || n.includes("start") || n.includes("serve")) return "play";
  if (n.includes("build") || n.includes("compile")) return "build";
  if (n.includes("test") || n.includes("spec")) return "test";
  if (n.includes("lint") || n.includes("check") || n.includes("format")) return "lint";
  if (n.includes("debug") || n.includes("inspect")) return "debug";
  if (n.includes("deploy") || n.includes("release") || n.includes("publish")) return "rocket";
  if (n.includes("config") || n.includes("setup") || n.includes("init")) return "configure";
  return "custom";
}

export class ScriptDetectionService {
  async detectScripts(projectRoot: string): Promise<DetectedScript[]> {
    const scripts: DetectedScript[] = [];

    // package.json
    try {
      const content = await readFile(join(projectRoot, "package.json"), "utf-8");
      const pkg = JSON.parse(content);
      if (pkg.scripts && typeof pkg.scripts === "object") {
        // Detect package manager
        let runner = "npm run";
        try {
          await readFile(join(projectRoot, "pnpm-lock.yaml"), "utf-8");
          runner = "pnpm";
        } catch {
          try {
            await readFile(join(projectRoot, "yarn.lock"), "utf-8");
            runner = "yarn";
          } catch {
            /* npm default */
          }
        }

        for (const [name, cmd] of Object.entries(pkg.scripts)) {
          const nameLower = name.toLowerCase();
          scripts.push({
            id: `pkg-${name}`,
            name,
            command: `${runner} ${name}`,
            source: "package.json",
            icon: inferIcon(name),
            autoDetected: true,
            isDevServer: DEV_SERVER_KEYWORDS.some((kw) => nameLower.includes(kw)),
          });
        }
      }
    } catch {
      /* no package.json */
    }

    return scripts;
  }
}
