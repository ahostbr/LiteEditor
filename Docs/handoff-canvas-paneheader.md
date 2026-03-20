# Handoff: Canvas PaneHeader + Browser Nav Fix + E2E

## Status: NEEDS E2E VERIFICATION
The build compiles clean. All code changes are applied. E2E tests exist but have not been successfully run yet — the previous agent's shell was anchored to `C:\Projects\LiteYTTranscribe` which caused Playwright to launch the wrong Electron app. **You must run from `C:\Projects\LiteEditor`.**

## What Was Done

### 1. Black Screen Fix (CRITICAL — useShallow)
**File:** `src/renderer/components/canvas/PaneHeader.tsx`

The `shellNames` Zustand selector returns a new array on every call. Without `useShallow`, this violates `useSyncExternalStore`'s contract → infinite re-render → React crash → black screen.

```tsx
import { useShallow } from 'zustand/react/shallow'
const shellNames = useTerminalStore(useShallow((s) => { ... }))
```

### 2. Terminal Tab Shell Names
**File:** `src/renderer/components/canvas/PaneHeader.tsx`

Default tab labels changed from `1`, `2`, `3` to actual shell name (`pwsh`, `bash`, `cmd`). Duplicates suffixed: `pwsh`, `pwsh 2`. Custom names (right-click rename) still take precedence.

### 3. Plus Button Moved to Left
**File:** `src/renderer/components/canvas/PaneHeader.tsx`

`+` button moved from right controls into tab row, inline after last tab.

### 4. Browser Panel Navigation Fix
**Bug:** Clicking the canvas pane fullscreen button caused the browser to reload to its initial URL. MCP navigation appeared to work at the data layer but the visible viewport didn't update.

**Root cause:** `Canvas.tsx` used `key={\`maximized-${pane.id}\`}` for the fullscreen overlay — different key from the normal render's `key={pane.id}`. React treated this as unmount old + mount new. `BrowserPanel.tsx` cleanup only called `hideView` (not `destroyView`), so the old session lingered. The new mount created a fresh WebContentsView at the `initialUrl`. MCP then navigated the stale hidden session.

**Fixes applied:**
- **`Canvas.tsx` line 116:** Changed key to `key={maxPane.id}` (same as normal render). React now moves the component instead of remounting.
- **`BrowserPanel.tsx`:** Added `useCanvasStore` import. Init now checks both `zenStore` AND `canvasStore` for existing `browserSessionId`. On creation, persists sessionId to canvas-store too.

### 5. Previous Session Changes (Already in codebase)
- **Ctrl+\ split fix** — Mode-aware in `useKeyboardShortcuts.ts`
- **Canvas maximize** — `maximizedPaneId` + `toggleMaximizePane` in canvas-store, overlay in Canvas.tsx, maximized prop in CanvasPane.tsx
- **Fullscreen button** — Maximize2/Minimize2 in PaneHeader.tsx right controls
- **CWD label** — Working directory below terminal tabs in PaneHeader.tsx
- **Removed from zen mode** — Fullscreen/CWD removed from EditorPanelHeader.tsx and TerminalHeader.tsx

## E2E Tests

**File:** `tests/e2e/milestone-23-cwd-fullscreen.spec.ts`

Tests covering:
1. App renders without black screen
2. Canvas mode active on startup
3. Terminal tab shows shell name (not number)
4. Plus button in tab row (left side)
5. CWD label visible for terminal panes
6. Fullscreen button visible and functional
7. Maximize/restore cycle works
8. App stability after operations

**To run:**
```bash
npx playwright test tests/e2e/milestone-23-cwd-fullscreen.spec.ts --reporter=line
```

Also run the canvas baseline test:
```bash
npx playwright test tests/e2e/milestone-18-canvas.spec.ts --reporter=line
```

Screenshots go to `tests/e2e/screenshots/cwd-*.png`.

## Known Issue: Browser Panel Session Leak
The `BrowserPanel.tsx` cleanup calls `hideView` on unmount, not `destroyView`. Hidden sessions accumulate in `browser-manager.ts`. The key fix prevents the fullscreen trigger, but mode switching (canvas → editor → zen) can still create orphaned views. A future fix should destroy views on unmount and rely solely on store-persisted sessionIds for reuse.

## All Changed Files
| File | What changed |
|------|-------------|
| `src/renderer/components/canvas/PaneHeader.tsx` | useShallow fix, shell name tabs, +button left, fullscreen btn, cwd label |
| `src/renderer/components/canvas/Canvas.tsx` | Maximized pane key fix (`maxPane.id` not `maximized-${id}`), overlay rendering |
| `src/renderer/components/canvas/CanvasPane.tsx` | `maximized` prop + overlay render path |
| `src/renderer/components/zen-mode/BrowserPanel.tsx` | Canvas-store session reuse, canvasStore import |
| `src/renderer/stores/canvas-store.ts` | `maximizedPaneId`, `toggleMaximizePane` |
| `src/renderer/hooks/useKeyboardShortcuts.ts` | Mode-aware Ctrl+\ split |
| `src/renderer/components/zen-mode/EditorPanelHeader.tsx` | Removed fullscreen/cwd |
| `src/renderer/components/zen-mode/TerminalHeader.tsx` | Removed fullscreen/cwd |
| `tests/e2e/milestone-23-cwd-fullscreen.spec.ts` | Updated E2E tests |

## Remaining Backlog
- **Command palette** (Ctrl+Shift+P) — not yet built
- **Split down** (Ctrl+Shift+D) — not yet built
- **Project quick-switch** (Ctrl+P) — shortcut exists but disabled
- **Browser session leak** — `hideView` → `destroyView` cleanup improvement
