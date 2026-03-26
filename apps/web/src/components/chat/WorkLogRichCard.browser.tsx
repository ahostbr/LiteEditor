import "../../index.css";

import { page } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WorkLogRichCard } from "./WorkLogRichCard";
import type { WorkLogEntry } from "../../session-logic";

const SCREENSHOT_DIR = "e2e/screenshots";

function makeWorkEntry(
  overrides: Partial<WorkLogEntry> & { id: string },
): WorkLogEntry {
  return {
    createdAt: new Date().toISOString(),
    label: "Tool call",
    tone: "tool",
    ...overrides,
  };
}

async function mountCard(workEntry: WorkLogEntry) {
  const host = document.createElement("div");
  host.style.width = "480px";
  host.style.padding = "16px";
  host.className = "dark";
  document.body.append(host);

  const screen = await render(<WorkLogRichCard workEntry={workEntry} />, {
    container: host,
  });

  return {
    host,
    cleanup: async () => {
      await screen.unmount();
      host.remove();
    },
  };
}

describe("WorkLogRichCard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders bash output card with command, output, and exit code", async () => {
    const entry = makeWorkEntry({
      id: "bash-test-1",
      itemType: "command_execution",
      command: "npm test",
      rawPayload: {
        detail: "PASS src/lib/utils.test.ts\n  3 tests passed\n<exited with exit code 0>",
        data: {
          item: {
            command: "npm test",
            result: {
              stdout: "PASS src/lib/utils.test.ts\n  ✓ cn merges classes (2ms)\n  ✓ cn handles undefined (1ms)\n  ✓ cn handles empty (1ms)\n\nTest Suites: 1 passed, 1 total\nTests:       3 passed, 3 total",
              exit_code: 0,
              duration_ms: 1234,
            },
          },
        },
      },
    });

    const mounted = await mountCard(entry);
    try {
      // Card should render with command and output
      await page.screenshot({ path: `${SCREENSHOT_DIR}/bash-card-success.png` });

      const text = document.body.textContent ?? "";
      expect(text).toContain("$ npm test");
      expect(text).toContain("3 passed");
      expect(text).toContain("Exit 0");
      expect(text).toContain("1.2s");
    } finally {
      await mounted.cleanup();
    }
  });

  it("renders bash card with failed exit code", async () => {
    const entry = makeWorkEntry({
      id: "bash-test-2",
      itemType: "command_execution",
      command: "tsc --noEmit",
      rawPayload: {
        detail: "error TS2345: Argument of type 'string' is not assignable\n<exited with exit code 1>",
        data: {
          item: {
            command: "tsc --noEmit",
            result: {
              stdout: "src/index.ts(42,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.",
              exit_code: 1,
              duration_ms: 5600,
            },
          },
        },
      },
    });

    const mounted = await mountCard(entry);
    try {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/bash-card-failure.png` });

      const text = document.body.textContent ?? "";
      expect(text).toContain("$ tsc --noEmit");
      expect(text).toContain("Exit 1");
      expect(text).toContain("error TS2345");
    } finally {
      await mounted.cleanup();
    }
  });

  it("renders file change card with changed files list", async () => {
    const entry = makeWorkEntry({
      id: "file-change-1",
      itemType: "file_change",
      changedFiles: [
        "src/session-logic.ts",
        "src/components/chat/MessagesTimeline.tsx",
        "src/lib/workLogCardData.ts",
      ],
      rawPayload: {
        data: {
          item: {
            path: "src/session-logic.ts",
          },
        },
      },
    });

    const mounted = await mountCard(entry);
    try {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/file-change-card.png` });

      const text = document.body.textContent ?? "";
      expect(text).toContain("3 files changed");
      expect(text).toContain("src/session-logic.ts");
      expect(text).toContain("MessagesTimeline.tsx");
    } finally {
      await mounted.cleanup();
    }
  });

  it("renders file content card with expandable content", async () => {
    const entry = makeWorkEntry({
      id: "file-read-1",
      requestKind: "file-read",
      rawPayload: {
        detail: "function hello() {\n  return 'world';\n}",
        data: {
          item: {
            path: "src/utils/hello.ts",
            result: {
              content: "function hello() {\n  return 'world';\n}\n\nexport default hello;",
              totalLines: 5,
            },
          },
        },
      },
    });

    const mounted = await mountCard(entry);
    try {
      // Initially collapsed — shows path and line count
      await page.screenshot({ path: `${SCREENSHOT_DIR}/file-content-collapsed.png` });

      const text = document.body.textContent ?? "";
      expect(text).toContain("src/utils/hello.ts");
      expect(text).toContain("5 lines");

      // Click to expand
      const pathButton = page.getByText("src/utils/hello.ts");
      await pathButton.click();

      await page.screenshot({ path: `${SCREENSHOT_DIR}/file-content-expanded.png` });

      const expandedText = document.body.textContent ?? "";
      expect(expandedText).toContain("function hello()");
      expect(expandedText).toContain("return 'world'");
    } finally {
      await mounted.cleanup();
    }
  });

  it("renders web search card", async () => {
    const entry = makeWorkEntry({
      id: "web-search-1",
      itemType: "web_search",
      rawPayload: {
        detail: "Found 3 results for 'react virtual scrolling performance'",
        data: {
          item: {
            input: {
              query: "react virtual scrolling performance",
            },
          },
        },
      },
    });

    const mounted = await mountCard(entry);
    try {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/web-search-card.png` });

      const text = document.body.textContent ?? "";
      expect(text).toContain("react virtual scrolling performance");
      expect(text).toContain("Show results");
    } finally {
      await mounted.cleanup();
    }
  });

  it("renders MCP tool card with output", async () => {
    const entry = makeWorkEntry({
      id: "mcp-tool-1",
      itemType: "mcp_tool_call",
      rawPayload: {
        title: "vault_search",
        detail: "Found 5 matching notes in vault",
        data: {
          item: {
            toolName: "vault_search",
            serverName: "lite-memory",
            result: {
              output: "Found 5 matching notes:\n1. Projects/LiteEditor.md\n2. Sessions/2026-03-25.md",
            },
          },
        },
      },
    });

    const mounted = await mountCard(entry);
    try {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/mcp-tool-card.png` });

      const text = document.body.textContent ?? "";
      expect(text).toContain("vault_search");
      expect(text).toContain("(lite-memory)");
      expect(text).toContain("Show output");
    } finally {
      await mounted.cleanup();
    }
  });

  it("returns null for entries without rawPayload", async () => {
    const entry = makeWorkEntry({
      id: "no-payload-1",
      itemType: "command_execution",
      command: "ls",
    });

    const host = document.createElement("div");
    document.body.append(host);
    const screen = await render(<WorkLogRichCard workEntry={entry} />, {
      container: host,
    });

    try {
      // Should render nothing — no rawPayload
      expect(host.textContent).toBe("");
      await page.screenshot({ path: `${SCREENSHOT_DIR}/no-payload-empty.png` });
    } finally {
      await screen.unmount();
      host.remove();
    }
  });
});
