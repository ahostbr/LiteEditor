# Plan: T3 → LiteEditor Full Rebrand

## Why This Exists

LiteEditor currently has two competing persistence systems: its own (`~/.liteeditor/`) and the T3 backend (`~/.t3/dev/`). The T3 backend leaks data from other projects (LiteGauntlet "Battle Home" panes appearing in LiteEditor). Every reference to "t3", "t3code", "@t3tools" must be eliminated. LiteEditor must be fully self-contained with zero T3 identity remaining.

## Task Description

Rename and rebrand all T3/t3code references throughout the LiteEditor codebase to LiteEditor-native naming. Keep the architecture as-is — this is a renaming job, not a rewrite. Move data paths from `~/.t3/dev/` to `~/.liteeditor/ProjectData/`. Rename packages from `@t3tools/*` to `@liteeditor/*`. Change the Electron protocol from `t3://` to `liteeditor://`.

## Objective

- Zero references to "t3", "t3code", "T3Code", "@t3tools" anywhere in the codebase
- Data stored in `~/.liteeditor/ProjectData/` instead of `~/.t3/dev/`
- Protocol scheme: `liteeditor://` instead of `t3://`
- All env vars rebranded: `LITEEDITOR_*` instead of `T3CODE_*`
- `npx turbo run build` passes after each phase
- App launches and functions identically to before

## Fact Dependencies

| Fact | Confidence | Impact if Wrong |
|------|-----------|-----------------|
| Architecture stays as-is (child process, WebSocket, same logic) | HIGH | High — plan becomes a rewrite |
| Clean slate data — no migration from ~/.t3/ needed | HIGH | Medium — would need migration tooling |
| apps/server directory name stays "server" | HIGH | Low — just more renames |
| APP_DISPLAY_NAME already says "LiteEditor" | HIGH | Low — already correct |
| USER_DATA_DIR_NAME already says "liteeditor" | HIGH | Low — already correct |
| All env vars must rename (T3CODE_* → LITEEDITOR_*) | HIGH | Medium — breaking change for any external tooling |
| Package rename @t3tools → @liteeditor is last phase | HIGH | Low — order doesn't affect correctness |

## Relevant Files

### Scope by Category

| Category | Files | Occurrences | Phase |
|----------|-------|-------------|-------|
| DESKTOP_SCHEME "t3" → "liteeditor" | 2 | 8 | 1 |
| .t3/ path refs → .liteeditor/ProjectData/ | 6 | 30 | 1 |
| T3CODE_* env vars → LITEEDITOR_* | 42 | 336 | 2 |
| "t3code" text refs | 66 | 304 | 2 |
| T3Code/T3 identifiers | 51 | 145 | 3 |
| @t3tools/* → @liteeditor/* imports | 389 | 468 | 4 |

### Key Files (Modified in Multiple Phases)
- `apps/desktop/src/main.ts` — DESKTOP_SCHEME, BASE_DIR, env vars, backend spawn
- `apps/server/src/main.ts` — env vars, data paths
- `apps/web/src/store.ts` — t3code refs, @t3tools imports
- `apps/web/src/wsTransport.ts` — WebSocket URL resolution
- `apps/web/src/wsNativeApi.ts` — API channel names
- `packages/contracts/src/` — type definitions, package name
- `packages/shared/src/` — utilities, package name

## Team Orchestration

You operate as team lead. You NEVER write code directly — you use Task tools to deploy team members.

### Team Members
| Role | Model | Focus |
|------|-------|-------|
| renamer | Sonnet | Find-and-replace with verification for each category |
| builder | Sonnet | Build verification after each phase |
| reviewer | Sonnet | Diff review, ensure no functional changes |

## Step by Step Tasks

### Phase 1: Protocol & Data Paths (smallest blast radius)
- Task 1.1: **DESKTOP_SCHEME rename** — Change `const DESKTOP_SCHEME = "t3"` to `"liteeditor"` in `apps/desktop/src/main.ts`. Update all `t3://` references in protocol registration, URL loading.
- Task 1.2: **Data path rename** — Change `BASE_DIR` from `~/.t3` to `~/.liteeditor/ProjectData`. Update `STATE_DIR` derivation. Update all `.t3/` path references in server telemetry, test files.
- Task 1.3: **Build & verify** — `npx turbo run build` passes. App launches, loads `liteeditor://app/index.html`, data stored in `~/.liteeditor/ProjectData/`.

### Phase 2: Environment Variables & Text References
- Task 2.1: **Env var rename** — Global find-replace `T3CODE_` → `LITEEDITOR_` across all 42 files. Key vars: `T3CODE_HOME`, `T3CODE_DESKTOP_WS_URL`, `T3CODE_CODEX_BINARY`, `T3CODE_CLAUDE_BINARY`, etc.
- Task 2.2: **"t3code" text rename** — Replace all "t3code" references in 66 files. Includes: process names, log prefixes, config keys, test fixtures.
- Task 2.3: **Build & verify** — `npx turbo run build`. App launches, env vars use `LITEEDITOR_*` prefix.

### Phase 3: Identifier & Branding Cleanup
- Task 3.1: **T3Code/T3 identifier rename** — Replace `T3Code`, `T3 Code`, `t3-` identifiers in 51 files. Includes: variable names, class names, comments, display strings.
- Task 3.2: **Verify no remaining t3 references** — `grep -ri "t3code\|t3tools\|T3Code\|\"t3\"" --include="*.ts" --include="*.tsx" apps/ packages/` returns zero matches (excluding node_modules/dist).
- Task 3.3: **Build & verify** — Full build + app launch.

### Phase 4: Package Rename (@t3tools → @liteeditor)
- Task 4.1: **Rename packages/contracts** — Change `package.json` name from `@t3tools/contracts` to `@liteeditor/contracts`. Update all 389 files importing from `@t3tools/contracts`.
- Task 4.2: **Rename packages/shared** — Change `package.json` name from `@t3tools/shared` to `@liteeditor/shared`. Update all imports from `@t3tools/shared`.
- Task 4.3: **Update turbo.json, pnpm-workspace.yaml** — Ensure monorepo config references new package names.
- Task 4.4: **Build & verify** — `npx turbo run build`. All imports resolve. App functions identically.
- Task 4.5: **Final grep audit** — Zero references to "t3" in any source file. `grep -ri "t3" --include="*.ts" --include="*.tsx" --include="*.json" apps/ packages/ | grep -v node_modules | grep -v dist | grep -v ".git"` returns zero relevant matches.

## Acceptance Criteria

- [ ] `grep -ri "t3code" apps/ packages/ --include="*.ts" --include="*.tsx"` → 0 matches (excluding dist/node_modules)
- [ ] `grep -ri "@t3tools" apps/ packages/ --include="*.ts" --include="*.tsx"` → 0 matches
- [ ] `grep -ri "\"t3\"" apps/desktop/src/ --include="*.ts"` → 0 matches
- [ ] `grep -ri "\.t3/" apps/ packages/ --include="*.ts"` → 0 matches
- [ ] `grep -ri "T3CODE_" apps/ packages/ --include="*.ts"` → 0 matches
- [ ] Data stored in `~/.liteeditor/ProjectData/` (no `~/.t3/` usage)
- [ ] Protocol: `liteeditor://app/index.html` loads correctly
- [ ] `npx turbo run build` passes after every phase
- [ ] App launches and functions identically in each phase

## Validation Commands

```bash
# After each phase:
npx turbo run build

# Final audit (Phase 4):
grep -ri "t3code\|t3tools\|T3Code\|T3 Code\|\"t3\"\|\.t3/" \
  --include="*.ts" --include="*.tsx" --include="*.json" \
  apps/ packages/ | grep -v node_modules | grep -v dist | grep -v ".git"

# Verify data path:
ls ~/.liteeditor/ProjectData/

# Verify protocol:
# Launch app, check DevTools console for liteeditor:// URL
```

## Remaining Uncertainties

| Item | Confidence | Impact |
|------|-----------|--------|
| Some T3 refs may be in generated files (routeTree.gen.ts) that auto-regenerate | MED | Low — will be caught by build |
| Test fixtures with hardcoded t3 paths may need manual review | MED | Low — tests may need path updates |
| The `apps/desktop/src/src/` duplicate directory has copies of main.ts | MED | Medium — need to clean up or rename both |

## Execution Echo

After implementing this plan, revisit:
- Did the plan succeed as written?
- What assumptions turned out to be wrong?
- What question, if asked during planning, would have changed the plan?

## Execution Workflow

1. Create worktree → 2. Write tests → 3. Implement → 4. Debug failures → 5. Verify → 6. Review → 7. Finish branch

## Notes

- The `apps/desktop/src/src/` directory appears to be a stale copy. Consider deleting it during Phase 1 if it's not used by the build.
- Each phase should be a separate commit on the same branch, not separate branches, since they're sequential and each depends on the prior.
- The `apps/web/src/src/` directory also appears to be a stale copy — same treatment.
