# Plan: Niri-Style 2D Infinite Canvas — LiteEditor Core Rework

## Task Description

Replace LiteEditor's current normal mode (VS Code-style fixed layout) with a 2D infinite scrollable canvas inspired by Niri's paper window management paradigm. The canvas becomes the primary UI surface. Zen mode's layout engines (Grid, Splitter, Window, Tabs) are preserved as internal layout options within each canvas pane. A cmux-style project sidebar replaces the current file explorer as the primary sidebar view, enabling multi-project workflows. Full agent notification system, minimap overview, saveable layout templates, and complete per-project canvas persistence.

## Objective

Transform LiteEditor from a single-project VS Code clone into a multi-project dev workspace where panes (editors, terminals, browsers, agents) live on an infinite 2D canvas that never resizes existing panes when new ones are added — enabling the parallel agentic workflow that current tools fail to support.

**Success criteria:**
- Canvas is the default mode when LiteEditor opens
- Panes can be added in any direction without resizing neighbors
- Smooth 2D scrolling/panning with trackpad + keyboard navigation
- Cmux-style project sidebar with full status dashboard (branch, agent status, PR, ports)
- Zen layouts (Grid/Splitter/Window/Tabs) work inside canvas panes
- All existing pane types functional on canvas (editor, terminal, browser, Claude, Codex)
- Minimap overlay for bird's-eye navigation
- Agent notification system (badge, glow, OS notify — configurable)
- Saveable user layout templates
- Full canvas state persistence per project
- Product-grade polish

## Problem Statement

Agentic coding workflows require working on multiple tasks and projects in parallel. Current dev tools (VS Code, tmux, traditional terminals) use fixed layouts that don't scale — splitting panes steals space from existing work, tab-based switching loses spatial context, and single-project models force constant context switching. Theo's "agentic coding problem" describes this precisely: the hierarchy of modern dev work doesn't map to existing tools.

## Solution Approach

### Core Concept: 2D Infinite Canvas

The app window becomes a viewport into a 2D plane. Panes are placed at fixed (x, y) positions with fixed (w, h) sizes on this plane. The viewport scrolls/pans across the plane. New panes extend the plane, never shrink existing panes. Each pane can internally use any of the existing zen layout modes.

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│ Electron Window                                  │
├──────────┬──────────────────────────────────────┤
│ Project  │ Canvas Viewport                       │
│ Sidebar  │ ┌─────────────────────────────────┐  │
│          │ │  2D Canvas Surface               │  │
│ ● ProjA  │ │  ┌──────┐ ┌──────┐ ┌──────┐    │  │
│ ○ ProjB  │ │  │PaneA │ │PaneB │ │PaneC │    │  │
│ ○ ProjC  │ │  │[Grid]│ │[Tabs]│ │[Split]│   │  │
│          │ │  └──────┘ └──────┘ └──────┘    │  │
│ Overlay: │ │  ┌──────┐ ┌──────┐              │  │
│ Files    │ │  │PaneD │ │PaneE │   ...        │  │
│ Git      │ │  └──────┘ └──────┘              │  │
│ Search   │ │         ← scroll / pan →        │  │
│ Settings │ └─────────────────────────────────┘  │
├──────────┴──────────────────────────────────────┤
│ Status Bar                                       │
└─────────────────────────────────────────────────┘
```

### Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Canvas surface | CSS transforms (translate3d) on a container div | GPU-accelerated, no extra deps, works with React |
| Pane positioning | Absolute positioning within transformed container | Each pane at (x,y) with fixed (w,h) |
| Smooth scrolling | requestAnimationFrame + spring physics | Smooth momentum scrolling, snap-to-pane optional |
| State management | Zustand (canvas-store, project-store) | Consistent with existing architecture |
| Pane rendering | Existing PanelRenderer (reused) | All pane types already implemented |
| Drag-to-reorder | Pointer events + collision detection | Native, no library needed |
| Minimap | Canvas element or scaled-down DOM clone | Lightweight bird's-eye view |
| Notifications | Electron Notification API + custom pane borders | OS-level + in-app |

## Relevant Files

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/renderer/stores/canvas-store.ts` | Canvas state: pane positions, sizes, viewport scroll, focused pane, zoom level |
| `src/renderer/stores/project-store.ts` | Multi-project state: project list, active project, per-project canvas state |
| `src/renderer/components/canvas/Canvas.tsx` | The 2D scrollable canvas surface — viewport + transform container |
| `src/renderer/components/canvas/CanvasPane.tsx` | Individual pane wrapper — positioned absolutely, renders PanelRenderer inside, handles focus/drag/resize borders |
| `src/renderer/components/canvas/CanvasViewport.tsx` | Viewport controller — handles scroll/pan input, keyboard nav, smooth animation |
| `src/renderer/components/canvas/Minimap.tsx` | Bird's-eye overlay showing all panes as thumbnails with viewport indicator |
| `src/renderer/components/canvas/PaneHeader.tsx` | Per-pane header bar — title, layout mode picker, close/minimize, notification indicator |
| `src/renderer/components/sidebar/ProjectSidebar.tsx` | Cmux-style project list with status dashboard |
| `src/renderer/components/sidebar/ProjectEntry.tsx` | Single project entry — name, branch, agent status, PR, ports |
| `src/renderer/hooks/useCanvasNavigation.ts` | Keyboard + scroll navigation hook for the canvas |
| `src/renderer/hooks/useCanvasDrag.ts` | Drag-to-reorder and drag-to-move hook for panes |
| `src/renderer/hooks/usePaneSnapping.ts` | Snap-to-grid logic when placing/moving panes |
| `src/renderer/components/canvas/TemplateManager.tsx` | Save/load canvas layout templates UI |
| `src/renderer/components/canvas/AddPaneMenu.tsx` | Context menu / button for adding new panes to canvas |
| `src/main/ipc/project-handlers.ts` | IPC handlers for multi-project operations |
| `src/main/services/project-service.ts` | Multi-project management, port detection, PR status polling |
| `src/main/services/notification-service.ts` | Agent notification detection, OS notification dispatch |

### Files to MODIFY

| File | Change |
|------|--------|
| `src/renderer/stores/ui-store.ts` | Replace AppMode 'editor'\|'zen' with canvas-first model. Canvas is default. |
| `src/renderer/stores/zen-store.ts` | Refactor: zen layouts become per-pane layout options, not a global mode |
| `src/renderer/stores/layout-store.ts` | Extend: layout mode becomes per-pane property on the canvas |
| `src/renderer/stores/settings-store.ts` | Add notification settings (badge, glow, OS notify toggles), canvas defaults |
| `src/renderer/components/activity-bar/ActivityBar.tsx` | Add Projects icon as primary/first item, wire to ProjectSidebar |
| `src/renderer/components/sidebar/FileExplorer.tsx` | Make project-aware: scope to active project root |
| `src/renderer/components/sidebar/GitPanel.tsx` | Make project-aware: scope git operations to active project |
| `src/renderer/components/sidebar/SearchPanel.tsx` | Make project-aware: scope search to active project |
| `src/renderer/components/sidebar/SettingsPanel.tsx` | Add notification settings section, canvas settings section |
| `src/renderer/components/zen-mode/PanelRenderer.tsx` | Reuse in canvas context — may need minor interface changes |
| `src/renderer/App.tsx` | Replace normal mode layout with Canvas. Remove editor/zen mode toggle. |
| `src/main/services/workspace-service.ts` | Extend for multi-project canvas persistence |
| `src/main/ipc/workspace-handlers.ts` | Add project-level save/load handlers |
| `src/main/index.ts` | Register new IPC handlers, start notification service |
| `src/preload/index.ts` | Expose new project/notification APIs |

### Files to REMOVE (after migration)

| File | Reason |
|------|--------|
| Normal mode editor layout components | Replaced by canvas — specific files TBD during implementation |

## Team Orchestration

You operate as the team lead and orchestrate the team to execute this plan.
You NEVER write code directly — you use Task and Task* tools to deploy team members.

### Team Members

| Role | Responsibility |
|------|---------------|
| **Canvas Engineer** | Canvas surface, viewport, scrolling, pane positioning, drag/reorder, snap |
| **Project Sidebar Engineer** | ProjectSidebar, ProjectEntry, project-store, multi-project IPC |
| **Layout Integration Engineer** | Migrating zen layouts into per-pane mode, PanelRenderer adaptation |
| **Persistence Engineer** | Multi-project canvas state save/load, template save/load |
| **Notification Engineer** | Agent notification detection, pane glow, sidebar badges, OS notifications, settings |
| **Minimap Engineer** | Minimap overlay component, viewport indicator, click-to-navigate |
| **Navigation Engineer** | Keyboard nav hook, scroll/pan physics, focus management |
| **Integration Engineer** | App.tsx rework, sidebar scoping, activity bar updates, settings panel |
| **Test Engineer** | E2E tests for canvas, project switching, persistence, notifications |

## Step by Step Tasks

### Phase 1: Foundation (Canvas Core)

**Step 1.1: Canvas Store**
- Create `canvas-store.ts` with Zustand
- State: `panes: Map<string, CanvasPane>`, `viewportX`, `viewportY`, `focusedPaneId`, `zoom`
- `CanvasPane`: `{ id, type, x, y, width, height, layoutMode, panelState, title }`
- Actions: `addPane(type, position?)`, `removePane(id)`, `movePane(id, x, y)`, `resizePane(id, w, h)`, `setFocusedPane(id)`, `scrollTo(x, y)`, `scrollBy(dx, dy)`
- New pane placement: right of focused (default), below if shift variant
- Pane types: 'terminal' | 'editor' | 'browser' | 'unified-editor' | 'claude' | 'codex'
- Dependencies: None
- Validation: Unit tests for all store actions, especially no-neighbor-resize invariant

**Step 1.2: Canvas Viewport + Surface**
- Create `Canvas.tsx` — outer container filling available space (minus sidebar)
- Create `CanvasViewport.tsx` — handles wheel/trackpad events, translates to viewport scroll
- Inner div uses `transform: translate3d(-viewportX, -viewportY, 0)` for GPU-accelerated panning
- Smooth momentum scrolling with spring physics (requestAnimationFrame)
- Clamp viewport to canvas bounds (computed from pane positions + sizes)
- Dependencies: Step 1.1

**Step 1.3: Canvas Pane Component**
- Create `CanvasPane.tsx` — absolutely positioned wrapper
- Renders `PanelRenderer` inside (reuse existing zen-mode component)
- Visual: border, shadow, rounded corners, focus ring when active
- Pane header: title, layout mode indicator, close button
- Click to focus (updates canvas-store focusedPaneId)
- Dependencies: Step 1.1, Step 1.2

**Step 1.4: Pane Header**
- Create `PaneHeader.tsx` — top bar on each canvas pane
- Shows: pane title (auto-derived from content), pane type icon
- Controls: layout mode picker dropdown (Grid/Splitter/Window/Tabs), close button, minimize (collapse to header-only)
- Drag handle for moving pane on canvas
- Dependencies: Step 1.3

### Phase 2: Navigation & Interaction

**Step 2.1: Keyboard Navigation**
- Create `useCanvasNavigation.ts` hook
- `Ctrl+Arrow`: jump focus to nearest pane in direction
- `Ctrl+1-9`: jump to pane by index (ordered left-to-right, top-to-bottom)
- `Ctrl+Shift+N`: add new pane (opens AddPaneMenu)
- `Ctrl+Shift+Arrow`: add pane in direction relative to focused
- `Ctrl+W`: close focused pane
- `Ctrl+M`: toggle minimap
- Dependencies: Step 1.1

**Step 2.2: Drag-to-Move + Drag-to-Reorder**
- Create `useCanvasDrag.ts` hook
- Pointer events on PaneHeader drag handle
- Move pane smoothly while dragging (update position in real-time)
- Snap-to-grid on drop (configurable grid size, default 20px)
- Keyboard alternative: `Ctrl+Shift+Arrow` to move focused pane by one grid unit
- Collision avoidance: panes push aside or stack (no overlapping)
- Dependencies: Step 1.3, Step 1.4

**Step 2.3: Add Pane Menu**
- Create `AddPaneMenu.tsx` — context menu or floating menu
- Options: New Terminal, New Editor (open file), New Browser, New Claude, New Codex
- Triggered by: `Ctrl+Shift+N`, right-click on canvas empty space, "+" button
- Pane placed right of focused pane (or below with Shift)
- Dependencies: Step 1.1

**Step 2.4: Canvas Scroll Physics**
- Implement smooth momentum scrolling in CanvasViewport
- Spring-based deceleration after trackpad fling
- Optional snap-to-pane: after scroll ends, gently snap viewport to center nearest pane
- Configurable in settings: snap behavior, scroll speed, animation duration
- Dependencies: Step 1.2

### Phase 3: Project System

**Step 3.1: Project Store**
- Create `project-store.ts` with Zustand
- State: `projects: ProjectState[]`, `activeProjectId: string`
- `ProjectState`: `{ id, name, rootPath, gitBranch, agentStatus, prStatus, listeningPorts, canvasState, lastActivity }`
- Actions: `addProject(path)`, `removeProject(id)`, `setActiveProject(id)`, `updateProjectStatus(id, status)`, `renameProject(id, name)`
- Switching active project swaps the canvas to that project's saved canvas state
- Dependencies: None

**Step 3.2: Project Sidebar Component**
- Create `ProjectSidebar.tsx` — vertical list of project entries
- Create `ProjectEntry.tsx` — single project card showing:
  - Project name (bold, editable on double-click)
  - Agent status line ("Claude is waiting for input" / "idle" / "working...")
  - Git branch + working directory path (truncated)
  - PR status with number and state icon (open/merged/draft)
  - Listening ports
  - Close button (X) on hover
  - Active project gets highlighted background
  - Notification badge count
- "+" Add Project button at bottom (opens folder picker)
- Pin/unpin projects to top
- Right-click context menu: Rename, Close, Open in Explorer, Copy Path
- Dependencies: Step 3.1, reference screenshot for visual design

**Step 3.3: Project IPC + Service**
- Create `project-handlers.ts` — IPC handlers for project operations
- Create `project-service.ts` — backend service:
  - Git branch detection (poll or watch)
  - Listening port detection (scan active PTY sessions)
  - PR status fetching (GitHub CLI or API, if available)
  - Agent status tracking (parse terminal output for Claude Code patterns)
- Dependencies: Step 3.1

**Step 3.4: Sidebar Scoping**
- Modify `FileExplorer.tsx`: root path comes from active project
- Modify `GitPanel.tsx`: git operations scoped to active project path
- Modify `SearchPanel.tsx`: search scoped to active project path
- Modify `ActivityBar.tsx`: add Projects icon (folder-kanban or similar), make it the first/default view
- Active project switching triggers sidebar refresh
- Dependencies: Step 3.1, Step 3.2

### Phase 4: Layout Integration

**Step 4.1: Per-Pane Layout Modes**
- Refactor `zen-store.ts`: layout mode becomes a per-pane property in canvas-store
- Each CanvasPane has a `layoutMode: 'single' | 'grid' | 'splitter' | 'window' | 'tabs'`
- Default: 'single' (one panel fills the pane)
- When layout mode is not 'single', the pane can contain multiple sub-panels
- Reuse existing GridLayout, SplitterLayout, WindowLayout, TabLayout components inside CanvasPane
- PaneHeader layout picker switches the pane's layout mode
- Dependencies: Step 1.3, Step 1.4, existing zen layout components

**Step 4.2: Sub-Panel Management**
- Each canvas pane with a multi-panel layout manages its own sub-panels
- Sub-panel types: same as canvas pane types (terminal, editor, browser, etc.)
- Add sub-panel: "+" button inside the pane (respects current layout mode)
- Remove sub-panel: close button on sub-panel header
- State stored in canvas-store as nested structure
- Dependencies: Step 4.1

### Phase 5: Notifications

**Step 5.1: Notification Detection**
- Create `notification-service.ts` (main process)
- Monitor PTY output for agent patterns:
  - Claude Code: "waiting for your input", tool permission requests, task completion
  - Generic: OSC 9/99/777 terminal escape sequences
- Emit notification events via IPC to renderer
- Dependencies: Existing PtyManager

**Step 5.2: In-App Notification Display**
- Pane glow: animated border color on panes with pending notifications (CSS animation)
- Project sidebar badge: notification count on ProjectEntry
- Both configurable via settings (on/off toggles)
- Notification cleared when pane receives focus
- Dependencies: Step 5.1, Step 3.2, Step 1.3

**Step 5.3: OS Notifications**
- Use Electron `Notification` API for system-level notifications
- Configurable: on/off in settings
- Click notification → focus LiteEditor window + navigate to relevant pane
- Throttle: max 1 OS notification per pane per 30 seconds
- Dependencies: Step 5.1

**Step 5.4: Notification Settings**
- Add to `SettingsPanel.tsx`:
  - Toggle: Show pane border glow for agent notifications
  - Toggle: Show badge count on project sidebar
  - Toggle: Show OS notifications for agent events
  - Throttle duration (seconds)
- Store in settings-store, persist to settings.json
- Dependencies: Step 5.1, Step 5.2, Step 5.3

### Phase 6: Minimap

**Step 6.1: Minimap Overlay**
- Create `Minimap.tsx` — overlay panel toggled with `Ctrl+M`
- Shows scaled-down representation of all panes on the canvas
- Each pane rendered as a colored rectangle with type icon and truncated title
- Current viewport shown as a highlighted rectangle
- Click on minimap → scroll canvas to that area
- Drag viewport rectangle → pan canvas in real-time
- Semi-transparent background, positioned center or corner of screen
- Dependencies: Step 1.1, Step 1.2

### Phase 7: Persistence & Templates

**Step 7.1: Canvas Persistence**
- Extend `workspace-service.ts` for multi-project canvas state
- Per-project save: `<projectRoot>/.liteeditor/canvas.json`
  - All pane positions, sizes, types
  - Internal layout modes and sub-panel state
  - Editor panes: open file paths, cursor positions, scroll tops
  - Terminal panes: CWD, shell type (not process state)
  - Browser panes: URL, history
  - Canvas viewport scroll position
- Global save: `~/.liteeditor/projects.json`
  - List of open projects with paths and names
  - Active project ID
  - Project sidebar order and pin state
- Auto-save on: project switch, pane change, app close
- Restore on: app start, project add
- Dependencies: Step 1.1, Step 3.1

**Step 7.2: Layout Templates**
- Create `TemplateManager.tsx` — UI for saving/loading templates
- Save current canvas layout as named template (strips file-specific content, keeps pane arrangement)
- Templates stored in `~/.liteeditor/templates/` as JSON files
- Load template: applies pane arrangement to current project's canvas
- Access via: command palette, right-click canvas, PaneHeader menu
- Dependencies: Step 7.1

### Phase 8: App Integration

**Step 8.1: App.tsx Rework**
- Replace current normal mode layout (ActivityBar + Sidebar + Editor + Terminal) with:
  - ActivityBar + Sidebar (with ProjectSidebar as primary) + Canvas
- Remove editor/zen mode toggle — canvas IS the mode
- Zen mode entry/exit logic removed; zen layout components reused inside panes
- Terminal panel (bottom) removed — terminals live on the canvas
- Dependencies: All of Phase 1, Phase 3, Phase 4

**Step 8.2: Titlebar Updates**
- Remove zen mode layout buttons from titlebar
- Add canvas controls: minimap toggle, add pane button, template menu
- Keep: menu bar, command center search, multi-monitor span, zoom
- Dependencies: Step 8.1

**Step 8.3: Settings Integration**
- Add to SettingsPanel:
  - Canvas section: scroll speed, snap-to-grid, grid size, default pane size, animation duration
  - Notification section: badge/glow/OS notify toggles
- Dependencies: Step 5.4, Step 2.4

**Step 8.4: Keyboard Shortcut Overhaul**
- Update `useKeyboardShortcuts.ts`:
  - Remove: zen mode toggle, split pane (replaced by canvas pane add)
  - Add: canvas navigation (Ctrl+Arrow, Ctrl+1-9), add pane (Ctrl+Shift+N), minimap (Ctrl+M)
  - Keep: file operations, save, search, git, sidebar toggle
- Dependencies: Step 2.1

### Phase 9: Testing & Polish

**Step 9.1: E2E Tests**
- Canvas rendering: panes appear at correct positions
- Canvas scrolling: trackpad and keyboard navigation
- Pane CRUD: add, remove, move, resize panes
- Project switching: canvas swaps, sidebar updates
- Persistence: close/reopen preserves canvas state
- Notifications: agent activity triggers badges/glow
- Minimap: toggle, click-to-navigate
- Templates: save and load
- Dependencies: All prior phases

**Step 9.2: Performance**
- Profile canvas with 20+ panes — ensure smooth scrolling
- Virtualize off-screen panes (don't render panes far outside viewport)
- Throttle position updates during drag
- Monaco editor: lazy-init models for off-screen editor panes
- xterm.js: pause rendering for off-screen terminal panes
- Dependencies: Step 9.1

**Step 9.3: Visual Polish**
- Smooth animations for pane add/remove (scale in/out)
- Viewport scroll easing (spring physics tuning)
- Pane shadow and focus ring styling
- Project sidebar visual polish matching cmux reference screenshot
- Minimap styling and transitions
- Dark theme consistency across all new components
- Dependencies: Step 9.1

## Execution Workflow

1. **Create worktree** (`superpowers:using-git-worktrees`) — isolate canvas rework from main
2. **Write tests** (`superpowers:test-driven-development`) — E2E test skeletons for each phase before implementation
3. **Implement** (`superpowers:executing-plans`) — execute phases sequentially, review at each phase boundary
4. **Debug failures** (`superpowers:systematic-debugging`) — when tests fail, diagnose root cause systematically
5. **Verify** (`superpowers:verification-before-completion`) — run all tests, visual inspection, performance profiling before claiming done
6. **Review** (`superpowers:requesting-code-review`) — code review at phase boundaries and before final merge
7. **Finish branch** (`superpowers:finishing-a-development-branch`) — structured merge/PR/cleanup

## Acceptance Criteria

- [ ] LiteEditor opens directly into canvas mode (no normal/zen mode toggle)
- [ ] Panes render at fixed positions on a 2D canvas
- [ ] Adding a new pane never resizes existing panes
- [ ] Canvas scrolls smoothly in both axes (trackpad + keyboard)
- [ ] Ctrl+Arrow jumps focus between panes directionally
- [ ] Ctrl+1-9 jumps to pane by index
- [ ] Ctrl+M toggles minimap overlay; click minimap to navigate
- [ ] Panes support drag-to-move and keyboard reorder
- [ ] Each pane can switch between Grid/Splitter/Window/Tabs internal layouts
- [ ] All pane types work: editor, terminal, browser, Claude, Codex
- [ ] Cmux-style project sidebar shows: name, branch, agent status, PR, ports
- [ ] Clicking a project in sidebar switches canvas to that project
- [ ] File explorer, git panel, search scoped to active project
- [ ] Agent notifications: pane glow + sidebar badge + OS notification (all togglable)
- [ ] Canvas layout saveable as named template, loadable on any project
- [ ] Full canvas state persisted per project (survives app restart)
- [ ] Smooth performance with 20+ panes
- [ ] Off-screen pane virtualization (don't render what's not visible)
- [ ] All E2E tests pass

## Validation Commands

```bash
cd C:/Projects/LiteEditor

# Build check
pnpm run build

# Type check
pnpm run typecheck

# E2E tests
pnpm run test:e2e

# Dev mode smoke test
pnpm run dev

# Performance: open app, add 20+ panes, verify smooth scrolling
# Visual: compare project sidebar against cmux reference screenshot
```

## Assumptions Made

1. Existing zen layout components (GridLayout, SplitterLayout, WindowLayout, TabLayout) can be reused inside canvas panes with minimal refactoring
2. PanelRenderer can be extracted from zen-mode context and used in canvas panes
3. CSS transform-based canvas (translate3d) will be performant enough for 20+ panes with Monaco/xterm.js
4. PR status can be fetched via `gh` CLI (GitHub CLI) if installed, graceful fallback if not
5. Port detection done by scanning active PTY sessions for common dev server patterns
6. Agent status detection relies on parsing terminal output patterns (OSC sequences + Claude Code-specific strings)
7. React 19's rendering model handles the canvas without performance issues (may need virtualization)
8. No library needed for canvas — CSS transforms + pointer events sufficient
9. Template format is JSON matching the canvas-store schema (minus file-specific content)
10. Multi-monitor spanning still works with the canvas model

## Notes

### Inspiration Sources
- **Niri** (github.com/niri-wm/niri): Scrollable tiling Wayland compositor — the "paper window manager" paradigm where new windows never resize existing ones
- **Cmux** (cmux.dev): Ghostty-based macOS terminal with vertical project tabs, agent notifications, workspace management
- **Theo's video** ("So I stopped using Ghostty..."): Articulates the parallel agentic workflow problem and envisions a unified dev workspace with Niri-style scrolling inside an app

### Key Design Principles
1. **New panes never resize existing panes** — the core Niri principle
2. **Project-first organization** — sidebar organizes by project, canvas is per-project
3. **Composable layouts** — canvas for macro-organization, zen layouts for micro-organization within panes
4. **Keyboard-navigable** — every action reachable via keyboard
5. **Progressive complexity** — single pane is simple, multi-pane + layouts are opt-in depth

### Risk Areas
- **Performance**: Monaco Editor + xterm.js are heavy. 20+ panes may stress rendering. Virtualization is critical.
- **Electron WebContentsView**: Browser panes use native views with position tracking. Moving them on a CSS-transform canvas may require special handling (BrowserViews don't transform with CSS).
- **Claude/Codex webviews**: Same as browser — native views need bounds syncing with canvas scroll position.
- **State complexity**: Multi-project × per-project canvas × per-pane layout × sub-panels = deep nested state. Zustand selectors must be precise to avoid re-render cascades.

### Migration Strategy
- Build canvas system alongside existing normal/zen modes
- Switch default mode to canvas once stable
- Keep zen mode components as internal dependencies (used inside canvas panes)
- Remove normal mode layout code only after canvas is fully validated
