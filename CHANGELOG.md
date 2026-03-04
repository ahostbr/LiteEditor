# Changelog

All notable changes to LiteEditor are documented in this file.

## [Unreleased]

### Performance

- Fixed file watcher consuming 7GB RAM when opening large directories (e.g. `C:\Projects`). Replaced single recursive chokidar watcher with per-directory non-recursive (`depth: 0`) watchers that are created/destroyed as folders are expanded/collapsed.
- All folders now start collapsed on project load — no automatic expansion or filesystem traversal on startup.
- File change events now trigger targeted directory refresh instead of reloading the entire file tree.

### AI Integrations and Native Webviews

- Added embedded Claude Code and Codex webview integrations in LiteEditor panels.
- Added Claude/Codex bridge wiring for host request-response handling and panel hooks.
- Added internal RPC handling and `vscode://` routing support used by extension webviews.
- Improved bridge startup and message handling (init ordering, message unwrapping, response hardening).

### Native View Lifecycle and Bounds

- Refactored native panel view lifecycle and cleanup paths.
- Added resilient attach-detach handling so session state is reset even on removal errors.
- Added native view bounds conversion and requestAnimationFrame-driven bounds updates.
- Persisted native panel view sessions to improve continuity across layout changes.

### Integrations Setup and Update Flow

- Added an integrations manager and Settings UI for Codex and Claude extension status/actions.
- Added install/update/verify/reinstall flows for managed integrations.
- Added managed-vs-external resolver behavior so LiteEditor can use managed installs first, then VS Code installs as fallback.
- Added marketplace platform-aware version selection for extension downloads.
- Added integration operation lock files and per-integration log files for better reliability and auditability.

### Context, Workspace, and Terminal Plumbing

- Added workspace onboarding and global state wiring for first-run project setup.
- Added PTY session info API and related UI updates.
- Added persisted project-root sync with Codex and VS-context store stubs for extension compatibility.

---

## [1.2.2] - 2026-02-22

### File Commands

- Added `New File`, `Open File`, and `Save As` workflows in the editor.
- Bumped app version to `1.2.2`.

---

## [1.2.1] - 2026-02-22

### UI Polish

- Added titlebar tooltips and spacing/layout refinements.
- Removed an accidental `.test-file-tree/.liteeditor` fixture artifact from the repository.

---

## [1.2.0] - 2026-02-22

### Zen Mode

Distraction-free workspace with four switchable layout modes and multi-panel support.

#### Layout Modes
- **Grid** — Automatic responsive grid with manual presets (Auto, 2x2, 3x3); drag-and-drop panel reordering
- **Splitter** — Horizontal split with draggable dividers; minimum 10% width per panel
- **Window** — Free-floating overlapping panels with drag, resize, snap zones (edges + center), and z-order management
- **Tabs** — Single-view tabbed interface with drag-to-reorder tabs and add menu

#### Panel Types
- **Editor panels** — Per-file Monaco instances with dirty state, save button, and file icon headers
- **Terminal panels** — Independent xterm.js sessions with auto-numbering and focus management
- **Browser panels** — Embedded Chromium webview with address bar, back/forward/reload, and keyboard navigation
- **Unified editor panel** — Single tabbed editor (identical to normal mode) as an alternative to separate panels

#### Unified Editor Mode
- New `zenEditorMode` setting: choose between "Separate Panels" (one editor per file) or "Unified Editor" (single tabbed editor with split pane support)
- Live toggle: switching the setting while in zen mode swaps editor panels in-place, preserving terminals and browsers
- "Open File..." in tab layout routes to the unified editor's tab bar when in unified mode
- Settings panel dropdown under new "Zen Mode" section

#### Multi-Monitor
- Span zen mode across all connected displays via titlebar button
- Restore to single monitor with the same button

#### Browser Panel Features
- Browser sessions persist across layout mode switches (hidden, not destroyed)
- Efficient bounds tracking via requestAnimationFrame for smooth resize/drag
- Auto-updates panel title from page content
- User agent modified to remove Electron tokens for site compatibility

#### Zen Mode Integration
- Auto-creates panels from normal mode's open tabs on zen entry
- Layout mode buttons in titlebar (only visible in zen mode)
- Files opened from file explorer create zen panels when in zen mode
- Panel add menu: "New Terminal" and "Open File..." from titlebar "+" button

---

### Agent Bridge & MCP Server

Local HTTP bridge and MCP server enabling external AI agents to control LiteEditor.

#### Agent Bridge (HTTP API)
- Local server on `127.0.0.1:7423` with PTY and browser endpoints
- **PTY:** list sessions, read output, write data, submit commands
- **Browser:** navigate, screenshot, read page DOM, click, type, scroll, select options, execute JS, read console logs
- Auto-focuses terminal window when external agent sends input

#### MCP Server
- Bundled FastMCP Python server exposing `pty` and `browser` tools
- Terminal output filtering: strips ANSI codes, spinner characters, progress bars, and CLI artifacts
- Agent registry at `~/.liteeditor/agents/` for multi-agent coordination
- Ctrl+key support for sending interrupt signals

---

### App Improvements

#### About Dialog
- Version, commit hash, build date, Electron/Node versions, and platform info
- GitHub link to project repository
- Build metadata auto-injected at build time via Vite define config

#### Graceful Quit
- Window close minimizes instead of exiting (prevents accidental quit)
- Exit menu item prompts to save dirty files: "Save All" / "Don't Save" / "Cancel"

#### Performance
- In-memory SQLite file-tree cache (better-sqlite3) replacing repeated filesystem scans
- Lazy-loaded directory contents with targeted invalidation on file changes
- React.lazy + Suspense for Terminal, Monaco Editor, and DiffViewer components
- V8 heap capped at 512MB to prevent memory bloat

#### Developer & Testing
- Confirm dialog component and dialog store for centralized modal management
- F12 toggles DevTools
- Test fixtures: three project templates for E2E testing (`.test-diag-tree/`, `.test-file-tree/`, `.test-diag/`)
- `window.__test` exposes editor, dialog, and UI stores for Playwright automation
- README with screenshots, LICENSE (GPL v3), and project documentation

---

## [1.1.0] - 2026-02-22

### Workspace Integration

Per-project workspace state stored in `<projectRoot>/.liteeditor/`, enabling full session restore and project isolation.

#### Session Restore
- Tabs, split pane layout, sidebar state, and app mode persist across restarts
- Cursor positions and scroll positions saved and restored per tab
- Active tab content loaded immediately; inactive tabs lazy-loaded on demand
- Missing files silently skipped during restore

#### Project Isolation
- Switching folders saves current project's state and restores the new project's state
- Each project maintains independent tab layout, UI configuration, and cursor positions
- Auto-save workspace state on a 1-second debounce whenever tabs, panes, or UI changes

#### Per-Workspace Settings
- Override global settings (font size, tab size, word wrap, etc.) on a per-project basis
- Workspace settings stored in `<projectRoot>/.liteeditor/settings.json`
- Settings panel shows workspace override indicators (accent dot) and scope selector (Global/Project)
- Reset individual settings to global defaults with one click

#### Architecture
- New `WorkspaceService` for reading/writing `.liteeditor/` files within project roots
- Workspace IPC handlers consolidated into dedicated `workspace-handlers.ts` module
- Settings and workspace IPC handlers moved out of main `index.ts` for cleaner organization

---

## [1.0.0] - 2026-02-16

### Initial Release

Lightweight code editor built with Electron, React, and Monaco Editor.

### Core Editor
- Monaco Editor integration with syntax highlighting for 80+ languages
- Multi-tab editing with drag-to-reorder tabs
- Split pane support (Ctrl+\\)
- Diff viewer for git changes
- Persistent zoom level across sessions (Ctrl+=, Ctrl+-, Ctrl+0)

### VS Code-Style Titlebar
- Three-section layout: menu bar, command center, layout toggles + window controls
- Full menu bar (File, Edit, Selection, View, Go, Terminal, Help) with keyboard shortcuts
- Command center with inline quick search for the active file (highlights matches, Enter/Shift+Enter to navigate, match counter)
- Layout toggle buttons for sidebar and terminal panel

### File Explorer
- Tree view sidebar with lazy-loaded directory expansion
- File watcher with debounced auto-refresh on external changes
- Open Folder dialog (Ctrl+Shift+O)
- OS file association support — open files directly from Windows Explorer

### Integrated Terminal
- Multiple terminal sessions with tabbed interface
- Resizable split terminal panels
- Terminal session creation, switching, and close
- Auto-creates terminal on panel open; hides panel when last terminal exits

### Git Integration
- Source control sidebar panel with changed file list
- Stage / unstage files (individual and bulk)
- Commit with summary and description
- Push, pull, and fetch
- Branch management: create, switch, delete
- Inline diff viewer from changed file list
- Discard changes

### Search
- Project-wide file search from sidebar (Ctrl+Shift+F)
- In-editor quick search via command center

### Settings
- Configurable font size, font family, tab size
- Word wrap, minimap, and line number toggles
- Terminal font size setting
- Settings persisted to disk

### Workspace Persistence
- Remembers last opened project across sessions
- Saves and restores zoom level

### Keyboard Shortcuts
- Ctrl+S — Save
- Ctrl+W — Close tab
- Ctrl+B — Toggle sidebar
- Ctrl+\\ — Split pane
- Ctrl+Shift+O — Open folder
- Ctrl+Shift+F — Search in files
- Ctrl+Shift+E — Explorer panel
- Ctrl+Shift+G — Source control panel
- Ctrl+Tab / Ctrl+Shift+Tab — Switch tabs
- Ctrl+=/-/0 — Zoom in/out/reset

### Platform
- Windows installer (NSIS) via electron-builder
- E2E test suite with Playwright
