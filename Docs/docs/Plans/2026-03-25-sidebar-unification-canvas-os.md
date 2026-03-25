# Plan: Sidebar Unification — Canvas as the OS

## Why This Exists
Two apps duct-taped together still feel like two apps. The seam is most visible in the sidebar: LiteEditor has its own activity bar, file explorer, search panel, and git panel — all redundant now that t3code drives projects, threads, and agents. The canvas should be the operating system surface where everything lives as panes. The sidebar should be a command center (t3code's Projects + Threads), not a parallel navigation system.

## Task Description
Remove LiteEditor's sidebar, activity bar, menu bar, and titlebar. Replace with a unified header following the LiteImage pattern (layout toggles centered, no menu bar, multi-monitor span button). t3code's sidebar becomes the sole navigation rail. All former sidebar panels (file explorer, search, git, settings) become canvas pane types. Thread-scoped workspaces with a template system.

## Objective
- One sidebar: t3code's Projects + Threads
- One header: LiteImage-style titlebar with layout mode toggles (canvas/zen) + add pane + multi-monitor span
- Zero LiteEditor chrome: no activity bar, no menu bar, no File/Edit/View menus
- All tools are panes: file explorer, search, git, settings, chat, terminal, editor, browser, claude, codex
- Thread-scoped workspaces: clicking a thread loads its canvas/zen layout
- Template system: save/load workspace layouts, defaults to Chat + Terminal

## Fact Dependencies
| Fact | Confidence | Impact if Wrong |
|------|-----------|-----------------|
| Canvas is the primary workspace paradigm | HIGH | High — entire plan changes |
| Zen mode stays alongside canvas (2 modes) | HIGH | Medium — header toggle changes |
| t3code sidebar stays as-is | HIGH | Low — just don't touch it |
| Menu bar removed (like LiteImage) | HIGH | Low — one component delete |
| Multi-monitor span support needed | HIGH | Medium — header button + IPC |
| Thread-scoped workspaces | HIGH | High — persistence model changes |
| Template system for default layouts | HIGH | Medium — UX changes |
| Default template: Chat + Terminal | MED | Low — just a default value |
| LiteImage header is the design reference | HIGH | Low — styling only |

## Relevant Files

### Remove / Gut
- `apps/web/src/liteeditor/components/activity-bar/ActivityBar.tsx` — DELETE (replaced by t3code sidebar)
- `apps/web/src/liteeditor/components/titlebar/Titlebar.tsx` — REWRITE to LiteImage pattern
- `apps/web/src/liteeditor/components/titlebar/MenuBar.tsx` — DELETE
- `apps/web/src/liteeditor/components/titlebar/CommandCenter.tsx` — KEEP (search bar in header)
- `apps/web/src/liteeditor/components/sidebar/ProjectSidebar.tsx` — DELETE (t3code sidebar handles this)
- `apps/web/src/liteeditor/components/sidebar/FileExplorer.tsx` — MOVE to canvas pane type
- `apps/web/src/liteeditor/components/sidebar/SearchPanel.tsx` — MOVE to canvas pane type
- `apps/web/src/liteeditor/components/sidebar/GitPanel.tsx` — MOVE to canvas pane type
- `apps/web/src/liteeditor/components/settings/SettingsPanel.tsx` — MOVE to canvas pane type
- `apps/web/src/liteeditor/stores/ui-store.ts` — SIMPLIFY (remove sidebar state, keep appMode)

### Modify
- `apps/web/src/liteeditor/App.tsx` — Gut: remove ActivityBar, sidebar, menubar. Render only header + workspace
- `apps/web/src/liteeditor/stores/canvas-store.ts` — Add pane types: `'files'`, `'search'`, `'settings'`
- `apps/web/src/liteeditor/components/canvas/CanvasPanelRenderer.tsx` — Add renderers for files/search/settings panes
- `apps/web/src/liteeditor/components/canvas/AddPaneMenu.tsx` — Add Files, Search, Git, Settings menu items
- `apps/web/src/liteeditor/components/canvas/PaneHeader.tsx` — Add icons for new pane types
- `apps/web/src/liteeditor/stores/workspace-store.ts` — Thread-scoped persistence (keyed by threadId)
- `apps/web/src/components/LiteEditorThreadWorkspace.tsx` — Pass threadId for workspace scoping, remove workspace header

### Create
- `apps/web/src/liteeditor/components/layout/UnifiedTitlebar.tsx` — LiteImage-style header (replaces old Titlebar)
- `apps/web/src/liteeditor/components/layout/StatusBar.tsx` — Bottom status bar (provider status, model, branch)
- `apps/web/src/liteeditor/components/canvas/FileExplorerPane.tsx` — File explorer as canvas pane wrapper
- `apps/web/src/liteeditor/components/canvas/SearchPane.tsx` — Search as canvas pane wrapper
- `apps/web/src/liteeditor/components/canvas/SettingsPane.tsx` — Settings as canvas pane wrapper
- `apps/web/src/liteeditor/components/canvas/TemplateManager.tsx` — ALREADY EXISTS, wire it up
- `apps/web/src/liteeditor/stores/template-store.ts` — Template definitions and persistence

### Reference (read-only)
- `C:/Projects/LiteImage/src/renderer/components/layout/Titlebar.tsx` — Header design reference
- `C:/Projects/LiteImage/src/renderer/components/layout/StatusBar.tsx` — Status bar reference
- `C:/Projects/LiteImage/src/renderer/components/layout/ActivityBar.tsx` — Activity bar pattern (for pane type mapping)
- `C:/Projects/LiteImage/src/renderer/App.tsx` — Layout structure reference

## Solution Approach

### Architecture: The LiteImage Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│ [Icon T3Code Alpha]  [Canvas|Zen] [+Add] [⊞Span] [— □ ✕]     │  ← UnifiedTitlebar (h-8, drag region)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  t3code Sidebar │  Canvas / Zen Workspace                       │  ← t3code's existing sidebar + LiteEditor workspace
│  (Projects,     │  (all content is panes)                       │
│   Threads)      │                                               │
│                 │  ┌─Chat──┐ ┌─Terminal─┐ ┌─Files──┐           │
│                 │  │       │ │          │ │        │           │
│                 │  │       │ │          │ │        │           │
│                 │  └───────┘ └──────────┘ └────────┘           │
│                 │                                               │
├─────────────────────────────────────────────────────────────────┤
│ ● Ready  Claude Opus 4.6  ─ master ─                    v0.1  │  ← StatusBar (h-7)
└─────────────────────────────────────────────────────────────────┘
```

### Thread-Scoped Workspaces
- Each thread ID maps to a saved canvas state (pane positions, types, sizes)
- Switching threads in t3code's sidebar swaps the entire canvas layout
- New threads get the default template (Chat + Terminal)
- Users can save custom templates and apply them to any thread

### Multi-Monitor Support
- Span button in titlebar (like LiteImage) — `window:span-all-monitors` / `window:restore-span`
- Canvas panes can be positioned across the full spanned area
- IPC handlers: `window:display-count`, `window:is-spanned`, `window:span-change`

## Team Orchestration

You operate as the team lead and orchestrate the team to execute this plan.
You NEVER write code directly — you use Task and Agent tools to deploy team members.

### Team Members
- **Header Builder** — Creates UnifiedTitlebar + StatusBar following LiteImage pattern
- **Sidebar Stripper** — Removes LiteEditor's ActivityBar, sidebar, MenuBar from App.tsx
- **Pane Migrator** — Converts FileExplorer, Search, Git, Settings from sidebar panels to canvas pane types
- **Workspace Scoper** — Implements thread-scoped workspace persistence
- **Template Builder** — Wires up TemplateManager with default templates
- **Multi-Monitor** — Adds span-all-monitors support to the unified header
- **Validator** — Builds and runs E2E tests, takes screenshots

## Step by Step Tasks

### Phase 1: Strip LiteEditor Chrome (independent tasks, parallelize)

**Task 1.1: Create UnifiedTitlebar** `[header-builder]`
- Read `C:/Projects/LiteImage/src/renderer/components/layout/Titlebar.tsx` for exact pattern
- Create `apps/web/src/liteeditor/components/layout/UnifiedTitlebar.tsx`
- Layout: `[Icon "T3 Code" "Alpha"] — [Canvas|Zen toggles] [+Add Pane dropdown] — [⊞Span] [— □ ✕]`
- Canvas/Zen toggles: `w-[26px] h-[22px]` buttons in a `bg-shelf rounded p-px` container
- Add Pane "+": dropdown menu listing all pane types (Chat, Terminal, Editor, Files, Search, Git, Browser, Claude, Codex, Settings)
- Span button: conditional on `displayCount > 1`, uses existing multi-monitor IPC
- Window controls: minimize/maximize/close with same styling as LiteImage
- Drag region: `WebkitAppRegion: 'drag'` on the bar, `'no-drag'` on interactive elements
- Height: `h-8` (32px)

**Task 1.2: Create StatusBar** `[header-builder]`
- Read `C:/Projects/LiteImage/src/renderer/components/layout/StatusBar.tsx` for pattern
- Create `apps/web/src/liteeditor/components/layout/StatusBar.tsx`
- Content: provider status dot + model name + git branch + layout mode label + version
- Height: `h-7` (28px)
- Status dot colors: ready=green, generating=amber, error=red

**Task 1.3: Gut App.tsx** `[sidebar-stripper]`
- Read current `apps/web/src/liteeditor/App.tsx`
- Remove: `ActivityBar`, `ProjectSidebar`, `Titlebar`, `MenuBar` imports and rendering
- Replace with: `UnifiedTitlebar` + workspace area + `StatusBar`
- Layout: `flex flex-col h-full` → `UnifiedTitlebar` + `flex-1 min-h-0` workspace + `StatusBar`
- Keep: Canvas and ZenArea lazy imports, appMode switching
- Keep: keyboard shortcuts hook, workspace persistence hook

**Task 1.4: Simplify ui-store.ts** `[sidebar-stripper]`
- Remove: `activeSidebarPanel`, `sidebarVisible`, `sidebarWidth`, `toggleSidebar`, `setActiveSidebarPanel`, `setSidebarWidth`
- Keep: `appMode` (canvas/zen), `settingsPanelVisible` → convert to canvas pane, `terminalPanelVisible` → convert to canvas pane
- Keep: `nativeOverlayOpen`, workspace UI state get/restore

### Phase 2: Migrate Panels to Canvas Panes (independent, parallelize)

**Task 2.1: Add 'files' pane type** `[pane-migrator]`
- Add `'files'` to `CanvasPaneType` in canvas-store.ts
- Create `FileExplorerPane.tsx` — wraps existing `FileExplorer` component
- Default size: 350x600
- Add to `CanvasPanelRenderer.tsx` and `AddPaneMenu.tsx`
- Icon: `FolderOpen` in PaneHeader

**Task 2.2: Add 'search' pane type** `[pane-migrator]`
- Add `'search'` to `CanvasPaneType`
- Create `SearchPane.tsx` — wraps existing `SearchPanel` component
- Default size: 400x500
- Add to renderer and menu
- Icon: `Search` in PaneHeader

**Task 2.3: Add 'settings' pane type** `[pane-migrator]`
- Add `'settings'` to `CanvasPaneType`
- Create `SettingsPane.tsx` — wraps existing `SettingsPanel` component
- Default size: 500x600
- Add to renderer and menu
- Icon: `Settings` in PaneHeader

### Phase 3: Thread-Scoped Workspaces

**Task 3.1: Thread workspace persistence** `[workspace-scoper]`
- Modify `workspace-store.ts` to key canvas state by threadId
- When `LiteEditorThreadWorkspace` mounts with a threadId:
  - Look up saved canvas state for that threadId
  - If found, restore it (pane positions, types, sizes)
  - If not found, apply default template
- When canvas state changes, auto-save keyed by threadId
- ⚠️ Revisit if thread-scoping assumption changes

**Task 3.2: Template system** `[template-builder]`
- Create `template-store.ts` with predefined templates:
  - "Default" — Chat (left) + Terminal (right)
  - "Development" — Chat (left) + Editor (center) + Terminal (bottom-right)
  - "Code Review" — Chat (left) + Git (center) + Diff (right)
  - "Research" — Chat (left) + Browser (center) + Files (right)
- Empty canvas shows template picker UI (centered, like LiteImage's "Open the sidebar to begin")
- Users can save current layout as a custom template
- Wire up existing `TemplateManager.tsx`

### Phase 4: Multi-Monitor Support

**Task 4.1: Span button in header** `[multi-monitor]`
- Add span-all-monitors toggle button to UnifiedTitlebar (between add button and window controls)
- Conditional: only show when `displayCount > 1`
- Uses existing IPC: `window:span-all-monitors`, `window:restore-span`, `window:is-spanned`
- Icon: `Monitor` from lucide-react, amber when spanned
- Mirror LiteImage's implementation exactly

**Task 4.2: Verify canvas across monitors** `[multi-monitor]`
- Ensure canvas viewport supports the full spanned width
- Panes should be draggable across monitor boundaries
- Zoom/pan should work across the full spanned area

### Phase 5: Polish + Cleanup

**Task 5.1: Remove dead LiteEditor sidebar code** `[sidebar-stripper]`
- Delete `apps/web/src/liteeditor/components/sidebar/ProjectSidebar.tsx`
- Delete `apps/web/src/liteeditor/components/sidebar/WorkspaceEntry.tsx`
- Delete `apps/web/src/liteeditor/components/sidebar/WorkspaceCreateDialog.tsx`
- Delete `apps/web/src/liteeditor/components/sidebar/ProjectSettingsDialog.tsx`
- Delete `apps/web/src/liteeditor/components/activity-bar/ActivityBar.tsx`
- Delete `apps/web/src/liteeditor/components/titlebar/MenuBar.tsx`
- Delete `apps/web/src/liteeditor/components/titlebar/Titlebar.tsx` (replaced by UnifiedTitlebar)
- Remove `LiteEditorThreadWorkspace` header bar (no more "Close Editor" / workspace badge)

**Task 5.2: E2E verification** `[validator]`
- Build the app
- Launch and screenshot:
  1. Default view (t3code chat)
  2. Toggle to canvas (should show Chat + Terminal default template)
  3. Add a Files pane from the menu
  4. Add a Search pane
  5. Switch threads (canvas layout should swap)
  6. Zen mode toggle
- Verify no regressions to t3code's chat, sidebar, or agent functionality

## Acceptance Criteria
- [ ] LiteEditor's ActivityBar, sidebar, and MenuBar are completely removed
- [ ] UnifiedTitlebar matches LiteImage pattern: `[App name] [Layout toggles + Add] [Span + Window controls]`
- [ ] Canvas/Zen mode toggle in the header works
- [ ] Add Pane menu lists all pane types including Files, Search, Settings
- [ ] File explorer, search, git, and settings render correctly as canvas panes
- [ ] Clicking a thread in t3code's sidebar loads that thread's canvas workspace
- [ ] New threads start with Chat + Terminal default template
- [ ] Template picker shows on empty canvas
- [ ] Multi-monitor span button works (conditional on display count)
- [ ] Status bar shows provider status, model, git branch
- [ ] Zen mode works with all pane types
- [ ] No regressions to t3code chat, composer, agent flow, or sidebar

## Validation Commands
```bash
# Build
cd E:/SAS/REPO_CLONES/t3code-latest-liteeditor-port && bun run build

# Type check
bun typecheck

# Tests
bun test

# E2E
node e2e/chat-pane-canvas.mjs

# Manual: launch and verify
cd apps/desktop && npx electron dist-electron/main.js
```

## Remaining Uncertainties
- Template persistence location (localStorage? SQLite? file system?) — MED confidence
- How canvas state syncs with t3code's thread state on the server — MED confidence
- Whether multi-monitor IPC handlers already exist in t3code's desktop app — need to verify

## Execution Workflow
1. Create worktree (`superpowers:using-git-worktrees`) — already on `port/liteeditor-workspace` branch
2. Write tests (`superpowers:test-driven-development`) — E2E screenshots for each phase
3. Implement (`superpowers:subagent-driven-development`) — Phase 1-5 with parallel agents
4. Debug failures (`superpowers:systematic-debugging`) — follow debugging skill
5. Verify (`superpowers:verification-before-completion`) — build, test, E2E screenshots
6. Review (`superpowers:requesting-code-review`) — review before merging
7. Finish branch (`superpowers:finishing-a-development-branch`) — merge/PR/cleanup

## Execution Echo
After implementing this plan, revisit:
- Did the plan succeed as written?
- What assumptions turned out to be wrong?
- What question, if asked during planning, would have changed the plan?

## Notes
- LiteImage's Titlebar.tsx at `C:/Projects/LiteImage/src/renderer/components/layout/Titlebar.tsx` is the exact design reference for the header
- The color system should use t3code's existing CSS variables, not LiteImage's ember/bone/stone palette
- The canvas store already supports the `'chat'` pane type — this plan adds `'files'`, `'search'`, `'settings'`
- Git pane type (`'git'`) already exists in the canvas store
- The `TemplateManager.tsx` component already exists but was never mounted — this plan wires it up
