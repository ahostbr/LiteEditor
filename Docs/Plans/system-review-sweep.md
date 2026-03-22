# Plan: LiteEditor Full System Review Sweep

## Task Description
Address all issues identified in the 2026-03-20 system review: stability fixes, architecture improvements, full error reporting, unit + E2E tests, utility deduplication, IPC health checks, and pnpm enforcement.

## Objective
Bring LiteEditor from alignment score 6/10 to 9/10 by fixing every process gap identified in `Docs/system-review-2026-03-20.md`. Success = zero silent error swallowing, unit test coverage for stores, React ErrorBoundary, startup health check, and clean architecture.

## Problem Statement
The system review identified 6 divergences, 23+ silent error catches, 0 unit tests, no error boundary, duplicated utilities, undocumented IPC surface, and mixed package managers. These compound into user-facing issues (EMFILE crashes, invisible file opens, session restarts).

## Solution Approach
Sequential execution across 4 phases: Stability → Architecture → Testing → Polish. Each phase builds on the previous.

## Relevant Files

### Phase 1: Stability
- `src/renderer/App.tsx` — Add ErrorBoundary wrapper
- `src/renderer/stores/*.ts` — Replace all `catch { /* ignore */ }` with logging
- `src/renderer/stores/error-store.ts` — NEW: error tracking store
- `src/renderer/components/shared/ErrorBoundary.tsx` — NEW: React error boundary
- `src/renderer/components/shared/ToastViewport.tsx` — Extend for error toasts
- `src/main/index.ts` — Add IPC handler health check on startup
- `package.json` — Add `packageManager` field, delete `package-lock.json`

### Phase 2: Architecture
- `src/renderer/lib/session-cleanup.ts` — NEW: shared cleanup abstraction
- `src/renderer/lib/terminal-utils.ts` — NEW: extract duplicated `resolveTerminalCwd()`
- `src/renderer/stores/canvas-store.ts` — Use shared cleanup
- `src/renderer/stores/zen-store.ts` — Use shared cleanup + shared terminal utils
- `src/renderer/stores/terminal-store.ts` — Use shared terminal utils

### Phase 3: Testing
- `vitest.config.ts` — NEW: vitest configuration
- `tests/unit/stores/editor-store.test.ts` — NEW: openFile, closeTab, workspace restore
- `tests/unit/stores/canvas-store.test.ts` — NEW: removePane cleanup, hasPane
- `tests/unit/stores/zen-store.test.ts` — NEW: removePanel cleanup
- `tests/unit/lib/open-file.test.ts` — NEW: openFileInCurrentMode, ensureEditorVisible
- `tests/e2e/milestone-25-session-lifecycle.spec.ts` — NEW: open/close panes, verify no orphans
- `tests/e2e/milestone-26-maximize-restore.spec.ts` — NEW: maximize/restore preserves sessions

### Phase 4: Polish
- `Docs/ipc-api.md` — NEW: document all window.api.* methods
- `src/renderer/stores/error-store.ts` — Wire error history UI into settings/debug panel

## Step by Step Tasks

### Phase 1: Stability (8 tasks)

**Task 1.1: Enforce pnpm-only**
- Delete `package-lock.json`
- Add `"packageManager": "pnpm@10.28.2"` to `package.json`
- Files: `package.json`, `package-lock.json`

**Task 1.2: Create error store**
- New Zustand store: `error-store.ts`
- State: `errors: Array<{ id, timestamp, level, message, source, stack? }>`, max 100
- Actions: `addError(level, message, source)`, `clearErrors()`, `dismissError(id)`
- Levels: `warn`, `error`, `critical`
- Files: `src/renderer/stores/error-store.ts`

**Task 1.3: Create error toast integration**
- Wire `error-store` to existing `ToastViewport` / `toast-store`
- When `addError(level='error'|'critical')` fires, show toast notification
- `warn` level = console only, no toast
- Files: `src/renderer/stores/error-store.ts`, `src/renderer/stores/toast-store.ts`

**Task 1.4: Replace silent catches — stores**
- Grep all `catch { }` and `catch { /* ignore */ }` in `src/renderer/stores/`
- Replace with: `catch (e) { useErrorStore.getState().addError('warn', message, 'storeName') }`
- Distinguish expected errors (not a git repo) from unexpected (permission denied)
- Keep `catch {}` ONLY where truly expected (Monaco model disposal, workspace file missing on first run)
- Files: All 16 stores in `src/renderer/stores/`

**Task 1.5: Replace silent catches — components**
- Same treatment for `src/renderer/components/` and `src/renderer/App.tsx`
- Files: `App.tsx`, `FileExplorer.tsx`, `SearchPanel.tsx`, etc.

**Task 1.6: Replace silent catches — hooks**
- Same for `src/renderer/hooks/`
- Files: `useKeyboardShortcuts.ts`, `useFileWatcher.ts`, etc.

**Task 1.7: Add React ErrorBoundary**
- Create `ErrorBoundary.tsx` component that catches render errors
- Shows fallback UI with error details and "Reload" button
- Logs to error-store
- Wrap main App content (below Titlebar, above StatusBar) so titlebar stays functional
- Files: `src/renderer/components/shared/ErrorBoundary.tsx`, `src/renderer/App.tsx`

**Task 1.8: Add startup IPC health check**
- After all `registerXHandlers()` calls in `src/main/index.ts`, verify critical handlers exist
- Check: `fs:read-file`, `fs:read-tree`, `fs:write-file`, `pty:create`, `dialog:open-file`
- If any missing, log error AND send IPC event to renderer for user-visible warning
- Files: `src/main/index.ts`

### Phase 2: Architecture (4 tasks)

**Task 2.1: Extract shared session cleanup**
- Create `src/renderer/lib/session-cleanup.ts`
- Export `cleanupPaneSession(pane: { type, terminalSessionId?, terminalSessionIds?, browserSessionId?, claudeSessionId?, codexSessionId? })`
- Move cleanup logic from `canvas-store.removePane()` into this function
- Update `canvas-store.removePane()` to call it
- Update `zen-store.removePanel()` to call it
- Files: `src/renderer/lib/session-cleanup.ts`, `src/renderer/stores/canvas-store.ts`, `src/renderer/stores/zen-store.ts`

**Task 2.2: Extract shared terminal CWD resolution**
- Create `src/renderer/lib/terminal-utils.ts`
- Export `resolveTerminalCwd(explicitCwd?: string): string | undefined`
- Fallback chain: explicit → settings default → project root
- Replace duplicated implementations in `zen-store.ts` and `terminal-store.ts`
- Files: `src/renderer/lib/terminal-utils.ts`, `src/renderer/stores/zen-store.ts`, `src/renderer/stores/terminal-store.ts`

**Task 2.3: Remove duplicated language mapping in zen-store**
- `zen-store.ts` has inline `getLanguageFromExtension()` (lines ~266-279)
- Replace with import from existing `src/renderer/lib/language-map.ts`
- Files: `src/renderer/stores/zen-store.ts`

**Task 2.4: Add `canvasStore.clearWorkspaceSessions()`**
- When switching workspaces, ensure old workspace's sessions are properly cleaned up
- Use the shared `cleanupPaneSession()` from Task 2.1
- Files: `src/renderer/stores/canvas-store.ts`

### Phase 3: Testing (6 tasks)

**Task 3.1: Setup vitest**
- Install vitest: `pnpm add -D vitest @testing-library/react jsdom`
- Create `vitest.config.ts` with jsdom environment
- Add `"test:unit": "vitest"` to package.json scripts
- Files: `vitest.config.ts`, `package.json`

**Task 3.2: Unit tests — editor-store**
- Test `openFile()`: adds tab, deduplicates, handles null pane
- Test `closeTab()`: removes tab, adjusts activeTabIndex
- Test `getWorkspaceState()` / `restoreWorkspaceState()`: round-trip
- Files: `tests/unit/stores/editor-store.test.ts`

**Task 3.3: Unit tests — canvas-store**
- Test `removePane()`: verifies session cleanup calls for each type (terminal, browser, claude, codex)
- Test `hasPane()`: returns true/false correctly
- Test `addPane()`: creates pane with correct defaults
- Files: `tests/unit/stores/canvas-store.test.ts`

**Task 3.4: Unit tests — open-file**
- Test `openFileInCurrentMode()`: calls editorStore.openFile + ensureEditorVisible
- Test `ensureEditorVisible()`: creates unified-editor in zen/canvas, no-op in editor mode
- Mock `window.api.fs.readFile`
- Files: `tests/unit/lib/open-file.test.ts`

**Task 3.5: E2E — session lifecycle**
- Open terminal pane → close → verify PTY destroyed
- Open browser pane → close → verify BrowserView destroyed
- Repeat 10x → no EMFILE error
- Files: `tests/e2e/milestone-25-session-lifecycle.spec.ts`

**Task 3.6: E2E — maximize/restore preservation**
- Open Claude pane → type something → maximize → restore → verify content preserved
- Open browser pane → navigate → maximize → restore → verify URL preserved
- Files: `tests/e2e/milestone-26-maximize-restore.spec.ts`

### Phase 4: Polish (2 tasks)

**Task 4.1: Document IPC API**
- Generate `Docs/ipc-api.md` from `src/preload/index.ts`
- List every namespace, method, params, return type
- Note which are session-aware, which are fire-and-forget
- Files: `Docs/ipc-api.md`

**Task 4.2: Error history debug panel**
- Add "Error Log" section to SettingsPanel
- Shows last 50 errors from error-store with timestamp, level, source, message
- "Clear" button
- Files: `src/renderer/components/settings/SettingsPanel.tsx`, `src/renderer/stores/error-store.ts`

## Acceptance Criteria

1. `grep -r "catch { }" src/renderer/ | wc -l` returns 0 (or only documented expected cases)
2. `grep -r "catch { /\* ignore \*/ }" src/renderer/ | wc -l` returns 0
3. React ErrorBoundary catches render errors and shows fallback UI
4. Startup health check logs missing IPC handlers
5. `pnpm run test:unit` passes all store tests
6. `pnpm run test:e2e` passes session lifecycle and maximize/restore tests
7. `resolveTerminalCwd` exists in exactly 1 file (`lib/terminal-utils.ts`)
8. Session cleanup exists in exactly 1 file (`lib/session-cleanup.ts`)
9. `package-lock.json` does not exist
10. `Docs/ipc-api.md` documents all `window.api.*` methods

## Validation Commands

```bash
# Unit tests
pnpm run test:unit

# E2E tests
pnpm run test:e2e

# Verify no silent catches remain
grep -r "catch { }" src/renderer/ --include="*.ts" --include="*.tsx"
grep -r "catch { /\* ignore \*/ }" src/renderer/ --include="*.ts" --include="*.tsx"

# Verify deduplication
grep -rn "resolveTerminalCwd" src/renderer/ --include="*.ts"
# Should only appear in lib/terminal-utils.ts and imports

# Verify pnpm enforcement
cat package.json | grep packageManager
ls package-lock.json  # should not exist

# Build
pnpm run build
```

## Execution Workflow

1. Work sequentially through Phase 1 → 2 → 3 → 4
2. Build and verify after each phase
3. Run `pnpm run test:unit` after Phase 3
4. Final `pnpm run build` + full validation at end

## Assumptions Made

- Vitest is compatible with electron-vite (same Vite ecosystem)
- Error store max 100 entries is sufficient for debugging sessions
- Expected errors (not a git repo, workspace file missing on first run) keep catch but log at `warn` level
- IPC health check runs synchronously after handler registration
- Toast notifications use the existing toast-store infrastructure
