# LiteEditor

A lightweight, fast desktop code editor built with Electron, React, and Monaco Editor.

<!-- Screenshots go here — see "Adding Images" section below -->
<!-- ![LiteEditor Screenshot](screenshots/editor.png) -->

## Features

- **Monaco Editor** — Full syntax highlighting for 80+ languages, IntelliSense, minimap, word wrap, configurable line numbers
- **Multi-Tab Editing** — Drag-to-reorder tabs, split pane support (Ctrl+\\), diff viewer for git changes
- **Integrated Terminal** — Multiple terminal sessions with tabbed interface, resizable panels, auto-creates on open
- **File Explorer** — Tree view sidebar with lazy-loaded directories, file watcher with auto-refresh on external changes
- **Git Integration** — Stage/unstage, commit, push/pull/fetch, branch management, inline diff viewer, discard changes
- **Project-Wide Search** — Regex search across all files from the sidebar (Ctrl+Shift+F)
- **Zen Mode** — Distraction-free editing with multiple layout options (grid, splitter, tabs, floating windows). Separate panels per file or unified tabbed editor mode
- **Workspace Persistence** — Per-project session restore: tabs, split layout, cursor positions, sidebar state, and settings
- **Per-Workspace Settings** — Override global settings on a per-project basis with visual indicators and one-click reset
- **Built-in Browser** — Embedded browser panels in zen mode for web development workflows
- **Custom Titlebar** — VS Code-style three-section layout with menu bar, command center search, and layout toggles

## Install

Download the latest installer from the [Releases](https://github.com/ahostbr/LiteEditor/releases) page.

Or build from source:

```bash
git clone https://github.com/ahostbr/LiteEditor.git
cd LiteEditor
npm install
npm run dist
```

The installer will be in the `dist/` folder.

## Development

```bash
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run dist         # Build Windows installer (NSIS)
npm run dist:dir     # Build portable directory (no installer)
npm run test         # Run all Playwright E2E tests
```

## Architecture

Three-process Electron app with context isolation:

```
Main Process (src/main/)         — Node.js: file I/O, git, PTY, search
  |  IPC via preload bridge
Preload (src/preload/)           — Exposes window.api with namespaced methods
  |  contextBridge
Renderer (src/renderer/)         — React 19 + Zustand state management
```

**Key tech:** Electron 34, React 19, Monaco Editor, xterm.js + node-pty, simple-git, Zustand, Tailwind CSS v4, Vite

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+S | Save |
| Ctrl+O | Open file |
| Ctrl+Shift+O | Open folder |
| Ctrl+W | Close tab |
| Ctrl+\\ | Split pane |
| Ctrl+B | Toggle sidebar |
| Ctrl+Shift+F | Search in files |
| Ctrl+Shift+E | Explorer panel |
| Ctrl+Shift+G | Source control panel |
| Ctrl+Shift+T | Toggle zen mode |
| Ctrl+Tab | Next tab |
| Ctrl+Shift+Tab | Previous tab |
| Ctrl+=/-/0 | Zoom in/out/reset |

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
