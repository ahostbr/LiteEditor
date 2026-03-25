# Claude Wiring Parity Plan (LiteEditor <-> Claude Webview Protocol)

## Summary
Complete the remaining Claude port by implementing full protocol coverage between the embedded Claude webview and LiteEditor host, with safe-stub fallback for unsupported operations so UI never hangs.
Scope is full VS Code parity surface for request/event handling, while preserving current auth behavior (no auth rewiring).

## Decisions Locked
- Parity scope: Full VSCode parity.
- Unknown request policy: Safe stub + warning log.
- Terminal mapping: Reuse LiteEditor PTY/session APIs.
- Auth: Do not touch existing login behavior now.

## Protocol Gap Matrix (Source vs Current)
Source webview sends these host request types (discovered):
`add_marketplace`, `check_git_status`, `checkout_branch`, `close_plan_preview`, `create_new_browser_tab`, `disable_chrome_mcp`, `disable_jupyter_mcp`, `dismiss_onboarding`, `dismiss_review_upsell_banner`, `dismiss_terminal_banner`, `enable_jupyter_mcp`, `ensure_chrome_mcp_enabled`, `exec`, `fork_conversation`, `get_asset_uris`, `get_claude_state`, `get_current_selection`, `get_mcp_servers`, `get_session_request`, `get_terminal_contents`, `init`, `install_plugin`, `list_files_request`, `list_marketplaces`, `list_plugins`, `list_remote_sessions`, `list_sessions_request`, `log_event`, `login`, `new_conversation_tab`, `open_claude_in_terminal`, `open_config`, `open_config_file`, `open_content`, `open_diff`, `open_file`, `open_file_diffs`, `open_folder`, `open_help`, `open_markdown_preview`, `open_output_panel`, `open_terminal`, `open_url`, `reconnect_mcp_server`, `refresh_marketplace`, `remove_marketplace`, `remove_plan_comment`, `rename_tab`, `request_usage_update`, `rewind_code`, `set_mcp_server_enabled`, `set_model`, `set_permission_mode`, `set_plugin_enabled`, `set_thinking_level`, `show_claude_terminal_setting`, `show_notification`, `submit_oauth_code`, `teleport_session`, `uninstall_plugin`, `update_skipped_branch`.

Current LiteEditor handles only a small subset in `src/main/services/claude-bridge.ts`.

## Implementation Plan

## 1) Refactor Claude Bridge Dispatcher
File: `src/main/services/claude-bridge.ts`

- Replace ad-hoc switch with a typed dispatcher map:
  - `HostRequestType` union for all known webview request types.
  - `handleRequestByType(type, request, channelId, requestId)` returning structured response.
- Add `sendResponseOk(requestId, payload)` and `sendResponseError(requestId, message, code?)`.
- Enforce timeout-safe behavior: every incoming `type: 'request'` gets a response.
- Keep existing handlers (`init`, `get_claude_state`, sessions, io) intact unless needed for compatibility.
- Keep login path untouched; only ensure requests never hang.

## 2) Add Safe-Stub Coverage for Full Surface
File: `src/main/services/claude-bridge.ts`

- Implement no-hang stub responses for unsupported-yet operations:
  - Plugin/marketplace: `list_plugins`, `install_plugin`, etc.
  - MCP toggles/server control.
  - Teleport/session-remote operations.
  - Plan preview/comment operations not yet wired.
- Standard stub shape:
  - `success: true`, minimal expected fields, and `implemented: false`.
- Log one-line warning with request type and channelId for observability.

## 3) Wire Real Integrations Where LiteEditor Already Has Capability
Files:
`src/main/services/claude-bridge.ts`
`src/main/index.ts`
`src/preload/index.ts`
`src/renderer/App.tsx`
`src/renderer/stores/editor-store.ts`

- Real host-backed handlers:
  - `open_url` -> `shell.openExternal`.
  - `open_folder` -> existing folder dialog + project root flow.
  - `open_terminal` / `open_claude_in_terminal` / `exec` / `get_terminal_contents` -> existing PTY manager.
  - `show_notification` -> Electron dialog/notification shim with button result.
  - `open_file` / `open_content` / `open_diff` / `open_file_diffs` / `get_current_selection` / `new_conversation_tab` / `rename_tab`:
    - Add a small Main<->Renderer Claude Ops bridge using IPC request/response correlation IDs.
    - Renderer executes store actions and returns structured payloads.
- Keep `set_model`/`set_thinking_level` persisted in bridge runtime config (no auth changes).

## 4) Support Incoming Host->Webview Request/Event Types
Source expects incoming `request` subtypes:
`tool_permission_request`, `insert_at_mention`, `selection_changed`, `create_new_conversation`, `open_plugins_dialog`, `visibility_changed`, `auth_url`, `update_state`, `font_configuration_changed`, `proactive_suggestions_update`, `usage_update`.

Files:
`src/main/services/claude-bridge.ts`
`src/main/claude/claude-preload.ts`

- Ensure bridge can emit these as `type:'request'` messages when appropriate.
- Minimal required now:
  - `update_state`, `usage_update`, `visibility_changed`, `selection_changed`.
- Keep remaining types available behind helpers; emit only when data source exists.

## 5) Compatibility + Observability Hardening
File: `src/main/services/claude-bridge.ts`

- Add protocol version marker in init response payload for debugging.
- Add structured log prefix `[claude-bridge]`.
- Add guardrails:
  - Unknown request type returns safe stub response.
  - Channel/session existence checks never throw.
  - Response payloads include predictable keys.

## Public API / Interface Changes
- New internal TypeScript types in `src/main/services/claude-bridge.ts`:
  - `HostRequestType`
  - `HostResponseEnvelope`
  - `ClaudeHostOpRequest` / `ClaudeHostOpResponse` (Main<->Renderer Claude ops bridge)
- New IPC channels (preload + renderer + main):
  - `claude:host-op`
  - `claude:host-op-result`
- `window.api` additions in `src/preload/index.ts` for renderer-side Claude host op registration/response.

## Test Cases and Scenarios
- Add Playwright E2E: `tests/e2e/claude-bridge-protocol.spec.ts`
- Scenarios:
  1. `init` and `get_claude_state` resolve with non-empty config and no hang.
  2. `open_file`, `open_content`, `open_diff` produce visible editor state updates.
  3. `open_terminal` and `/fast`-style terminal action route to LiteEditor PTY.
  4. Unknown request type returns safe stub response within timeout.
  5. `tool_permission_request` round-trip resolves and returns response message.
  6. `usage_update` and `update_state` are accepted and reflected in webview state.
  7. Login-related requests still behave exactly as before (regression guard).

## Acceptance Criteria
- No Claude webview request waits indefinitely.
- Slash command and command-center actions no longer fail due to missing host handlers.
- Core editing/terminal interactions from Claude work through LiteEditor-native paths.
- Unsupported advanced features degrade gracefully with visible logs, not broken UX.

## Assumptions and Defaults
- Existing auth behavior is retained exactly as-is.
- Full parity means full protocol coverage; functional depth can be stubbed where LiteEditor lacks backing capability.
- Renderer is authoritative for editor-state actions; main process orchestrates and proxies.
- Safe-stub responses are preferred over hard failures except on malformed payloads.
