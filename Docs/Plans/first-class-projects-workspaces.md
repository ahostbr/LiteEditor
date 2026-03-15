# Plan: First-Class Projects & Workspaces in LiteEditor

## Task Description

Transform LiteEditor's canvas system so that projects and workspaces are first-class citizens — matching the patterns established by Theo's t3code app and Kuroryuu's terminal management. Projects contain named workspaces, each with its own canvas layout, terminal arrangement, and optionally a git worktree. The sidebar shows a project hierarchy with file explorer extending from each workspace.

## Objective

- **Projects** are persistent, registered entities (folder path + name + metadata) stored globally
- **Workspaces** are named canvas layouts within a project (like t3code's "threads")
- **Git worktrees** can be created as workspaces (each gets its own branch + working directory)
- **Terminal persistence** — PTY processes survive workspace switches (CSS hidden, xterm stays mounted)
- **Project sidebar** — hierarchical: Project → Workspace → File explorer
- **Startup** — sidebar-integrated (shows projects, user clicks to load; auto-load optional)

## Problem Statement

LiteEditor currently has an infinite 2D canvas with terminal/editor/browser panes and per-project persistence, but:
1. Project list is **ephemeral** — `project-store.ts` is in-memory only, lost on restart
2. No concept of **named workspaces** — only one canvas layout per project
3. No **git worktree** integration — can't work on multiple branches simultaneously
4. Terminals are **destroyed** on any navigation — no persistence across switches
5. No **project picker** on startup — relies on "Open Folder" flow
6. Sidebar shows projects but doesn't expand into workspaces or file explorer

## Solution Approach

### Architecture

```
~/.liteeditor/
├── projects.json           # Global project registry [{id, name, path, settings}]
└── workspaces/
    ├── proj-abc/
    │   ├── default.json    # Workspace: default canvas layout
    │   ├── frontend-dev.json
    │   └── fix-auth-bug.json  # Workspace backed by git worktree
    └── proj-def/
        └── default.json

<project-root>/
├── .worktrees/             # Git worktrees directory
│   ├── feature-canvas-v2/  # Full repo checkout on branch
│   └── fix-auth-bug/
├── .liteeditor/
│   └── settings.json       # Per-project settings (existing)
└── src/
```

### Data Models

```typescript
// Project entity — persisted in ~/.liteeditor/projects.json
interface Project {
  id: string                    // e.g., 'proj-abc123'
  name: string                  // Display name (defaults to folder name)
  rootPath: string              // Absolute path to project root
  lastActiveWorkspaceId: string // Last active workspace
  lastActivity: number         // Timestamp
  pinned: boolean
  createdAt: number
}

// Workspace entity — persisted in ~/.liteeditor/workspaces/<projectId>/<id>.json
interface Workspace {
  id: string                    // e.g., 'ws-frontend-dev'
  name: string                  // Display name
  projectId: string             // Parent project ID
  type: 'local' | 'worktree'   // Whether this is a git worktree
  branch?: string               // Git branch (for worktree type)
  worktreePath?: string         // Absolute path to worktree dir
  canvas: PersistedCanvasState  // Pane layout (positions, sizes, types)
  lastActivity: number
  createdAt: number
}
```

### Terminal Persistence Strategy (Kuroryuu Pattern)

When switching workspaces:
1. All xterm instances from current workspace get `display: none` (NOT unmounted)
2. PTY processes stay alive — no kill, no reconnection
3. Target workspace's xterm instances get `display: block`
4. If target workspace has no terminals yet, CanvasPanelRenderer creates them on mount
5. Canvas panes track which workspace they belong to via workspace ID

### Sidebar Hierarchy

```
▼ LiteEditor (project)              ← right-click: settings, delete
  ▼ main (workspace, active)        ← click loads canvas
    ▼ src/                          ← file explorer extends here
      ▶ renderer/
      ▶ main/
    package.json
  ▶ feature/canvas-v2 (worktree)   ← click loads worktree workspace
  ▶ fix-auth-bug (worktree)
  + New Workspace
▶ LiteDash (project)
▶ LiteSpeak (project)
+ Add Project
```

## Relevant Files

### New Files
| File | Purpose |
|------|---------|
| `src/renderer/stores/workspace-store.ts` | Workspace state management (CRUD, persistence, switching) |
| `src/renderer/components/sidebar/WorkspaceEntry.tsx` | Workspace row in sidebar (click to load, right-click menu) |
| `src/renderer/components/sidebar/WorkspaceCreateDialog.tsx` | Dialog: create workspace (local or worktree, branch picker) |
| `src/renderer/components/sidebar/ProjectSettingsDialog.tsx` | Dialog: edit project name, manage worktrees |
| `src/main/ipc/project-handlers.ts` | IPC handlers for project registry CRUD |
| `src/main/ipc/worktree-handlers.ts` | IPC handlers for git worktree operations |
| `src/main/services/project-service.ts` | Main-process service for projects.json I/O |
| `src/main/services/workspace-persistence-service.ts` | Main-process service for workspace JSON I/O |

### Modified Files
| File | Change |
|------|--------|
| `src/renderer/stores/project-store.ts` | Add persistence layer, workspace references, project CRUD |
| `src/renderer/stores/canvas-store.ts` | Add workspace ID tracking, multi-workspace pane management |
| `src/renderer/components/sidebar/ProjectSidebar.tsx` | Expand to show workspaces + file explorer per workspace |
| `src/renderer/components/sidebar/ProjectEntry.tsx` | Add expand/collapse, workspace list, right-click menu |
| `src/renderer/components/canvas/Canvas.tsx` | Workspace-aware rendering, terminal persistence (CSS hidden) |
| `src/renderer/components/canvas/CanvasPanelRenderer.tsx` | Track workspace ownership for terminal panes |
| `src/renderer/hooks/useWorkspacePersistence.ts` | Save to workspace-specific files instead of single workspace.json |
| `src/renderer/App.tsx` | Startup flow: sidebar-integrated picker, workspace loading |
| `src/main/ipc/git-handlers.ts` | Add worktree operations (add, remove, list) |
| `src/preload/index.ts` | Expose project + workspace + worktree APIs |

## Execution Workflow

1. **Create worktree** → `superpowers:using-git-worktrees` — isolate this work from main
2. **Write tests** → `superpowers:test-driven-development` — test data models, persistence, store logic
3. **Implement** → Phase-by-phase (see tasks below)
4. **Debug failures** → `superpowers:systematic-debugging` — when tests fail, follow the process
5. **Verify** → `superpowers:verification-before-completion` — run validation commands at each phase
6. **Review** → `superpowers:requesting-code-review` — review before merge
7. **Finish branch** → `superpowers:finishing-a-development-branch` — structured merge/cleanup

## Step by Step Tasks

### Phase 1: Project Registry & Persistence (Foundation)

**Goal:** Projects survive app restarts. Global registry stored at `~/.liteeditor/projects.json`.

#### Task 1.1: Main-process project service
- Create `src/main/services/project-service.ts`
- Reads/writes `~/.liteeditor/projects.json` (array of Project objects)
- Methods: `loadProjects()`, `saveProjects()`, `addProject()`, `removeProject()`, `updateProject()`
- Auto-create `~/.liteeditor/` directory on first run
- Handle file corruption gracefully (fallback to empty array)

#### Task 1.2: Project IPC handlers
- Create `src/main/ipc/project-handlers.ts`
- Channels: `project:list`, `project:add`, `project:remove`, `project:update`, `project:get`
- Register in main process IPC setup

#### Task 1.3: Preload API surface
- Add `window.api.project.*` namespace in preload
- Methods: `list()`, `add(path, name?)`, `remove(id)`, `update(id, data)`, `get(id)`

#### Task 1.4: Extend project-store.ts
- Add persistence: on `addProject()` → IPC call to save; on init → IPC call to load
- Add `loadFromDisk()` action called on app startup
- Add `removeProject(id)` that calls IPC + updates in-memory state
- Persist `pinned`, `lastActivity`, `name` changes

#### Task 1.5: Migrate Open Folder to Add Project
- In `App.tsx` (or wherever Ctrl+O handler lives): when opening a folder, check if already registered
- If not registered → call `project:add` to register with default name (folder basename)
- If registered → just switch to it via `setActiveProject()`

**Validation:** App restart preserves project list. Opening same folder twice doesn't duplicate.

---

### Phase 2: Workspace Model & Persistence

**Goal:** Each project can have multiple named workspaces, each with its own canvas state.

#### Task 2.1: Workspace persistence service (main process)
- Create `src/main/services/workspace-persistence-service.ts`
- Directory structure: `~/.liteeditor/workspaces/<projectId>/`
- Methods: `listWorkspaces(projectId)`, `loadWorkspace(projectId, workspaceId)`, `saveWorkspace(projectId, workspaceId, data)`, `deleteWorkspace(projectId, workspaceId)`
- Each workspace is a JSON file: `<workspaceId>.json`

#### Task 2.2: Workspace IPC handlers
- Create IPC channels: `workspace:list`, `workspace:load`, `workspace:save`, `workspace:create`, `workspace:delete`, `workspace:rename`
- Wire up to workspace-persistence-service

#### Task 2.3: Workspace store (renderer)
- Create `src/renderer/stores/workspace-store.ts`
- State: `workspaces: Map<string, Workspace>`, `activeWorkspaceId: string | null`
- Actions: `loadWorkspacesForProject(projectId)`, `createWorkspace(name, type, branch?)`, `switchWorkspace(id)`, `deleteWorkspace(id)`, `renameWorkspace(id, name)`
- On `switchWorkspace`:
  1. Save current canvas state to current workspace file
  2. Clear canvas
  3. Load target workspace's canvas state
  4. Restore panes

#### Task 2.4: Preload API surface
- Add `window.api.workspace.listWorkspaces()`, `createWorkspace()`, `deleteWorkspace()`, etc.
- Keep existing `workspace:load-state` / `workspace:save-state` for backward compat during migration

#### Task 2.5: Auto-create "Default" workspace
- When a project is added (Task 1.5), auto-create a "Default" workspace
- Migrate existing `.liteeditor/workspace.json` canvas state into the Default workspace file
- Handle projects opened before this feature gracefully

#### Task 2.6: Update useWorkspacePersistence hook
- Instead of saving to `.liteeditor/workspace.json`, save to the active workspace file
- Debounced save targets `workspace:save` IPC with active workspace ID

**Validation:** Create project → gets Default workspace. Create second workspace → switch between them. Canvas state persists independently per workspace.

---

### Phase 3: Terminal Persistence Across Workspace Switches

**Goal:** PTY processes and xterm instances survive workspace switches. CSS hidden, not unmounted.

#### Task 3.1: Canvas store workspace awareness
- Add `workspaceId` field to `CanvasPaneState`
- When adding a pane, tag it with the current workspace ID
- `getVisiblePanes()` selector → only returns panes matching active workspace

#### Task 3.2: Terminal pane lifecycle (CSS hidden)
- In `Canvas.tsx`: render ALL terminal panes from ALL workspaces
- Non-active workspace panes get `style={{ display: 'none' }}`
- Active workspace panes get `style={{ display: 'block' }}`
- This keeps xterm instances mounted and PTY connections alive

#### Task 3.3: Non-terminal pane lifecycle
- Editor and browser panes from inactive workspaces can be unmounted (lighter than terminals)
- Only terminal panes need the CSS-hidden treatment
- Filter: render inactive workspace panes ONLY if `pane.type === 'terminal'`

#### Task 3.4: Workspace switch orchestration
- In workspace store `switchWorkspace()`:
  1. Save current workspace canvas state
  2. Update `activeWorkspaceId`
  3. Canvas store: hide current workspace panes, show target workspace panes
  4. If target workspace has persisted state but no live panes, restore from persistence
  5. Set viewport to target workspace's saved position

#### Task 3.5: Terminal notification integration
- `useTerminalNotifications` already tracks background pane output
- Extend to also show notification badges on workspace entries in sidebar
- Count notifications from hidden workspace's terminal panes

**Validation:** Create 2 workspaces with terminals. Switch between them. Terminals stay alive, output continues in background, notifications show on inactive workspace.

---

### Phase 4: Git Worktree Integration

**Goal:** Create workspaces backed by git worktrees. Each worktree = separate branch checkout.

#### Task 4.1: Worktree IPC handlers
- Add to `src/main/ipc/git-handlers.ts` (or new `worktree-handlers.ts`):
  - `git:worktree-list` → `git worktree list --porcelain` parsed
  - `git:worktree-add` → `git worktree add .worktrees/<name> [-b <branch> | <existing-branch>]`
  - `git:worktree-remove` → `git worktree remove .worktrees/<name>`
  - `git:branch-list` → list local + remote branches for picker

#### Task 4.2: Preload API
- Add `window.api.git.worktreeList()`, `worktreeAdd(name, branch, isNew)`, `worktreeRemove(name)`
- Add `window.api.git.branchList()` for branch picker

#### Task 4.3: Workspace create dialog with worktree option
- Create `WorkspaceCreateDialog.tsx`
- Form fields:
  - Workspace name (text input)
  - Type toggle: Local | Worktree
  - If Worktree:
    - Radio: New branch from HEAD | Existing branch
    - Branch name input (new) or branch picker dropdown (existing)
- On submit: if worktree, call `git:worktree-add` first, then create workspace with `type: 'worktree'`, `branch`, `worktreePath`

#### Task 4.4: Worktree workspace behavior
- When switching to a worktree workspace:
  - Set project root context to `worktreePath` (not main project root)
  - Terminal CWD defaults to worktree path
  - File explorer shows worktree directory
  - Git operations target the worktree's branch

#### Task 4.5: Worktree cleanup on workspace delete
- When deleting a worktree workspace, use modal dialog (existing system) to ask:
  - "Also remove the git worktree? This will delete the working directory."
  - Buttons: "Remove worktree too" | "Just unregister" | "Cancel"
- If "Remove worktree too": call `git:worktree-remove`

#### Task 4.6: Auto-add `.worktrees/` to .gitignore
- When creating the first worktree, check if `.worktrees/` is in `.gitignore`
- If not, append `.worktrees/` to `.gitignore` (with user confirmation)

**Validation:** Create worktree workspace from new branch. Files are at `.worktrees/<name>/`. Terminals open in worktree dir. Delete workspace with worktree removal. Branch list shows in picker.

---

### Phase 5: Sidebar Hierarchy (Project → Workspace → File Explorer)

**Goal:** Sidebar shows the full hierarchy with file explorer extending from each workspace.

#### Task 5.1: Refactor ProjectSidebar.tsx
- Replace flat project list with hierarchical tree:
  - Project entries (expand/collapse)
    - Workspace entries (click to load, expand for files)
      - File explorer tree (from existing `FileExplorer.tsx`)
    - "+ New Workspace" button
  - "+ Add Project" button at bottom

#### Task 5.2: Refactor ProjectEntry.tsx
- Add expand/collapse chevron
- On expand: show workspace list
- Right-click context menu: Rename, Settings, Pin/Unpin, Remove
- Show active indicator (which project is loaded)
- Show notification badges (aggregate from workspace terminals)

#### Task 5.3: Create WorkspaceEntry.tsx
- Display workspace name + type icon (folder for local, git-branch for worktree)
- Click: switch to this workspace (save current, load target)
- Right-click: Rename, Delete, "Open in Explorer"
- Expand: show file explorer for this workspace's root path
- Active indicator (highlighted when this workspace is loaded)
- Notification badge from background terminals

#### Task 5.4: File explorer integration
- When a workspace entry is expanded, mount `FileExplorer` component underneath
- Pass `rootPath` = workspace's effective path (main root or worktree path)
- File explorer should be lazy-loaded (only when expanded)
- Clicking files opens them in an editor pane on the canvas

#### Task 5.5: Sidebar state persistence
- Save expanded/collapsed state per project and workspace in the workspace store
- Persist which projects are expanded in `projects.json` or localStorage

**Validation:** Sidebar shows projects with workspaces nested. Expanding workspace shows file tree. Clicking workspace switches canvas. Right-click menus work. State persists across restart.

---

### Phase 6: Project Settings Dialog

**Goal:** Edit project name and manage worktrees from a dialog.

#### Task 6.1: Create ProjectSettingsDialog.tsx
- Triggered from project right-click → "Settings" or gear icon
- Tabs or sections:
  1. **General**: Project name (editable text field), root path (read-only)
  2. **Worktrees**: List existing worktrees with branch + path, create new, delete

#### Task 6.2: Worktree management in settings
- List view: all worktrees for this project
  - Each row: branch name, path, status (clean/dirty)
  - Actions: Delete (with modal confirmation), Open workspace
- Create button: opens WorkspaceCreateDialog in worktree mode

#### Task 6.3: Project deletion flow
- "Remove Project" button in settings dialog
- Modal confirmation (using existing dialog system):
  - "Remove project from LiteEditor?"
  - "Also delete worktrees?" checkbox if worktrees exist
  - Buttons: "Remove" | "Cancel"
- On confirm: unregister project, optionally `git worktree remove` each worktree

**Validation:** Can rename project from settings. Worktree list shows correct data. Can delete project with worktree cleanup option.

---

### Phase 7: Startup Flow (Sidebar-Integrated)

**Goal:** On startup, show sidebar with all projects. Optional auto-load setting.

#### Task 7.1: Startup mode in App.tsx
- On launch, load project list from `projects.json`
- If auto-load setting is ON and last active project exists → load it directly
- If auto-load is OFF or no projects → show empty canvas with sidebar open
- Sidebar always visible on startup (not collapsed)

#### Task 7.2: Auto-load setting
- Add `autoLoadLastProject: boolean` to app settings
- Visible in:
  - App settings panel (existing settings UI)
  - The sidebar itself (small toggle or hint text at bottom)
- Default: OFF (sidebar-integrated picker is default experience)

#### Task 7.3: Empty state UI
- When no project is loaded, canvas shows a centered message:
  - "Open a project to get started"
  - Or just empty canvas with sidebar showing projects
- When project list is empty, sidebar shows:
  - "No projects yet"
  - "+ Add Project" button (prominent)

#### Task 7.4: Last active tracking
- On project switch or workspace switch, update `lastActiveProjectId` and `lastActiveWorkspaceId` in `projects.json`
- Used by auto-load and by "most recent" sorting in sidebar

**Validation:** Fresh install → empty canvas + sidebar. Add project → loads. Restart with auto-load OFF → sidebar picker. Toggle auto-load ON → restart loads last project directly.

---

### Phase 8: Data Migration & Backward Compatibility

**Goal:** Existing LiteEditor users don't lose their data.

#### Task 8.1: Detect existing workspace data
- On first launch with new system, check for existing `.liteeditor/workspace.json` files in known project paths
- If found: create project entry in registry + migrate canvas state to "Default" workspace

#### Task 8.2: Migrate global workspace
- Read `~/.liteeditor/workspace.json` for `projectRoot`
- If it points to a valid project: register it, create Default workspace, set as last active

#### Task 8.3: Graceful fallback
- If `projects.json` doesn't exist → first run, create empty
- If workspace files are corrupted → log warning, start with empty workspace
- If `.worktrees/` is missing → worktree type workspaces show as "unavailable"

**Validation:** Existing user upgrades → their current project appears in sidebar with "Default" workspace containing their existing canvas layout.

## Acceptance Criteria

1. **Project persistence** — Project list survives app restart
2. **Named workspaces** — Each project supports multiple named canvas layouts
3. **Workspace switching** — Switching workspaces saves current canvas, restores target canvas
4. **Terminal persistence** — PTY processes stay alive during workspace switch (CSS hidden)
5. **Git worktrees** — Can create workspace as git worktree with new or existing branch
6. **Sidebar hierarchy** — Project → Workspace → File explorer tree, all functional
7. **Project settings** — Can rename project and manage worktrees from dialog
8. **Startup** — Sidebar-integrated picker by default, auto-load optional
9. **Open Folder = Add Project** — Ctrl+O registers folder as project
10. **Backward compatibility** — Existing users' data migrated seamlessly
11. **Build passes** — `pnpm build` and `pnpm typecheck` succeed
12. **All existing tests pass** — No regressions in existing E2E or unit tests

## Validation Commands

```bash
cd C:/Projects/LiteEditor

# Type checking
pnpm typecheck

# Build
pnpm build

# Run existing tests
pnpm test

# Dev mode smoke test
pnpm dev
```

## Assumptions Made

1. **No electron-store** — Continuing file-based persistence pattern (JSON files via WorkspaceService)
2. **simple-git not required** — Worktree operations can use raw `git` CLI via `execFile` (already used in git-service.ts)
3. **No event sourcing** — Direct Zustand + file persistence is sufficient (not t3code's SQLite pattern)
4. **Max ~20 workspaces per project** — No pagination needed for workspace list
5. **Max ~50 terminals total across all workspaces** — CSS-hidden strategy is memory-feasible
6. **Git is installed** — Worktree features require git CLI available in PATH
7. **`.worktrees/` directory convention** — All worktrees created in `<project>/.worktrees/<name>/`
8. **Scripts UI deferred to v2** — No build/test/lint buttons in this plan
9. **Full git desktop clone deferred to v2** — No changes/history/diff/commit UI; just worktree management
10. **File explorer component exists** — `FileExplorer.tsx` can be mounted per-workspace with a `rootPath` prop

## Notes

### Inspiration Sources
- **t3code** (Theo/t3.gg): Project → Thread hierarchy, sidebar with expandable threads, draft threads, project switching
- **Kuroryuu**: Terminal persistence (CSS hidden, PTY daemon), RepositoryView git desktop clone, worktree management
- **Theo's video** ("So I stopped using Ghostty..."): Niri paper window manager, infinite canvas, per-project terminal arrangements, notification badges

---

## v2 Phases — Execute Immediately After v1

> **These are NOT optional.** Once v1 (Phases 1–8 above) is complete and verified, execute these phases in order. They complete the full vision from the Theo video and Kuroryuu reference implementations.

### Phase 9: Full Git Desktop Clone UI (Canvas Pane + Quick Actions)

**Goal:** Port Kuroryuu's RepositoryView as a first-class canvas pane type, and add git quick-action buttons to all canvas pane headers.

**Reference:** `E:\SAS\CLONE\Kuroryuu-master\apps\desktop\src\renderer\components\github\RepositoryView.tsx` and its 15+ supporting components, `repository-store.ts`, `git-service.ts`, `github-desktop.css`, `repository.ts` types.

#### Task 9.1: Git pane type in canvas store
- Add `'git'` to `CanvasPaneType` union
- Git pane state: `{ repoPath: string }` — points to project root or worktree path
- Right-click canvas → "Add Git Panel" option
- Default size: 800x600 (needs room for sidebar + diff viewer)

#### Task 9.2: RepositoryView component (port from Kuroryuu)
- Port the full component hierarchy:
  ```
  RepositoryView
  ├── Toolbar (repo info, branch dropdown, fetch/push/pull)
  ├── TabBar (Changes | History | Worktrees)
  └── Content
      ├── ChangesSidebar (file list + commit form)
      │   ├── ChangedFileItem (checkbox, status icon, context menu)
      │   └── CommitMessage (summary, description, AI summarize, commit button)
      ├── DiffViewer (hunk-based diff with line numbers, add/delete highlighting)
      ├── HistorySidebar (expandable commit list with details)
      ├── CommitDetails (file diff from selected commit)
      └── WorktreesList (list/create/delete worktrees — ties into Phase 4)
  ```
- Adapt styling from `github-desktop.css` to LiteEditor's CSS variable system
- Use existing `window.api.git.*` IPC channels (extend as needed)

#### Task 9.3: Repository store (port from Kuroryuu)
- Create `src/renderer/stores/repository-store.ts` (Zustand)
- State: repo info, changed files, staged files, selected file, diff content, commit history, branches, active tab
- Actions: `initialize(repoPath)`, `refreshStatus()`, `stageFile()`, `unstageFile()`, `stageAll()`, `unstageAll()`, `discardFileChanges()`, `createCommit()`, `fetchOrigin()`, `pushOrigin()`, `pullOrigin()`, `loadHistory()`, `selectCommit()`, `listBranches()`, `checkoutBranch()`, `createBranch()`, `deleteBranch()`
- Auto-refresh git status every 10 seconds (polling, like Kuroryuu)

#### Task 9.4: Extend git IPC handlers
- Add any missing channels from Kuroryuu's git-service.ts:
  - `git:stage`, `git:unstage`, `git:stageAll`, `git:unstageAll`
  - `git:discardChanges` (checkout file or delete untracked)
  - `git:show` (commit details with file list)
  - `git:diffCommit` (file diff from specific commit)
  - `git:revertCommit`
  - `git:renameBranch`
- Use NUL-delimited format (`git status -z`) for robust file path parsing

#### Task 9.5: Git diff parser
- Parse unified diff format into typed structures:
  ```typescript
  interface DiffHunk { header: string; oldStart: number; oldCount: number; newStart: number; newCount: number; lines: DiffLine[] }
  interface DiffLine { type: 'add' | 'delete' | 'context' | 'hunk'; content: string; oldLineNumber?: number; newLineNumber?: number }
  interface FileDiff { path: string; hunks: DiffHunk[]; additions: number; deletions: number; isBinary: boolean }
  ```

#### Task 9.6: Git quick actions on canvas pane headers
- Add git action buttons to ALL canvas pane headers (not just git panes):
  - Current branch badge (read-only, shows branch name)
  - Quick commit button (opens minimal commit dialog or focuses git pane)
  - Push/pull indicator (shows ahead/behind count, clickable)
- These are small, unobtrusive icons in the pane header bar
- Only visible when the workspace has git initialized

#### Task 9.7: AI commit message generation
- Port Kuroryuu's `summarizeCommit()` pattern
- Use existing LLM integration or `window.api.gateway.chat()` equivalent
- Button in CommitMessage component: "AI Summarize" → generates commit message from staged diff

**Validation:** Add git pane to canvas. Stage/unstage files. View diffs with syntax highlighting. Commit with message. Push/pull. View history with expandable commits. Branch management. Quick action buttons visible on pane headers.

---

### Phase 10: Project Scripts UI

**Goal:** Auto-detect and run project scripts (build, test, lint, dev) from the sidebar and canvas.

**Reference:** t3code's `ProjectScript` model with `name`, `command`, `icon`, `runOnWorktreeCreate`.

#### Task 10.1: Script detection service (main process)
- Create `src/main/services/script-detection-service.ts`
- Scan project root for:
  - `package.json` → extract `scripts` object (dev, build, test, lint, start, etc.)
  - `Makefile` → extract targets
  - `Cargo.toml` → detect cargo commands
  - `CMakeLists.txt` → detect cmake targets
- Return array of `DetectedScript { name, command, source, icon }`
- Icon mapping: dev→play, build→hammer, test→flask, lint→check, start→rocket

#### Task 10.2: Script model in project data
- Extend `Project` interface:
  ```typescript
  interface Project {
    // ...existing fields
    scripts: ProjectScript[]
  }
  interface ProjectScript {
    id: string
    name: string
    command: string
    icon: 'play' | 'build' | 'test' | 'lint' | 'configure' | 'debug' | 'rocket' | 'custom'
    autoDetected: boolean  // true if from package.json, false if user-added
    runOnWorktreeCreate?: boolean
  }
  ```
- Auto-detect on project add, store in `projects.json`
- User can add/edit/remove scripts in project settings

#### Task 10.3: Scripts UI in project settings dialog
- New "Scripts" tab/section in ProjectSettingsDialog:
  - List detected scripts with edit capability
  - "Re-detect" button to rescan
  - "+ Add Script" button for custom scripts
  - Each row: icon picker, name, command, delete button
  - "Run on worktree create" checkbox per script

#### Task 10.4: Scripts in sidebar
- Show script buttons under each project in sidebar (when expanded):
  ```
  ▼ LiteEditor
    ▼ main (workspace)
      ▶ src/
    ▶ Scripts
      ▶ dev    → pnpm dev
      ▶ build  → pnpm build
      ▶ test   → pnpm test
    + New Workspace
  ```
- Click script → opens terminal pane on canvas running that command
- Script terminal pane gets the script name as title

#### Task 10.5: Script execution
- Running a script:
  1. Create new terminal pane on canvas (or reuse existing script terminal)
  2. Set CWD to workspace root (project root or worktree path)
  3. Execute command in PTY
  4. Terminal title = script name
- Option to run in existing terminal vs new terminal

**Validation:** Add project with package.json → scripts auto-detected. Run script from sidebar → terminal opens with command. Edit scripts in settings. Custom scripts persist.

---

### Phase 11: Column-Based Auto-Layout (Niri-Style)

**Goal:** Add a Niri-style column layout mode alongside the existing free-form canvas. Panes stack in columns and scroll horizontally.

**Reference:** Theo's video on Niri paper window manager — windows arranged in columns, horizontal scroll to navigate, each pane owns its height.

#### Task 11.1: Layout mode toggle in canvas
- Add `layoutMode: 'freeform' | 'columns'` to canvas store
- Toggle button in canvas toolbar (near zoom controls)
- Keyboard shortcut: `Ctrl+Shift+L` to toggle

#### Task 11.2: Column layout engine
- When `layoutMode === 'columns'`:
  - Panes are arranged in vertical columns, left to right
  - Each column contains 1-N panes stacked vertically
  - Panes own their width and height (not auto-sized)
  - Horizontal scrolling to navigate between columns
  - Vertical scrolling within a column if panes exceed viewport height
- Column management:
  - New pane → added to rightmost column (or new column if current is "full")
  - Drag pane between columns to reorder
  - Drag pane to gap between columns to create new column

#### Task 11.3: Column-to-freeform transition
- Switching from columns → freeform: panes keep their computed positions
- Switching from freeform → columns: panes are auto-arranged into columns by X position
- Preserve pane sizes in both modes

#### Task 11.4: Column keyboard navigation
- `Ctrl+Alt+Left/Right` → move focus to adjacent column
- `Ctrl+Alt+Up/Down` → move focus within column
- `Ctrl+Shift+Left/Right` → move pane to adjacent column

#### Task 11.5: Column persistence
- Save `layoutMode` in workspace state
- Column assignments saved per pane (which column, position in column)

**Validation:** Toggle to column mode → panes auto-arrange in columns. Add pane → goes to column. Drag between columns. Keyboard navigate. Switch back to freeform → positions preserved. Persists across restart.

---

### Phase 12: Pane Linking (Terminal ↔ Editor)

**Goal:** Link terminal panes to editor panes so the terminal automatically opens at the file's directory.

**Reference:** Theo's video — terminals tied to specific project directories/files.

#### Task 12.1: Pane link model
- Add to `CanvasPaneState`:
  ```typescript
  linkedPaneId?: string  // ID of linked pane
  ```
- When a terminal is linked to an editor pane:
  - Terminal CWD = directory of the editor's open file
  - If editor file changes, terminal CWD updates (optional)
  - Visual indicator: thin colored line connecting linked panes on canvas

#### Task 12.2: Link creation UX
- Right-click terminal pane header → "Link to Editor..." → shows list of editor panes
- Right-click editor pane header → "Open Terminal Here" → creates linked terminal at file's directory
- Drag terminal pane onto editor pane → creates link (drop zone indicator)

#### Task 12.3: Link behavior
- Linked terminal:
  - Shows linked file/folder path in header subtitle
  - CWD set to `path.dirname(linkedEditorPane.filePath)`
  - If linked editor opens different file → terminal CWD changes (with setting to disable)
- Link breaking:
  - Close either pane → link breaks
  - Right-click → "Unlink" to manually break
  - Moving to different workspace → link preserved if both panes are in same workspace

#### Task 12.4: Visual connection
- On canvas, draw a subtle SVG line/curve between linked panes
- Line color matches the pane type accent color
- Only visible when either linked pane is hovered or focused
- Toggle visibility: `Ctrl+Shift+K` to show/hide all links

**Validation:** Right-click editor → "Open Terminal Here" → terminal opens at file's dir. Link indicator visible. Change file in editor → terminal CWD updates. Close editor → link breaks cleanly.

---

### Phase Execution Order

After v1 (Phases 1–8) is complete and verified:

```
Phase 9:  Git Desktop Clone UI     ← Largest phase, do first (high value)
Phase 10: Project Scripts UI       ← Builds on Phase 9's git integration
Phase 11: Column Auto-Layout       ← Independent, can parallel with 10
Phase 12: Pane Linking             ← Smallest phase, do last
```

Phases 10 and 11 are independent and can be executed in parallel if using subagents.
