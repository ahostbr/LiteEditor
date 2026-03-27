# Plan: Direct-to-Canvas Launch & Session Restore

## Task Description

Remove the requirement to manually select a project before using the app. The app opens directly to a blank canvas, auto-restores the last active project + thread + full pane layout, relaxes pane creation guards, and handles file opens from Windows Explorer intelligently.

## Objective

- App launches directly to canvas with full session restore (no splash/home screen gate)
- Last project + workspace + pane layout persisted and restored automatically
- Pane creation works without a project for non-project-specific panes
- File opens from Explorer detect project context intelligently
- First-ever launch shows blank canvas with toast hint

## Problem Statement

Currently, the app launches to a blank canvas with no active project. The `AddPaneMenu` blocks ALL pane creation when `activeProjectId` is null. AgentBridge and MCP server calls to create panes fail silently because `__createTerminalPane` / `__createBrowserPane` globals depend on `addPaneToCurrentMode` which checks for an active project. This forces users (and E2E tests) to manually select a project before doing anything.

## Solution Approach

1. **Persist `lastActiveProjectId`** in `~/.liteeditor/projects.json` (global config) AND `localStorage` (fast restore fallback)
2. **Auto-restore on boot**: Load last project → restore its workspace → restore pane layout
3. **Relax pane guards**: Only Chat/Git/Search require a project. Terminal/Browser/Editor/Claude/Codex work without one
4. **Terminal without project**: Show folder dialog for CWD, then toast "Also register as project?"
5. **File from Explorer**: Check if file path is inside a known project → open in that project's thread. If not → zen mode editor + toast "Open parent folder as project?"
6. **Register `__create*` window globals** in renderer for main-process `executeJavaScript` calls

## Relevant Files

### Modified
| File | Changes |
|------|---------|
| `apps/desktop/src/liteeditor/services/project-service.ts` | Add `lastActiveProjectId` to global config, persist on project switch |
| `apps/web/src/liteeditor/stores/project-store.ts` | Auto-select last project on `loadFromDisk()`, persist `lastActiveProjectId` to localStorage |
| `apps/web/src/liteeditor/App.tsx` | Boot sequence: auto-restore project → workspace → panes; register `__create*` globals |
| `apps/web/src/liteeditor/components/canvas/AddPaneMenu.tsx` | Relax guard: only block Chat/Git/Search without project; terminal triggers folder dialog |
| `apps/web/src/liteeditor/lib/pane-sync.ts` | `addPaneToCurrentMode` — remove blanket project guard, handle no-project terminal case |
| `apps/desktop/src/main.ts` | File open from Explorer: detect project context, route to project thread or zen mode |
| `apps/desktop/src/liteeditor/services/agent-bridge.ts` | Route order fix (browser/create before browser/*) — already done |
| `apps/web/src/liteeditor/stores/workspace-store.ts` | Ensure workspace restore works with persisted pane layout |

### Already Done (from orchestration work)
| File | Status |
|------|--------|
| `apps/web/src/liteeditor/App.tsx` | `__create*` globals registered (needs project guard removal) |
| `apps/desktop/src/liteeditor/services/agent-bridge.ts` | Route order fix for `/browser/create` |

## Team Orchestration

You operate as the team lead and orchestrate the team to execute this plan.
You NEVER write code directly — you use Task and Agent tools to deploy team members.

### Team Members
| Role | Model | Focus |
|------|-------|-------|
| persistence-dev | Sonnet | Project-service persistence, localStorage fallback, boot restore |
| guard-relaxer | Sonnet | Pane guard changes in AddPaneMenu, pane-sync, folder dialog integration |
| file-router | Sonnet | Explorer file-open routing: project detection, zen mode fallback, toast prompts |

## Step by Step Tasks

### Phase 1: Persistence & Auto-Restore (no dependencies)
- Task 1.1: **Add `lastActiveProjectId` persistence to project-service.ts** — Store in `~/.liteeditor/projects.json` as a top-level field alongside the projects array. Update on every `setActiveProject()` call.
- Task 1.2: **Auto-select last project in project-store.ts `loadFromDisk()`** — After loading projects, check for `lastActiveProjectId` in the response. Also write/read `localStorage.setItem("liteeditor:lastProjectId", id)` as fast fallback. If last project found, auto-set `activeProjectId`.
- Task 1.3: **Boot sequence in App.tsx** — On mount, after `loadFromDisk()` resolves with an active project, auto-load its workspace via `loadWorkspaceForProject()`. This restores the full pane layout. If no project found (first launch), show toast "Open a folder to get started" via `useToastStore`.
- Task 1.4: **Persist last active workspace/thread** — Ensure `project-store.setActiveProject()` saves `lastActiveWorkspaceId` via `project:update` IPC. On restore, load that workspace's pane state.

### Phase 2: Relax Pane Guards (depends on Phase 1)
- Task 2.1: **Update AddPaneMenu.tsx guard** — Change the `!activeProjectId` guard to only apply to Chat, Git Panel, Search panes. Terminal, Browser, Editor, Claude Code, Codex, Files, Settings should work without a project.
- Task 2.2: **Terminal without project: folder dialog** — When "New Terminal" is clicked without an active project, call `window.api.dialog.openFolder()` to get CWD. After folder is selected, show toast "Also open as project?" with action button. If yes, call `addProject(folder)`. Create terminal pane with the selected CWD regardless.
- Task 2.3: **Update `addPaneToCurrentMode` in pane-sync.ts** — Remove blanket project check. For terminal type, accept optional `cwd` override. For project-specific types, keep the check.
- Task 2.4: **Update `__create*` globals in App.tsx** — Remove project dependency from `__createTerminalPane` and `__createBrowserPane`. These should always create panes (the API caller is responsible for context).

### Phase 3: Explorer File-Open Routing (depends on Phase 1)
- Task 3.1: **Project detection in main.ts** — When a file is opened (cold launch argv or second-instance), check if the file path is inside any known project's `rootPath`. If yes, set that project as active and open in its thread. If no, proceed to zen mode.
- Task 3.2: **Zen mode fallback for non-project files** — When file is not in any project, switch to zen mode, open the file in the editor. Show toast "Open parent folder as project?" with action button.
- Task 3.3: **Project context detection helper** — Create a utility function `findProjectForFile(filePath: string, projects: Project[]): Project | null` that checks if a file path is inside any known project root. Use in both main.ts and renderer.

### Phase 4: Validation (depends on Phase 2 + 3)
- Task 4.1: **Build and verify** — `npx turbo run build` must pass
- Task 4.2: **Manual smoke test scenarios** — Document test script for: fresh launch, project restore, terminal without project, file open from Explorer
- Task 4.3: **Update E2E tests** — Fix the failing E2E tests (terminal pane, browser pane) now that the project guard is relaxed

## Acceptance Criteria

- [ ] App launches directly to canvas (no splash gate requiring project selection)
- [ ] Last project + workspace + pane layout auto-restored on boot
- [ ] `localStorage` fallback for fast project ID restore
- [ ] Terminal/Browser/Editor/Claude/Codex panes can be created without an active project
- [ ] Chat/Git/Search panes still require a project (toast shown if none)
- [ ] Terminal without project → folder dialog → optional project registration toast
- [ ] File from Explorer in known project → opens in that project's thread
- [ ] File from Explorer NOT in known project → zen mode + "Open as project?" toast
- [ ] First-ever launch shows blank canvas + toast hint
- [ ] `npx turbo run build` passes
- [ ] E2E tests for terminal/browser pane creation pass

## Validation Commands

```bash
# Build
npx turbo run build

# Check persistence file
cat ~/.liteeditor/projects.json | python -m json.tool

# E2E tests
npx playwright test

# Verify no TypeScript errors
npx turbo run typecheck
```

## Assumptions Made

- `~/.liteeditor/projects.json` can be extended with a `lastActiveProjectId` field without breaking existing data (currently a plain array — will need migration to `{ projects: [...], lastActiveProjectId: "..." }`)
- `loadWorkspaceForProject()` already handles full pane layout restore via workspace state
- `window.api.dialog.openFolder()` exists as an IPC handler (or `dialog.showOpenDialog` equivalent)
- The toast store's `pushToast` supports action buttons (or can be extended trivially)
- Workspace state already persists pane types, positions, and sizes

## Execution Workflow

1. Create worktree → 2. Write tests → 3. Implement → 4. Debug failures → 5. Verify → 6. Review → 7. Finish branch
