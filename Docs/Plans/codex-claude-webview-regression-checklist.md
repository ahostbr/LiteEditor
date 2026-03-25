# Codex/Claude/Webview Regression Checklist

## Scope
- Verify embedded webviews stay inside assigned panel bounds.
- Verify core Codex host bridge endpoints and setup flow remain stable.
- Verify Claude and browser panels still share the same bounds behavior.

## Preflight
- Use a fresh `dist\\win-unpacked` launch after build.
- Open a workspace folder with at least one file and one terminal.
- Keep Developer Tools open for console errors while testing.

## Layout And Bounds
- Open Codex panel from Zen area and confirm no overlap outside its box.
- Resize main window to small and large sizes and confirm Codex stays clipped correctly.
- Toggle sidebar/panel visibility and confirm Codex view follows layout.
- Switch between editor, terminal, Codex, Claude, and browser tabs and confirm no pop-out behavior.
- Close and reopen each tab type and confirm bounds are restored correctly.

## Codex Setup And Runtime
- Open Codex from a cold start and confirm setup screen loads without error boundary.
- Complete initial prompt send and confirm a response is returned.
- Open model picker and switch model at least once.
- Open slash-command picker and verify the menu background is opaque and readable.
- Confirm no repeated transport errors appear in main-process logs.

## Host Endpoint Contract
- Confirm `workspace-root-options` and `active-workspace-roots` return usable data.
- Confirm `get-global-state` and `set-global-state` round-trip a test key.
- Confirm `get-configuration` and `set-configuration` round-trip a test key.
- Confirm `paths-exist` returns `existingPaths` for valid paths.
- Confirm `open-in-targets`, `child-processes`, and `has-custom-cli-executable` return valid default shapes.

## Terminal And PTY
- Create a terminal and confirm PTY metadata is present (session id, pid/shell if exposed).
- Split or create another terminal and confirm both sessions remain functional.
- Restart app and confirm terminal restore behavior does not break webview bounds.

## Pass Criteria
- No Codex/Claude/browser panel renders outside intended bounds.
- No Codex setup error boundary on cold start.
- No blocking bridge errors in console for required internal endpoints.
- Core chat, model switching, slash-command picker, and terminal interactions all succeed.
