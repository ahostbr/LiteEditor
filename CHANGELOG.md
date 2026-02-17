# Changelog

All notable changes to LiteEditor are documented in this file.

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
