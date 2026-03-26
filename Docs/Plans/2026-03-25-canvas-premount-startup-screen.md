# Plan: Canvas Pre-Mount Startup Screen

## Task Description

Remove the "No Active Project" gate from the canvas. Instead, always mount a blank canvas on app open. The hero background (circuit board + Lite logo) becomes the canvas background when 0 panes exist — icon/text hide when panes are present. Pane actions (add-pane menu) require a project to be selected first via sidebar — user is alerted with a toast if they try to add a pane without a project. E2E tests target the real Electron desktop app.

## Objective

1. App opens to a blank canvas immediately — no blocking hero screen
2. Hero background visible when 0 panes, hidden when panes exist
3. Add-pane menu requires project — toast alerts if no project selected
4. E2E browser shell tests run against desktop Electron app with real WebContentsView
5. Screenshots captured at each phase for visual verification

## Problem Statement

The current flow blocks canvas interaction behind a "No Active Project" hero screen. Users can't see or interact with the canvas until they pick a project from the sidebar. This causes:
- E2E tests to fail (panes can't be created)
- Slow perceived startup (user sees a static hero instead of a ready workspace)
- The browser shell (and all pane types) can't be tested without a project

## Solution Approach

### Part 1: Canvas Always Mounts

**File:** `apps/web/src/liteeditor/App.tsx`
- Canvas is already the default `appMode` (ui-store line 44)
- Canvas is already lazy-loaded and renders when `appMode === "canvas"` (App.tsx line 651)
- The issue is likely inside the `Canvas` component itself — it probably gates content behind a project check

**File:** `apps/web/src/liteeditor/components/canvas/Canvas.tsx` (or equivalent)
- Remove any project-required gate that prevents the canvas from rendering
- Always render the canvas container, titlebar, sidebar, status bar
- The hero background (circuit board pattern) renders as the canvas background when `panes.size === 0`

### Part 2: Hero as Canvas Background

- When `panes.size === 0`: show the circuit board background + Lite logo + "No Active Project" text
- When `panes.size > 0`: hide the logo and text (CSS transition), keep the circuit board background or let it be covered by panes
- The hero content should be positioned behind panes (z-index), not blocking them

### Part 3: Add-Pane Gate

- When user clicks "+" or any add-pane menu option AND no project is selected:
  - Show a toast: "Select a project from the sidebar to start"
  - Don't create the pane
  - Optionally highlight/pulse the sidebar project section
- When a project IS selected: normal add-pane behavior

### Part 4: E2E Tests (Electron Desktop)

Rewrite `e2e/browser-shell.spec.ts` to use Playwright's Electron launcher (like `chat-pane-canvas.mjs`):
- `electron.launch({ executablePath, args: [mainJs] })`
- Real WebContentsView rendering
- Screenshot at each phase

## Relevant Files

### Must Read
| File | Purpose |
|------|---------|
| `apps/web/src/liteeditor/App.tsx` | App shell, mode switching, init flow |
| `apps/web/src/liteeditor/components/canvas/Canvas.tsx` | Canvas component — find the project gate |
| `apps/web/src/liteeditor/stores/ui-store.ts` | `appMode` default |
| `apps/web/src/liteeditor/stores/canvas-store.ts` | `addPane` — where to add the project check |
| `apps/web/src/liteeditor/stores/project-store.ts` | `activeProjectId` — the gate condition |
| `e2e/chat-pane-canvas.mjs` | Existing Electron E2E pattern to follow |

### Must Modify
| File | Change |
|------|--------|
| Canvas component | Remove project-required gate, render blank canvas always |
| Hero/welcome component | Convert to canvas background, hide when panes > 0 |
| `canvas-store.ts` `addPane` | Add project check — toast if no project |
| `e2e/browser-shell.spec.ts` | Rewrite as Electron-launch E2E |

### Must Create
| File | Purpose |
|------|---------|
| None — modify existing files | |

## Step by Step Tasks

### Task 1: Explore canvas mount gate
- Read Canvas.tsx and trace why panes don't appear without a project
- Identify the exact conditional that blocks canvas rendering

### Task 2: Remove project gate from canvas rendering
- Canvas always renders its container, titlebar, sidebar, status bar
- No conditional on `projectRoot` or `activeProjectId` for the canvas shell itself

### Task 3: Convert hero to canvas background
- The hero (circuit board + logo + text) renders behind panes at z-index 0
- When `panes.size > 0`: fade out logo/text (opacity transition)
- When `panes.size === 0`: show logo/text

### Task 4: Gate add-pane on project selection
- In `canvas-store.addPane` (or the add-pane menu handler):
  - Check `useProjectStore.getState().activeProjectId`
  - If null: fire toast "Select a project from the sidebar to start", return early
  - If set: proceed normally

### Task 5: Rewrite E2E as Electron-launch tests
- Follow `chat-pane-canvas.mjs` pattern: `electron.launch()` → `app.firstWindow()`
- Build the desktop app first (`pnpm build:desktop`)
- Test sequence:
  1. App launches → screenshot blank canvas with hero background
  2. Select a project from sidebar → screenshot canvas ready
  3. Add browser pane → screenshot browser shell with tab sidebar
  4. Cmd+T → new tab → screenshot multi-tab
  5. Cmd+Shift+E → collapse sidebar → screenshot
  6. Cmd+W → close tab → screenshot
  7. Full app final state → screenshot

## Acceptance Criteria

1. [ ] App opens directly to blank canvas (no hero blocking interaction)
2. [ ] Hero background visible when 0 panes, icon/text hidden when panes > 0
3. [ ] Clicking add-pane without a project shows toast and does not create a pane
4. [ ] After selecting a project, add-pane works normally
5. [ ] E2E tests run against Electron desktop app and produce screenshots
6. [ ] Browser shell screenshots show: tab sidebar, toolbar, multi-tab, collapse

## Validation Commands

```bash
# Build desktop app
cd C:/Projects/LiteEditor && pnpm build:desktop

# Run E2E tests
cd C:/Projects/LiteEditor && node e2e/browser-shell.mjs

# Or via Playwright
cd C:/Projects/LiteEditor && npx playwright test e2e/browser-shell.spec.ts
```

## Assumptions Made

1. The canvas component has an internal project check that prevents rendering — needs exploration to confirm
2. The hero background is a separate component that can be repositioned behind panes
3. Toast system already exists in the codebase (ToastViewport is imported in App.tsx)
4. Desktop build works (`pnpm build:desktop`) and produces `apps/desktop/dist-electron/main.js`
5. This is a startup screen — no pane functionality without a project (will expand in later plans)

## Execution Workflow

1. Create worktree (`superpowers:using-git-worktrees`)
2. Write tests (`superpowers:test-driven-development`)
3. Implement per task
4. Debug failures (`superpowers:systematic-debugging`)
5. Verify (`superpowers:verification-before-completion`)
6. Review (`superpowers:requesting-code-review`)
7. Finish branch (`superpowers:finishing-a-development-branch`)

## Notes

- Quizmaster variant: small
- This is Phase 1 of the startup screen — later plans will add welcome content, recent projects, quick actions
- The browser shell E2E tests depend on the canvas pre-mount fix landing first
- Ryan said "figure it out later" for web-mode fallback — not in scope
