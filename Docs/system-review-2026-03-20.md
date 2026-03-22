# System Review: LiteEditor

## Meta Information
- Date: 2026-03-20
- Scope: Full codebase + current session changes
- Methodology: PRD System Review (process-level, not code bugs)

## Overall Alignment Score: 6/10

The codebase is a **reasonably mature desktop editor** with clean store architecture and good lazy-loading patterns, but has **systemic process gaps** in error handling, session lifecycle consistency, and test coverage that compound into user-facing issues (EMFILE crash, invisible file opens, session restarts on maximize).

---

## Divergence Analysis

### Divergence 1: Canvas vs Zen session lifecycle parity

| Attribute | Value |
|-----------|-------|
| Planned | Canvas and Zen modes should manage sessions identically |
| Actual | Zen `removePanel()` cleaned up all 4 session types since inception; Canvas `removePane()` had zero cleanup until this session |
| Classification | **Bad** |
| Root Cause | No shared cleanup abstraction. Each mode implemented independently without a contract |

**Impact**: EMFILE crash after repeated pane open/close. Fixed this session.

### Divergence 2: File-opening boilerplate proliferation

| Attribute | Value |
|-----------|-------|
| Planned | `editorStore.openFile()` is the single source of truth |
| Actual | 8+ call sites each independently checked app mode and ensured unified-editor panels existed. 4 sites were already broken (missing canvas or zen guard) |
| Classification | **Bad** |
| Root Cause | No centralized file-opening function. The invariant "editorStore tabs need a rendering surface" had no formal home |

**Impact**: Files invisible in canvas/zen mode via File > Open, search results, Windows Explorer. Fixed this session with `open-file.ts`.

### Divergence 3: Maximize/restore causes session restart

| Attribute | Value |
|-----------|-------|
| Planned | Maximize should overlay the pane, not destroy it |
| Actual | Canvas.tsx filtered out the maximized pane and re-rendered it separately, causing unmount/remount |
| Classification | **Bad** |
| Root Cause | Implementation chose the expedient path (separate render) over the stable path (portal with preserved identity) |

**Impact**: Claude/Codex sessions restart on every maximize/restore cycle. Fixed this session.

### Divergence 4: Silent error swallowing (systemic)

| Attribute | Value |
|-----------|-------|
| Planned | Graceful degradation |
| Actual | 23+ `catch { /* ignore */ }` blocks across stores with no logging, no user notification, no telemetry |
| Classification | **Bad** |
| Root Cause | No error reporting strategy defined. Each developer adds `catch {}` as path of least resistance |

**Impact**: Users don't know when Git status is stale, workspace restore failed, or session cleanup errored. The native module crash (`better-sqlite3` VERSION mismatch) silently broke ALL file operations with zero user feedback.

### Divergence 5: Zen mode not workspace-aware (intentional)

| Attribute | Value |
|-----------|-------|
| Planned | Zen = lightweight ephemeral mode |
| Actual | Zen panels aren't persisted or tied to workspaces. Switching workspaces doesn't restore Zen layout |
| Classification | **Good** (intentional design choice) |
| Root Cause | Deliberate asymmetry: Canvas = persistent workspace; Zen = scratch pad |

### Divergence 6: Duplicated utility functions

| Attribute | Value |
|-----------|-------|
| Planned | DRY codebase |
| Actual | `resolveTerminalCwd()` defined identically in both `terminal-store.ts` and `zen-store.ts`. Language mapping reinvented in zen-store when `language-map.ts` already exists |
| Classification | **Bad** (minor) |
| Root Cause | No shared utility discovery. Developers add inline helpers without checking for existing implementations |

---

## Execution Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Stores | 16 Zustand stores | High but scoped |
| IPC Methods | ~100+ across 15 namespaces | Large, undocumented |
| Components | 75 across 11 directories | Well-organized |
| E2E Tests | 24 Playwright specs | Functional coverage only |
| Unit Tests | 0 | Missing entirely |
| Session Types | 4 (PTY, Browser, Claude, Codex) | Lifecycle inconsistent until this session |
| Error Boundaries | 0 | Single error kills entire app |

---

## Pattern Compliance

- [x] Followed codebase architecture (Zustand stores + React components)
- [x] Used lazy-loading for heavy features (xterm, Monaco, Canvas, Zen)
- [x] Workspace persistence for Canvas mode
- [ ] ~~Consistent session lifecycle across modes~~ (fixed this session)
- [ ] ~~Centralized file-opening logic~~ (fixed this session)
- [ ] Error handling strategy
- [ ] Unit/integration test coverage
- [ ] IPC contract documentation
- [ ] Error boundaries in renderer

---

## System Improvement Actions

### Architecture
- [ ] **Extract shared session cleanup**: Create `lib/session-cleanup.ts` that both Canvas and Zen stores call, preventing future divergence
- [ ] **Extract `resolveTerminalCwd()`** to `lib/terminal-utils.ts` — used identically in 2 stores
- [ ] **Add React ErrorBoundary**: A single unhandled error in any component currently kills the entire renderer

### Error Handling
- [ ] **Replace `catch { /* ignore */ }` with `catch (e) { console.warn(...) }`** — at minimum, log to DevTools
- [ ] **Add user-facing error toast** for critical failures (file read errors, workspace corruption)
- [ ] **Distinguish expected errors** (not a git repo) from unexpected (permission denied)

### Testing
- [ ] **Add unit tests for stores**: editorStore.openFile, canvasStore.removePane, zenStore.removePanel
- [ ] **Add session lifecycle tests**: open pane → close pane → verify no orphaned sessions
- [ ] **Add workspace restore tests**: corrupt state → graceful recovery

### Documentation
- [ ] **Document IPC contract**: List all `window.api.*` methods, their params, return types, and error behavior
- [ ] **Document persistence model**: What gets saved, when, where, and what doesn't

### Process
- [ ] **Before adding a new session type**: Check both Canvas and Zen stores have matching cleanup
- [ ] **Before adding a new file-opening path**: Use `openFileInCurrentMode()` — don't call `editorStore.openFile()` directly

---

## Session Changes Assessment

### What worked well
- **Centralized file-opening** (`open-file.ts`) eliminated 8 scattered call sites with one function
- **Canvas `removePane()` cleanup** mirrors zen-store's pattern exactly — consistent
- **Portal-based maximize** preserves component identity without unmount/remount
- **ContextMenu portal** correctly escapes CSS transform context
- **Browser nav bar** fills a real feature gap in canvas mode
- **`canvasStore.hasPane(type)`** replaces scattered manual Map iteration

### What needs improvement
- **Native module management**: The `better-sqlite3` VERSION mismatch silently broke the entire app. Need a startup health check that reports broken IPC handlers
- **Mixed package managers**: Both `package-lock.json` and `pnpm-lock.yaml` existed, causing module version conflicts. Should enforce pnpm-only
- **No regression gate**: These bugs (invisible files, EMFILE, session restart) existed in production without any test catching them

### For next implementation
- **Add a startup diagnostic** that verifies all IPC handlers are registered (would have caught the `fs:read-file` missing handler immediately)
- **Add `"packageManager": "pnpm@10"` to package.json** to prevent accidental npm usage
- **Consider a `useCanvasPane(paneId)` hook** that returns cleanup-aware helpers, reducing the chance of forgetting session teardown
