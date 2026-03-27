import { defineConfig } from "tsdown";

const shared = {
  format: "cjs" as const,
  outDir: "dist-electron",
  sourcemap: true,
  outExtensions: () => ({ js: ".js" }),
};

export default defineConfig([
  {
    ...shared,
    entry: {
      main: "src/main.ts",
    },
    clean: true,
    noExternal: (id) => id.startsWith("@liteeditor/"),
  },
  {
    ...shared,
    entry: {
      preload: "src/preload.ts",
      "liteeditor-claude-preload": "src/liteeditor/claude/claude-preload.ts",
      "liteeditor-codex-preload": "src/liteeditor/codex/codex-preload.ts",
    },
  },
]);
