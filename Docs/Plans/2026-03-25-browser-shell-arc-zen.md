# Plan: Browser Shell (Arc/Zen-Inspired) Inside LiteEditor Canvas Pane

## Why This Exists

LiteEditor's built-in browser panel is a single-page viewer — one URL per pane, no tabs, no history, no real browsing experience. Developers using the canvas need a real browser without leaving the editor. The goal is an Arc/Zen-quality browser shell that lives entirely inside a canvas pane: vertical tab sidebar, minimal chrome, split views, workspaces — a full browser that never leaks into LiteEditor's GUI.

## Task Description

Build a self-contained browser shell component that replaces the current single-session `BrowserPanel` in LiteEditor's canvas mode. The shell manages multiple `WebContentsView` sessions (tabs) within one canvas pane, with a vertical tab sidebar, minimal chrome, keyboard shortcuts, and persistent tab state across workspace switches.

## Objective

**Success criteria (measurable):**
1. User can open a browser pane, create 5+ tabs, switch between them with <100ms visual latency
2. Vertical tab sidebar collapses/expands with hotkey and hover-to-reveal
3. URL bar is hidden by default, revealed on Cmd+T or click
4. Cmd+Shift+C copies current page URL to clipboard
5. Tabs persist across workspace switches and app restarts (URLs + titles, not sessions)
6. Activity bar at bottom shows browser info (URL, title, loading) when browser pane is focused
7. Closing a browser pane destroys ALL tab sessions (no memory leaks)
8. Workspace switch destroys browser sessions for removed panes (fixes existing leak bug)
9. Zero changes to main process IPC surface — existing `browser:*` channels are sufficient

## Problem Statement

The current browser pane (`BrowserPanel`) is 1:1 — one pane, one `WebContentsView`, one URL. There's no tab management, no history navigation beyond back/forward, no way to have multiple pages open in a single browser context. Users who want to browse while coding must open separate panes for each URL, wasting canvas real estate.

## Solution Approach

### Architecture: Facade + Renderer-Owned Tab Model

```
canvas-store (pane lifecycle — knows nothing about tabs)
  --> BrowserShellPane (React component — the Facade)
        --> BrowserShellStore (new Zustand store — tabs, active index, per-pane)
              --> BrowserManager (main process — flat session map, UNCHANGED)
                    --> NativeBoundsController (bounds sync — UNCHANGED)
```

**Key decisions (from Gang of Four consultation):**

1. **WebContentsView only** — `<webview>` is deprecated, iframe blocked by CSP. Unanimous.
2. **Renderer owns tab grouping** — `BrowserShellStore` in renderer manages which sessions belong to which pane. Main process stays flat. Zero new IPC channels.
3. **Facade pattern** — Canvas-store sees one pane. Internally the shell manages N sessions. `cleanupPaneSession` routes through the Facade to destroy all tabs.
4. **Fixed sidebar gutter** — 48px collapsed, 200px expanded. Native view bounds adjust to avoid snap-on-toggle.
5. **Activity bar integration** — When browser pane has focus, activity bar displays current URL, page title, loading state. Uses existing activity bar infrastructure.

### Component Structure

```
BrowserShellPane (paneId, initialUrl)
  +-- TabSidebar (vertical, collapsible, hover-to-reveal)
  |     +-- TabChip[] (title, favicon, close button, workspace color dot)
  +-- BrowserToolbar (URL bar hidden by default, back/forward/reload)
  +-- BrowserViewport (flex-1, contains native view placeholder div)
  +-- Keyboard handler (Cmd+Shift+C, Cmd+T, Cmd+W, etc.)
```

### State Shape

```typescript
// New store: browser-shell-store.ts
interface BrowserShellState {
  panes: Map<string, {
    tabs: BrowserTab[];
    activeTabIndex: number;
    sidebarCollapsed: boolean;
  }>;
}

interface BrowserTab {
  id: string;           // tab ID (stable)
  sessionId: string | null;  // WebContentsView session (ephemeral)
  url: string;
  title: string;
  favicon?: string;
  workspaceColor?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}
```

### Persistence

`PersistedPane` gains:
```typescript
browserTabs?: Array<{ url: string; title: string; workspaceColor?: string }>;
browserActiveTabIndex?: number;
browserSidebarCollapsed?: boolean;
```

Session IDs are NOT persisted. On restore, `BrowserShellPane` creates fresh `WebContentsView` sessions for each tab URL.

## Fact Dependencies

| Fact | Confidence | Impact if Wrong |
|------|-----------|-----------------|
| WebContentsView is the correct Electron API | HIGH | Plan is invalid — would need complete rewrite |
| Existing IPC surface is sufficient (no new channels) | HIGH | Low — can add channels if needed, but analysis shows current ones work |
| Renderer-owned tab grouping avoids race conditions | MED | Medium — may need main-process `BrowserShellManager` if tab-switch flicker appears |
| Activity bar can display contextual info per focused pane | MED | Low — worst case, info goes in the shell's own chrome |
| Workspace-switch leak is caused by `setPanes()` bypassing cleanup | HIGH | Low — fix is straightforward regardless of root cause |
| `NativeBoundsController` handles sidebar gutter without changes | MED | Medium — may need minor extension for gutter-aware bounds |
| Canvas-store's `PersistedPane` can be extended with new fields | HIGH | Low — already done for terminal multi-tab |

## Relevant Files

### Must Modify
| File | Change |
|------|--------|
| `apps/web/src/liteeditor/components/canvas/CanvasPanelRenderer.tsx` | Replace `BrowserPanel` + `BrowserNavBar` with `BrowserShellPane` |
| `apps/web/src/liteeditor/stores/canvas-store.ts` | Extend `CanvasPaneState` with `browserShellState`, update `PersistedPane` |
| `apps/web/src/liteeditor/lib/session-cleanup.ts` | Route browser pane cleanup through shell store (destroy all tabs) |
| `apps/web/src/liteeditor/stores/workspace-store.ts` | Fix `restoreWorkspacePanes` to cleanup removed panes before `setPanes()` |

### Must Create
| File | Purpose |
|------|---------|
| `apps/web/src/liteeditor/stores/browser-shell-store.ts` | New Zustand store for per-pane tab management |
| `apps/web/src/liteeditor/components/canvas/BrowserShellPane.tsx` | Main shell component (Facade) |
| `apps/web/src/liteeditor/components/canvas/TabSidebar.tsx` | Vertical tab sidebar with collapse/hover |
| `apps/web/src/liteeditor/components/canvas/BrowserToolbar.tsx` | Minimal URL bar + nav buttons |

### No Changes Required
| File | Reason |
|------|--------|
| `apps/desktop/src/liteeditor/services/browser-manager.ts` | Flat session map is correct as-is |
| `apps/desktop/src/liteeditor/ipc/browser-handlers.ts` | Existing IPC channels are sufficient |
| `apps/web/src/liteeditor/lib/native-bounds-controller.ts` | One registered key per visible view already works |
| `apps/desktop/src/liteeditor/services/native-view-bounds.ts` | `toContentBounds()` unchanged |

## Team Orchestration

You operate as the team lead and orchestrate the team to execute this plan.
You NEVER write code directly — you use Task and Task* tools to deploy team members.

### Team Members (k-spawnteam feature-dev)

| Name | Model | Role | File Ownership |
|------|-------|------|----------------|
| **architect** | Opus (plan-mode) | Design `BrowserShellStore` interface, define Facade contract, review all PRs | Owns store interface design, no direct file edits |
| **implementer-1** | Sonnet | Renderer: `BrowserShellStore`, `BrowserShellPane`, `BrowserToolbar` | `browser-shell-store.ts`, `BrowserShellPane.tsx`, `BrowserToolbar.tsx` |
| **implementer-2** | Sonnet | Renderer: `TabSidebar`, canvas-store integration, persistence, activity bar | `TabSidebar.tsx`, `canvas-store.ts`, `CanvasPanelRenderer.tsx`, `session-cleanup.ts` |
| **reviewer** | Sonnet | Review all code against GoF architecture, check for anti-patterns | Read-only review of all files |

## Step by Step Tasks

### Phase 0: Prerequisites (Sequential)

**Task 0.1: Fix workspace-switch session leak**
- In `workspace-store.ts`, before `canvas.setPanes(currentPanes)`, iterate removed panes and call `cleanupPaneSession` for each
- This is a standalone bug fix that must land first
- **Owner:** implementer-2
- **Acceptance:** Switching workspaces destroys browser `WebContentsView` sessions for removed panes

### Phase 1: Store Foundation (Parallel after 0.1)

**Task 1.1: Create `browser-shell-store.ts`**
- Implement `BrowserShellState` interface with `openTab`, `closeTab`, `activateTab`, `updateTab`, `destroyPane`
- `openTab` calls `window.api.browser.createView(url)` and stores the session ID
- `closeTab` calls `window.api.browser.destroyView(sessionId)`
- `activateTab` calls `showView(new)` + `hideView(old)` + `setBounds(new, rect)`
- `destroyPane` iterates all tabs and destroys each session
- Wire `browser:state-update` IPC listener to route per-tab by session ID
- **Owner:** implementer-1
- **Blocked by:** Task 0.1
- **Acceptance:** Store can create 5 tabs, switch between them, destroy all on pane close

**Task 1.2: Extend `CanvasPaneState` and `PersistedPane`**
- Add `browserShellState` to `CanvasPaneState` (or new optional fields for tab list)
- Add `browserTabs`, `browserActiveTabIndex`, `browserSidebarCollapsed` to `PersistedPane`
- Update `cleanupPaneSession` to call `browserShellStore.destroyPane(paneId)` for browser panes
- **Owner:** implementer-2
- **Blocked by:** Task 0.1
- **Acceptance:** Browser pane state serializes/deserializes tab URLs across workspace save/load

### Phase 2: Components (Parallel after Phase 1)

**Task 2.1: Build `BrowserShellPane.tsx`**
- The Facade component: renders TabSidebar + BrowserToolbar + BrowserViewport
- Manages N `WebContentsView` sessions via `BrowserShellStore`
- BrowserViewport renders invisible placeholder `<div ref={containerRef}>` for NativeBoundsController
- Active tab's session ID registered with NativeBoundsController
- Keyboard shortcuts: Cmd+Shift+C (copy URL), Cmd+T (new tab), Cmd+W (close tab)
- On mount with `initialUrl`: creates first tab. On mount with `browserTabs` from persistence: restores tabs.
- **Owner:** implementer-1
- **Blocked by:** Task 1.1
- **Acceptance:** Component renders, creates tabs, switches between them, active tab's WebContentsView tracks the placeholder div's bounds

**Task 2.2: Build `TabSidebar.tsx`**
- Vertical tab list, each tab shows: favicon, title (truncated), close button
- Collapsible: 200px expanded / 48px collapsed (icon strip)
- Hover-to-reveal: on hover over collapsed sidebar, expand with slight delay
- Hotkey toggle (configurable, default Cmd+Shift+E)
- Optional workspace color dot per tab
- Click tab to switch (`browserShellStore.activateTab`)
- Right-click context menu: Close, Close Others, Duplicate, Copy URL
- **Owner:** implementer-2
- **Blocked by:** Task 1.1, Task 1.2
- **Acceptance:** Sidebar renders, tabs are clickable, collapse/expand works, hover-to-reveal works

**Task 2.3: Build `BrowserToolbar.tsx`**
- Minimal chrome: hidden by default, revealed on Cmd+T or click
- URL input with autocomplete from history
- Back, Forward, Reload buttons (reading `canGoBack`/`canGoForward` from shell store)
- Page loading indicator
- **Owner:** implementer-1
- **Blocked by:** Task 1.1
- **Acceptance:** URL bar appears on Cmd+T, navigates on Enter, hides after navigation

### Phase 3: Integration (Sequential after Phase 2)

**Task 3.1: Wire into `CanvasPanelRenderer.tsx`**
- Replace the `pane.type === "browser"` branch: remove `BrowserNavBar` + `BrowserPanel`, render `BrowserShellPane`
- Pass `paneId`, `initialUrl` (from `browserUrl` or first tab in `browserTabs`)
- **Owner:** implementer-2
- **Blocked by:** Task 2.1, Task 2.2

**Task 3.2: Activity bar integration**
- When browser pane has focus, display in activity bar: current page title, URL (truncated), loading spinner, tab count
- Use existing activity bar infrastructure (or extend if needed)
- **Owner:** implementer-2
- **Blocked by:** Task 3.1
- **Acceptance:** Activity bar shows browser info when browser pane is focused, reverts when focus changes

**Task 3.3: Persistence round-trip**
- Verify: open browser pane with 3 tabs → switch workspace → switch back → tabs restored
- Verify: open browser pane with 3 tabs → close app → reopen → tabs restored at saved URLs
- Fix any issues in the save/restore path
- **Owner:** implementer-1
- **Blocked by:** Task 3.1
- **Acceptance:** Full round-trip works for workspace switch AND app restart

### Phase 4: Review (Sequential after Phase 3)

**Task 4.1: Architecture review**
- Reviewer checks all code against GoF consensus:
  - No generic `MultiViewPane` abstraction (Rule of Three)
  - No Factory pattern for tab creation
  - No Composite tree for future splits (flat array only)
  - Facade boundary intact (canvas-store doesn't know about tabs)
  - Session cleanup covers all paths (pane close, workspace switch, app shutdown)
  - No IPC changes to main process
- **Owner:** reviewer
- **Blocked by:** Task 3.3

## Acceptance Criteria

1. [ ] Browser pane opens with one tab, user can add tabs via Cmd+T
2. [ ] Vertical tab sidebar shows all tabs, click to switch, close button works
3. [ ] Sidebar collapses/expands with hotkey and hover-to-reveal
4. [ ] URL bar hidden by default, appears on Cmd+T
5. [ ] Cmd+Shift+C copies current page URL
6. [ ] Activity bar shows browser info when pane focused
7. [ ] Tabs persist across workspace switches
8. [ ] Tabs persist across app restarts (URLs + titles)
9. [ ] Closing pane destroys all WebContentsView sessions
10. [ ] Workspace switch destroys sessions for removed panes (leak fix)
11. [ ] No changes to `browser-manager.ts` or `browser-handlers.ts`
12. [ ] No changes to `native-bounds-controller.ts` or `native-view-bounds.ts`

## Validation Commands

```bash
# Build check
cd C:/Projects/LiteEditor && pnpm build

# Type check
cd C:/Projects/LiteEditor && pnpm typecheck

# Unit tests (if added)
cd C:/Projects/LiteEditor && pnpm test

# Manual validation checklist:
# 1. Open canvas mode, add browser pane
# 2. Navigate to google.com, Cmd+T → github.com, Cmd+T → youtube.com
# 3. Click tabs in sidebar to switch — verify <100ms visual switch
# 4. Collapse sidebar with hotkey — verify pane expands
# 5. Hover collapsed sidebar — verify expand on hover
# 6. Cmd+Shift+C — verify URL in clipboard
# 7. Check activity bar shows current page title
# 8. Switch workspace and back — verify tabs restored
# 9. Close browser pane — verify no WebContentsView leak in DevTools
# 10. Restart app — verify tabs restored from persistence
```

## Remaining Uncertainties

| Uncertainty | Risk | Mitigation |
|-------------|------|------------|
| Tab-switch flicker (show/hide race) | MED | Sequence hide→setBounds→show in store action. If still visible, add main-process `BrowserShellManager` in v2 |
| Sidebar hover delay tuning | LOW | Start with 300ms delay, adjust based on feel |
| Activity bar API may need extension | LOW | If current activity bar can't display custom content per pane, add a slot |
| NativeBoundsController gutter math | LOW | May need to offset bounds by sidebar width — test empirically |
| Favicon retrieval | LOW | `page-favicon-updated` event may not fire for all sites — graceful fallback to first letter |

## Execution Workflow

1. Create worktree (`superpowers:using-git-worktrees`)
2. Write tests for store lifecycle (`superpowers:test-driven-development`)
3. Implement per phase (`superpowers:subagent-driven-development`)
4. Debug failures systematically (`superpowers:systematic-debugging`)
5. Verify each task before marking done (`superpowers:verification-before-completion`)
6. Request code review (`superpowers:requesting-code-review`)
7. Finish branch (`superpowers:finishing-a-development-branch`)

## Execution Echo

After implementing this plan, revisit:
- Did the plan succeed as written?
- What assumptions turned out to be wrong?
- What question, if asked during planning, would have changed the plan?
- Did the 4-teammate team composition work, or was it over/under-staffed?
- Was the "no main process changes" assumption correct?

## v2 Roadmap (Not In This Plan)

- Split views (side-by-side pages within browser pane)
- Full Arc Spaces (named workspace groups with separate tab sets)
- Tab hibernation (destroy hidden WebContentsViews after timeout, restore on activate)
- Tab search / command palette
- Bookmarks panel
- Download manager
- DevTools integration per tab

## Notes

- **Quizmaster variant:** v6 (Adaptive Quizmaster)
- **Domains covered:** Intent, Scope, Environment, Workflow/UX, Dependencies, Verification
- **Gang of Four consulted:** Gamma, Helm, Johnson, Vlissides — all four analyzed the architecture
- **Key insight from Theo's browser video:** Vertical real estate is king. Zen browser's sidebar is the gold standard. Cmd+Shift+C is non-negotiable. Polish in micro-interactions matters.
- **Origin:** Inspired by Arc browser from a Theo livestream screenshot — wanted the browser panel inside LiteEditor to feel like that.
