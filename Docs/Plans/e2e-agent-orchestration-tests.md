# Plan: E2E Tests for Agent Orchestration System

## Task Description

Create 10-15 Playwright E2E tests with screenshots verifying the agent orchestration system in LiteEditor's Electron app. Tests are UI-driven (AddPaneMenu clicks), use persisted Claude OAuth for MCP auth, and capture screenshots at each verification phase.

## Objective

- Verify all agent orchestration features work end-to-end in the real Electron app
- Screenshot evidence at every phase for visual regression and review
- Tests runnable from external terminal (`npx playwright test`)
- Gate: AgentBridge must be alive before UI tests proceed

## Problem Statement

The agent orchestration system (AgentBridge, panel CRUD, session registry, MCP server, Claude integration) was just built across 5 phases. No E2E tests exist. We need confidence that panes actually appear in the UI, endpoints respond correctly, and the MCP server advertises tools to Claude's webview.

## Solution Approach

Playwright with `electron.launch()` — launch LiteEditor as an Electron app, interact via the renderer, take screenshots. Test flow:
1. Launch app → wait for ready
2. Verify AgentBridge HTTP server is alive (health check via fetch from main process)
3. UI-driven tests: click AddPaneMenu to create terminal, browser, chat panes
4. Verify panes render in the canvas
5. Test session registry via AgentBridge HTTP API
6. Verify MCP tools are advertised in Claude webview
7. Cleanup: close panes, verify removal

## Relevant Files

### New (to create)
| File | Purpose |
|------|---------|
| `playwright.config.ts` | Playwright config for Electron E2E |
| `e2e/agent-orchestration.spec.ts` | Main test suite |
| `e2e/helpers/electron-app.ts` | App launch/teardown helper |
| `e2e/helpers/bridge-client.ts` | HTTP client for AgentBridge API verification |
| `e2e/screenshots/` | Screenshot output directory |

### Existing (reference, read-only)
| File | Why |
|------|-----|
| `apps/desktop/src/liteeditor/services/agent-bridge.ts` | Endpoint definitions |
| `apps/desktop/src/liteeditor/services/mcp-server.ts` | MCP tool definitions |
| `apps/desktop/src/liteeditor/services/session-registry.ts` | Session types |
| `apps/web/src/liteeditor/components/canvas/AddPaneMenu.tsx` | UI selectors for menu clicks |
| `apps/web/src/liteeditor/stores/canvas-store.ts` | Pane types and state |

## Test Plan (12 tests)

### Suite 1: App Bootstrap (2 tests)
1. **app-launches** — Electron app starts, main window visible, screenshot of initial state
2. **bridge-alive** — AgentBridge HTTP server responds on port 7423 with valid token from `~/.liteeditor/bridge-token`

### Suite 2: Terminal Pane (3 tests)
3. **create-terminal-pane** — Click AddPaneMenu → Terminal, verify pane appears in canvas, screenshot
4. **terminal-receives-output** — Type a command in the terminal pane, verify output appears, screenshot
5. **close-terminal-pane** — Close the terminal pane via header button, verify it's removed from canvas, screenshot

### Suite 3: Browser Pane (2 tests)
6. **create-browser-pane** — Click AddPaneMenu → Browser, verify pane appears with address bar, screenshot
7. **browser-navigates** — Enter a URL in the browser pane, verify page loads, screenshot

### Suite 4: Session Registry (2 tests)
8. **session-registered-on-pty-create** — After creating a terminal pane, verify session appears in GET /session/list
9. **session-resolve** — Register a session with a label, resolve it by label via POST /session/resolve

### Suite 5: MCP Server (2 tests)
10. **mcp-tools-advertised** — Open Claude webview, verify get_mcp_servers returns liteeditor server with 16 tools
11. **claude-webview-loads** — Claude webview initializes with browserIntegrationSupported: true, screenshot

### Suite 6: Editor Open (1 test)
12. **editor-opens-file** — Trigger file open (via AgentBridge POST /editor/open or IPC), verify editor pane shows the file, screenshot

## Team Orchestration

You operate as the team lead and orchestrate the team to execute this plan.
You NEVER write code directly — you use Task and Agent tools to deploy team members.

### Team Members
| Role | Model | Focus |
|------|-------|-------|
| test-scaffolder | Sonnet | Create playwright.config.ts, helpers, directory structure |
| test-writer | Opus | Write all 12 test cases with screenshots |
| test-runner | Sonnet | Run tests, debug failures, fix issues |

## Step by Step Tasks

### Phase 1: Scaffold (no dependencies)
- Task 1.1: Create `playwright.config.ts` with Electron launch config
- Task 1.2: Create `e2e/helpers/electron-app.ts` — app launch/teardown, wait-for-ready
- Task 1.3: Create `e2e/helpers/bridge-client.ts` — HTTP client for AgentBridge API
- Task 1.4: Create `e2e/screenshots/.gitkeep`
- Task 1.5: Install Playwright browsers: `npx playwright install chromium`

### Phase 2: Write Tests (depends on Phase 1)
- Task 2.1: Write Suite 1 — app-launches, bridge-alive
- Task 2.2: Write Suite 2 — terminal pane create/interact/close
- Task 2.3: Write Suite 3 — browser pane create/navigate
- Task 2.4: Write Suite 4 — session registry via HTTP
- Task 2.5: Write Suite 5 — MCP tools + Claude webview
- Task 2.6: Write Suite 6 — editor opens file

### Phase 3: Run & Debug (depends on Phase 2)
- Task 3.1: Run full test suite from external terminal
- Task 3.2: Review screenshots, fix failures
- Task 3.3: Re-run until all 12 pass

## Acceptance Criteria

- [ ] `npx playwright test` runs 12 tests from external terminal
- [ ] All tests produce screenshots in `e2e/screenshots/`
- [ ] Screenshots show: app launched, bridge alive, terminal pane created, terminal output, terminal closed, browser pane created, browser navigated, session registered, session resolved, MCP tools listed, Claude webview loaded, editor opened file
- [ ] Tests pass on `feat/agent-orchestration` branch
- [ ] No tests require manual interaction (fully automated)

## Validation Commands

```bash
# Install browsers (one-time)
npx playwright install chromium

# Run all E2E tests
npx playwright test

# Run with headed mode for debugging
npx playwright test --headed

# Run specific test
npx playwright test -g "create-terminal-pane"

# View test report
npx playwright show-report
```

## Assumptions Made

- Electron binary resolved from `node_modules/.bin/electron` or via `electron` package
- App needs to build first (`npx turbo run build`) before E2E tests run
- Claude OAuth session persists in Electron's userData directory
- AgentBridge starts automatically on app boot (wired in registerLiteEditorDesktop.ts)
- AddPaneMenu has testable selectors (data-testid or accessible names)
- Tests run sequentially (not parallel) since they share one Electron instance
- External terminal required (NOT inside LiteTerminal PTY)

## Execution Workflow

1. Create worktree → 2. Write tests → 3. Implement → 4. Debug failures → 5. Verify → 6. Review → 7. Finish branch
