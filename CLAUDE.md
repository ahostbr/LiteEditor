# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LiteEditor is a lightweight desktop code editor built with Electron + React + Monaco Editor. It features an integrated terminal (xterm.js + node-pty), Git integration (simple-git), file explorer, project-wide search, and a VS Code-style custom titlebar.

## Development Commands

```bash
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run dist         # Build Windows installer (NSIS)
npm run dist:dir     # Build portable directory
npm run test         # Run all Playwright E2E tests
npm run test:e2e     # Run E2E tests only
npx playwright test tests/e2e/milestone-03-editor.spec.ts  # Run a single test file
```

## Architecture

Three-process Electron app with context isolation:

```
Main Process (src/main/)         ← Node.js: file I/O, git, PTY, search
  ↕ IPC via preload bridge
Preload (src/preload/index.ts)   ← Exposes window.api with namespaced methods
  ↕ contextBridge
Renderer (src/renderer/)         ← React 19 UI with Zustand state management
```

### Main Process (`src/main/`)

- **`index.ts`** — App entry: single-instance lock, BrowserWindow creation (frameless with custom titlebar), IPC registration, file association handling, settings/workspace persistence.
- **`ipc/`** — IPC handler modules grouped by domain: `fs-handlers`, `git-handlers`, `pty-handlers`, `search-handlers`, `shell-handlers`.
- **`services/`** — Business logic: `GitService` (simple-git wrapper), `PtyManager` (node-pty session manager), `FileWatcher` (chokidar with debounce), `SearchService` (recursive regex search).

### Preload (`src/preload/index.ts`)

Exposes `window.api` with namespaces: `fs`, `git`, `pty`, `search`, `shell`, `window`, `settings`, `workspace`, `dialog`, plus `onOpenFile()` listener.

### Renderer (`src/renderer/`)

- **Stores** (`stores/`) — Six Zustand stores: `editor-store` (tabs, panes, file content), `ui-store` (sidebar/terminal visibility), `git-store`, `terminal-store`, `search-store`, `settings-store`. Accessed via `useXxxStore` hooks.
- **Components** (`components/`) — Organized by area: `titlebar/` (MenuBar, CommandCenter), `activity-bar/`, `sidebar/` (FileExplorer, GitPanel, SearchPanel, SettingsPanel), `editor/` (MonacoEditor, TabBar, SplitPane, DiffViewer), `terminal/` (TerminalPanel with xterm.js), `shared/` (FileIcon, ContextMenu).
- **Hooks** (`hooks/`) — `useKeyboardShortcuts` (global keybindings), `useFileWatcher` (FS change monitoring).
- **Lib** (`lib/`) — `language-map.ts` (extension→Monaco language), `constants.ts` (defaults, keyboard shortcuts), `cn.ts` (Tailwind class merge utility).

### IPC Communication Pattern

Renderer calls `window.api.<namespace>.<method>()` → `ipcRenderer.invoke` → main process handler → service → returns result. PTY and file-watcher use event-based IPC (`ipcRenderer.on`) for streaming data.

## Key Conventions

- **State management**: All shared UI state lives in Zustand stores, not component state. Stores call `window.api.*` for backend operations.
- **Styling**: Tailwind CSS v4 with CSS custom properties for theming (`--bg-surface`, `--accent`, etc.). Class merging via `cn()` utility.
- **Tab model**: Each editor pane maintains its own tab list. Tabs are identified by unique `id` + `path`. Panes are a tuple: `[PaneState, PaneState | null]` for optional split view.
- **File tree**: Lazy-loaded up to 3 levels deep on initial load, expands on demand.
- **Error handling**: Try-catch with console logging; UI continues on failures.
- **Build externals**: `node-pty` and `simple-git` are externalized (not bundled by Vite).

## Build Configuration

- **electron-vite** with Vite for all three processes
- **TypeScript**: Two configs — `tsconfig.node.json` (main/preload) and `tsconfig.web.json` (renderer)
- **Path alias**: `@` → `src/renderer`
- **Persistence**: Settings at `~/.liteeditor/settings.json`, workspace at `~/.liteeditor/workspace.json`

## Testing

Playwright E2E tests in `tests/e2e/` with 10 milestone suites covering window controls, file explorer, editor, split panes, terminal, git, diff viewer, search, settings, and keyboard shortcuts. Test helper at `tests/e2e/helpers/electron-app.ts` launches the Electron app.
