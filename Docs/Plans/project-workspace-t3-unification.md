# Plan: Project/Workspace T3 Code Unification

## Task Description

Complete LiteEditor's project/workspace system to match and exceed T3 Code's sidebar UX and project switching experience. Fix 6 known bugs, implement missing features, add dev server management, project scripts UI, status dots with hierarchy, pane linking, drag reorder, keyboard shortcuts, and visual polish — all while maintaining the Lite Suite design language.

## Objective

LiteEditor becomes the "bigger IDE" Theo describes — seamless multi-project switching with per-project canvas isolation, dev server management, and spatial canvas features T3 Code can't offer. Success = a user can add 3+ projects, switch between them instantly with full canvas swap, run/stop dev servers from sidebar, and have worktree-backed workspaces with linked panes.

## Problem Statement

LiteEditor's project/workspace system is ~80% complete with 6 bugs and missing features:
- **6 bugs**: orphaned worktree refs, untagged panes, stale projectRoot, fire-and-forget updates, silent canvas wipe, fragile root path props
- **Missing features**: .gitignore auto-update, worktree cleanup dialog, startup project picker, data migration
- **Missing UX**: T3-style status dots, dev server management, scripts UI, drag reorder, keyboard shortcuts, pane linking
- **Performance gap**: No optimized full canvas swap on project switch

## Solution Approach

### Architecture

Build on existing project-store and workspace-store foundations. Key additions:
1. **Script detection service** (main process) — scans package.json for runnable scripts
2. **Dev server manager** (main process) — spawns/kills long-running scripts, tracks PIDs and ports
3. **Status aggregation** (renderer) — combines git, terminal, dev server state per project
4. **Pane linking system** (canvas-store) — workspace-scoped links between terminal/editor/file explorer
5. **Canvas swap optimizer** — serialize/deserialize canvas state with terminal CSS persistence

### Data Flow

```
Sidebar ProjectEntry
  ├── Status dots (git branch, dirty, dev server running)
  ├── Scripts section (auto-detected, run/stop buttons)
  ├── WorkspaceEntry list
  │   ├── File tree (lazy loaded)
  │   └── Pane linking indicators
  └── Drag handle (reorder)

Project switch flow:
  1. Save current canvas → workspace JSON
  2. Tag all panes with current workspace ID
  3. Hide current panes (CSS display:none for terminals)
  4. Load target project's active workspace canvas
  5. Set projectRoot to target project path (or worktree path)
  6. Restore panes from workspace JSON
```

## Relevant Files

### Bug Fixes
- `src/renderer/stores/canvas-store.ts` — Bug #3 (pane tagging on creation)
- `src/renderer/stores/workspace-store.ts` — Bug #1 (stale projectRoot), Bug #6 (null canvas handling)
- `src/renderer/stores/project-store.ts` — Bug #5 (setActiveProject await)
- `src/renderer/components/sidebar/ProjectSettingsDialog.tsx` — Bug #5 (worktree removal orphan)
- `src/renderer/components/sidebar/WorkspaceEntry.tsx` — Bug #2 (root path prop)

### New Files
- `src/main/services/script-detection.ts` — Scan package.json for scripts
- `src/main/services/dev-server-manager.ts` — Spawn/kill dev server processes, track ports
- `src/main/ipc/script-handlers.ts` — IPC handlers for script detection + dev server management
- `src/renderer/stores/script-store.ts` — Scripts state per project
- `src/renderer/components/sidebar/ScriptEntry.tsx` — Script run/stop UI component
- `src/renderer/components/sidebar/StatusDot.tsx` — Reusable status indicator component
- `src/renderer/lib/pane-linking.ts` — Pane linking logic

### Modified Files
- `src/renderer/components/sidebar/ProjectEntry.tsx` — Status dots, scripts section, drag reorder
- `src/renderer/components/sidebar/ProjectSidebar.tsx` — Drag reorder container, keyboard shortcuts
- `src/renderer/components/sidebar/WorkspaceEntry.tsx` — Worktree cleanup dialog improvements
- `src/renderer/components/sidebar/WorkspaceCreateDialog.tsx` — .gitignore auto-update
- `src/renderer/components/sidebar/ProjectSettingsDialog.tsx` — Worktree cleanup on delete
- `src/renderer/stores/canvas-store.ts` — Pane tagging, pane linking
- `src/renderer/stores/workspace-store.ts` — Optimized canvas swap, error handling
- `src/renderer/stores/project-store.ts` — Drag reorder persistence, async fixes
- `src/renderer/App.tsx` — Startup project picker, keyboard shortcuts registration
- `src/preload/index.ts` — New IPC channels for scripts/dev-server
- `src/renderer/hooks/useKeyboardShortcuts.ts` — Ctrl+1-9 project switching

## Step by Step Tasks

### Phase 0: Bug Fixes (6 tasks)

**Task 0.1: Fix pane tagging on creation (Bug #3)**
- In `canvas-store.ts` `addPane()`, read `activeWorkspaceId` from workspace-store and set `workspaceId` on new pane
- Files: `src/renderer/stores/canvas-store.ts`

**Task 0.2: Fix stale projectRoot on workspace switch (Bug #1)**
- In `workspace-store.ts` `switchWorkspace()`, look up project root from project-store via `target.projectId` instead of reading from editor-store
- Files: `src/renderer/stores/workspace-store.ts`

**Task 0.3: Fix WorkspaceEntry root path (Bug #2)**
- Derive `effectivePath` from workspace entity + project-store lookup instead of parent prop
- Files: `src/renderer/components/sidebar/WorkspaceEntry.tsx`

**Task 0.4: Fix worktree removal orphan (Bug #5)**
- When removing worktree in ProjectSettingsDialog, also delete matching workspace from workspace-store
- Files: `src/renderer/components/sidebar/ProjectSettingsDialog.tsx`

**Task 0.5: Fix setActiveProject persistence (Bug #4)**
- Make `setActiveProject` async and await the IPC call
- Files: `src/renderer/stores/project-store.ts`

**Task 0.6: Fix null canvas handling on workspace load (Bug #6)**
- Add error logging and fallback (empty canvas, not silent wipe) when workspace load returns null
- Files: `src/renderer/stores/workspace-store.ts`

### Phase 1: Core Switching & Startup (4 tasks)

**Task 1.1: Optimized full canvas swap**
- Refine `switchWorkspace()` to properly serialize current canvas → JSON, clear visible panes, restore target canvas
- CSS-hide terminal panes from other workspaces (already partially implemented via `getHiddenTerminalPanes`)
- Ensure viewport position and zoom are saved/restored per workspace
- Files: `workspace-store.ts`, `canvas-store.ts`

**Task 1.2: Project switching = workspace switching**
- When user clicks a different project in sidebar, call `setActiveProject(id)` then `switchWorkspace(project.lastActiveWorkspaceId)`
- If no lastActiveWorkspaceId, create/load "Default" workspace
- Update `projectRoot` in editor-store to target project's root path
- Files: `project-store.ts`, `workspace-store.ts`, `ProjectEntry.tsx`

**Task 1.3: Startup project picker**
- On app start, show sidebar with project list (sorted: pinned first, then by lastActivity)
- Show empty canvas with "Select a project to get started" message
- When user clicks project, trigger project switch flow from Task 1.2
- Files: `App.tsx`, `ProjectSidebar.tsx`

**Task 1.4: Simple data migration**
- On first launch with new system, check for old `~/.liteeditor/workspace.json`
- If exists and projects.json is empty: create project entry from old workspace's projectRoot + Default workspace
- One-time migration, mark as completed in settings
- Files: `App.tsx` or new `src/renderer/lib/migration.ts`

### Phase 2: Dev Server & Scripts (4 tasks)

**Task 2.1: Script detection service**
- New `src/main/services/script-detection.ts`
- Scan `package.json` at project root for all `scripts` entries
- Flag known dev server scripts: names containing `dev`, `start`, `serve`, `watch`, `preview`
- Return `{ name, command, isDevServer }[]`
- Files: `src/main/services/script-detection.ts`

**Task 2.2: Dev server manager**
- New `src/main/services/dev-server-manager.ts`
- `startScript(projectId, scriptName, cwd)` — spawn child process via node-pty, track PID
- `stopScript(projectId, scriptName)` — kill process by PID
- `getRunningScripts(projectId)` — return list of running scripts with PIDs
- Emit events when process starts/stops/crashes
- Port detection: parse stdout for common patterns ("listening on port X", "localhost:XXXX", ":XXXX")
- Files: `src/main/services/dev-server-manager.ts`

**Task 2.3: Script IPC handlers**
- New `src/main/ipc/script-handlers.ts`
- Channels: `scripts:detect(rootPath)`, `scripts:start(projectId, name, cwd)`, `scripts:stop(projectId, name)`, `scripts:running(projectId)`, `scripts:on-status-change` (event)
- Register in main/index.ts
- Add to preload/index.ts
- Files: `src/main/ipc/script-handlers.ts`, `src/main/index.ts`, `src/preload/index.ts`

**Task 2.4: Script store + UI**
- New `src/renderer/stores/script-store.ts` — tracks detected scripts and running state per project
- New `src/renderer/components/sidebar/ScriptEntry.tsx` — single script row with name, run/stop button, running indicator
- Integrate into `ProjectEntry.tsx` — show scripts section when project expanded
- Auto-detect on project expand, cache results
- Files: `script-store.ts`, `ScriptEntry.tsx`, `ProjectEntry.tsx`

### Phase 3: Status Indicators (3 tasks)

**Task 3.1: StatusDot component**
- New `src/renderer/components/sidebar/StatusDot.tsx`
- Reusable dot with states: idle (gray), running (pulsing blue), success (green), warning (amber), error (red)
- Small (6px for inline), medium (8px for sidebar items)
- Uses Lite Suite color palette
- Files: `StatusDot.tsx`

**Task 3.2: Project-level status aggregation**
- In `ProjectEntry.tsx`, compute aggregate status from:
  - Git dirty state (amber dot if uncommitted changes)
  - Dev server running (green dot + port number)
  - Terminal activity (blue pulse if any terminal has recent output)
- Show highest-priority status when project is collapsed (like T3 Code's `resolveProjectStatusIndicator`)
- Priority: error > running > dirty > idle
- Files: `ProjectEntry.tsx`, `StatusDot.tsx`

**Task 3.3: Git branch + dirty state in sidebar**
- Already partially implemented (ProjectEntry fetches branch on mount)
- Add dirty state check: `git:status` IPC call → count modified files
- Show branch name + dirty indicator (dot or modified count badge)
- Refresh on file watcher events
- Files: `ProjectEntry.tsx`, add `git:is-dirty` IPC handler if needed

### Phase 4: Sidebar Visual Polish (4 tasks)

**Task 4.1: Drag reorder projects**
- Add drag-and-drop reorder to ProjectSidebar
- Pinned projects stay in top section, non-pinned in bottom
- Persist custom order to projects.json via project-store
- Use HTML5 drag API (no library dependency)
- Files: `ProjectSidebar.tsx`, `ProjectEntry.tsx`, `project-store.ts`

**Task 4.2: Worktree cleanup dialogs**
- WorkspaceEntry delete: change dialog to offer "Also remove git worktree?" for worktree-type workspaces
- ProjectSettingsDialog delete: offer "Also remove associated worktrees?" if any exist
- Files: `WorkspaceEntry.tsx`, `ProjectSettingsDialog.tsx`

**Task 4.3: .gitignore auto-update**
- In WorkspaceCreateDialog, after first worktree creation, check if `.worktrees/` is in `.gitignore`
- If not, show confirmation toast and append `.worktrees/` to `.gitignore`
- Files: `WorkspaceCreateDialog.tsx`, may need new IPC handler for .gitignore append

**Task 4.4: Hybrid visual styling**
- Apply T3 Code information density patterns with Lite Suite palette
- Compact spacing for project/workspace entries
- Subtle hover/active transitions
- Status dots integrated cleanly into entry rows
- Collapsed project shows status dot + name only
- Files: `ProjectSidebar.tsx`, `ProjectEntry.tsx`, `WorkspaceEntry.tsx`, `ScriptEntry.tsx`

### Phase 5: Keyboard Shortcuts & Pane Linking (3 tasks)

**Task 5.1: Ctrl+1-9 project switching**
- Register Ctrl+1 through Ctrl+9 as global shortcuts
- Maps to sidebar project position (pinned first, then custom/activity order)
- Show project name briefly in toast on switch
- Files: `useKeyboardShortcuts.ts` or `App.tsx`

**Task 5.2: Command palette project switching**
- Add "Switch Project: <name>" entries to command palette
- Filter as user types
- Files: command palette component (CommandCenter.tsx or equivalent)

**Task 5.3: Pane linking (terminal ↔ editor ↔ project root)**
- When workspace switches, update all terminal CWDs to match workspace's effective root path
- When terminal `cd`s, optionally update file explorer root (opt-in behavior via setting)
- Link editor tabs to workspace — tabs opened in workspace A don't show in workspace B
- Files: `canvas-store.ts`, `terminal-store.ts`, `workspace-store.ts`, `pane-linking.ts`

### Phase 6: Testing (2 tasks)

**Task 6.1: Unit tests for new stores and services**
- Test script-store: detect, start, stop, running state
- Test project-store: drag reorder, async setActiveProject
- Test workspace-store: switchWorkspace with canvas swap, error handling
- Test pane linking: workspace-scoped tab filtering
- Files: `tests/unit/stores/script-store.test.ts`, updates to existing test files

**Task 6.2: Integration smoke test**
- Manual checklist: add project → create workspace → create worktree workspace → switch between → run dev server → stop → delete workspace → delete project
- Verify no orphaned state, no EMFILE, no stale references
- Files: checklist in this plan doc

## Acceptance Criteria

1. User can add 3+ projects and switch between them with Ctrl+1/2/3 — full canvas swaps in <200ms
2. Each project shows git branch + dirty state + dev server status in sidebar
3. Dev server scripts auto-detected from package.json with run/stop buttons
4. Worktree workspaces create isolated git branches with cleanup on delete
5. `.worktrees/` auto-added to `.gitignore` on first worktree creation
6. Startup shows project picker, no auto-load
7. All 6 existing bugs fixed (verified by unit tests)
8. Drag reorder persists project order across restarts
9. Sidebar matches hybrid design: T3 density + Lite Suite palette
10. No orphaned workspace entries after worktree removal
11. Terminal panes persist across workspace switches (CSS hidden, not destroyed)
12. `pnpm run build` passes
13. `pnpm run test:unit` passes

## Validation Commands

```bash
# Build
pnpm run build

# Unit tests
pnpm run test:unit

# Verify no regressions in existing tests
pnpm run test:unit -- --reporter=verbose

# Verify script detection
# (manual: open project with package.json, check sidebar shows scripts)

# Verify project switching performance
# (manual: add 3 projects, Ctrl+1/2/3 switch, measure perceived latency)

# Verify worktree cleanup
# (manual: create worktree workspace, delete it, verify git worktree removed)

# Verify no orphaned state
ls ~/.liteeditor/workspaces/  # Should only contain active project dirs
cat ~/.liteeditor/projects.json  # Should match sidebar state
```

## Assumptions Made

1. Dev server auto-detection scans package.json `scripts` for names containing: dev, start, serve, watch, preview
2. Port detection parses terminal stdout for common patterns (localhost:XXXX, :XXXX, "port XXXX")
3. Pane linking is workspace-scoped (terminal CWD matches workspace root)
4. Full canvas swap = serialize → clear → deserialize with CSS-hidden terminal persistence
5. Data migration is one-time, only needs to work for Ryan's machine
6. Ctrl+1-9 maps to sidebar position (pinned first, then custom order)
7. Drag reorder persists to projects.json as an `order` field or array position
8. "This session" = prioritize core functionality (Phases 0-2), polish follows if time allows
9. Dev server processes are spawned via node-pty (same as terminal panes) for stdout capture
10. No conversation/thread tracking — extensions handle their own state

## Execution Workflow

1. **Create worktree** (`superpowers:using-git-worktrees`) — isolate work from main branch
2. **Write tests** (`superpowers:test-driven-development`) — test store changes before implementing
3. **Implement** — Phase 0 (bugs) → Phase 1 (core switching) → Phase 2 (scripts) → Phase 3 (status) → Phase 4 (polish) → Phase 5 (shortcuts/linking) → Phase 6 (testing)
4. **Debug failures** (`superpowers:systematic-debugging`) — follow the debugging skill, don't guess
5. **Verify** (`superpowers:verification-before-completion`) — run validation commands after each phase
6. **Review** (`superpowers:requesting-code-review`) — review before merging
7. **Finish branch** (`superpowers:finishing-a-development-branch`) — merge/PR/cleanup

## Execution Priority (This Session)

Given time constraint, execute in this order:
1. **Phase 0** — Bug fixes (foundation must be solid)
2. **Phase 1** — Core switching + startup (the main deliverable)
3. **Phase 2** — Dev server + scripts (critical user-facing feature)
4. **Phase 3** — Status dots (visual feedback)
5. **Phase 4** — Visual polish + drag reorder
6. **Phase 5** — Keyboard shortcuts + pane linking
7. **Phase 6** — Testing

## Notes

- T3 Code reference repos: fork at `E:\SAS\REPO_CLONES\t3code`, latest at `E:\SAS\REPO_CLONES\t3code-latest`
- T3 Code's `Sidebar.logic.ts` has the status aggregation pattern to study
- T3 Code's `composerProviderRegistry.tsx` has provider-specific UI pattern (future reference)
- LiteEditor's canvas mode is a unique differentiator — pane linking and spatial features are things T3 Code can't do
- The existing plan at `Docs/Plans/first-class-projects-workspaces.md` covers Phases 1-8 of the original scope — this plan supersedes it with updated scope and priorities
