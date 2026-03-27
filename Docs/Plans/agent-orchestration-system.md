# Plan: LiteEditor Agent Orchestration System

## Why This Exists

This is the next evolution of what Kuroryuu was always meant to be. Kuroryuu was made for a hackathon in 45 days. This is the long-term goal — an evolving project Ryan keeps working on for months and uses as his main source of income. LiteEditor becomes the proper host for everything Kuroryuu pioneered, built with real architecture instead of hackathon speed.

The problem: agents (Claude, Codex, terminal-spawned CLIs) inside LiteEditor are currently blind — they can't see or control the browser, can't spawn terminals with specific CWDs, can't open editor panes. They need full panel control to actually be useful as coding assistants. When an agent works on a task, it should be able to set up its own workspace — open the right files, browse docs, run commands in the right directory — without the user manually arranging panes.

## Task Description

Wire up LiteEditor's complete agent orchestration system:
1. Activate the existing AgentBridge HTTP server (complete dead code)
2. Add full CRUD endpoints for PTY, browser, and editor panes
3. Build a proper MCP server (reference: LiteCore's MCP server)
4. Enable Claude webview browser integration
5. Implement session linking (session IDs saved to t3code's project structure for conversation linking)
6. Wire Windows file associations (double-click to open)
7. Secure panel creation workflow (POST endpoint bearer token is weak security — need stronger model)

## Objective

- Any agent (Claude webview, Codex, terminal-spawned CLI) can spawn terminal panes with configurable CWDs
- Any agent can spawn browser panes and control them (navigate, click, screenshot, read page)
- Any agent can open files in editor panes
- All agents are peers (no leader/worker asymmetry)
- CWD configuration: absolute OR project-relative paths, defaults to project root if omitted
- Session IDs saved to t3code's project structure so conversations can be linked
- Claude session ID captured from status bar (shown at all times), linked to project
- Codex session linking deferred to a later plan
- MCP server built properly (not stubbed), LiteCore's MCP server as reference
- Panel creation security stronger than just bearer token HTTP — investigate better approaches
- Double-clicking files in Windows Explorer opens them in LiteEditor

## User's Exact Feedback (Captured Verbatim)

> "We definitely have to create the MCP server. You can look at LiteCore's MCP server for a comparison. And we also need to create the panel creation workflow as secure as possible. I feel like doing it over a POST endpoint is kind of weak security. Is there anything we can look at to do that better?"

> "Note to plan to implement these into the save data of t3code's project structure. Essentially noting what agent CLI was running there, grabbing their regex — the terminal for a session ID, for instance upon /exit in Claude there is a session given, but for us it's shown in the status bar at all times. This way convos can be linked. For Codex we will dig into that during a later plan."

> "Agents should also be able to create all panels themselves — like spawn the browser, spawn a terminal tab / new terminal panel, etc. KEY: those terminals need their working directory configurable by the agent."

## Fact Dependencies

| Fact | Confidence | Impact if Wrong |
|------|-----------|-----------------|
| AgentBridge is complete dead code, needs ~6 lines to wire | HIGH | Low — verified in code |
| ptyManager and browserManager singletons already exported | HIGH | Low — verified in code |
| PtyManager.create() needs env param for token injection | HIGH | Low — small change |
| Claude bridge hardcodes browserIntegrationSupported: false | HIGH | Low — one-line flip |
| Peer model (no leader/worker) | HIGH | Medium — if multi-agent conflicts arise, may need scoping |
| Session data saved to t3code project structure | MED | Medium — need to understand project persistence format |
| LiteCore MCP server is the right reference | MED | Medium — need to verify it matches LiteEditor's needs |
| POST endpoint security needs strengthening | HIGH | High — ⚠️ core security decision not yet resolved |
| Codex session linking deferred | HIGH | Low — explicitly out of scope |

## Relevant Files

### Existing (to modify)
| File | Action |
|------|--------|
| `apps/desktop/src/liteeditor/registerLiteEditorDesktop.ts` | Import AgentBridge, wire start/stop |
| `apps/desktop/src/liteeditor/services/agent-bridge.ts` | Add /pty/create, /browser/create, /editor/open endpoints |
| `apps/desktop/src/liteeditor/services/pty-manager.ts` | Add `env` param to `create()` for token/session injection |
| `apps/desktop/src/liteeditor/services/claude-bridge.ts` | Flip browserIntegrationSupported: true, wire get_mcp_servers |
| `apps/desktop/src/liteeditor/ipc/browser-handlers.ts` | Export browserManager singleton (already done) |
| `apps/desktop/src/liteeditor/ipc/pty-handlers.ts` | Export ptyManager singleton (already done) |
| `apps/desktop/src/main.ts` | Add process.argv parsing, second-instance handler, file association |

### New (to create)
| File | Purpose |
|------|---------|
| `apps/desktop/src/liteeditor/services/mcp-server.ts` | MCP server (reference: LiteCore's MCP server) |
| `apps/desktop/src/liteeditor/services/session-registry.ts` | In-memory session registry with resolve(), project persistence |

### Reference (read-only)
| File | Why |
|------|-----|
| LiteCore MCP server | Reference implementation for MCP server |
| `E:/SAS/CLONE/Kuroryuu-master/apps/mcp_core/pty_registry.py` | resolve() pattern, RegisteredSession fields |
| `C:/Projects/LiteTerminal/src/main/services/pty-bridge.ts` | Clean 5-layer PTY bridge pattern |
| `C:/Projects/LiteTerminal/src/renderer/components/terminal/TerminalArea.tsx` | window.__createTerminal pattern |

## Solution Approach

### Phase 1: Wire AgentBridge (smallest viable change)
1. Import AgentBridge in registerLiteEditorDesktop.ts
2. Construct with ptyManager, browserManager, getOwnerWindow
3. Call agentBridge.start() after window ready, .stop() on shutdown
4. Add `env` param to PtyManager.create() for token/session injection
5. Inject LITEEDITOR_BRIDGE_TOKEN env var when spawning PTY sessions

### Phase 2: Panel CRUD Endpoints
1. Add POST /pty/create — spawns node-pty via PtyManager, pushes pane into UI via executeJavaScript + window globals
2. Add POST /browser/create — creates WebContentsView via BrowserManager, pushes pane into UI
3. Add POST /editor/open — opens file in editor pane via executeJavaScript
4. Add DELETE /pty/{session_id} and DELETE /browser/{session_id}
5. CWD config: accept absolute or project-relative paths, default to project root
6. **Security: investigate stronger model than bearer token for panel creation** ⚠️

### Phase 3: Session Registry
1. Build in-memory SessionRegistry with Kuroryuu's resolve() pattern (typed NOT_FOUND/AMBIGUOUS errors)
2. Register sessions on PTY create, link to project structure
3. Capture Claude session ID from status bar (regex), link to project
4. Save session metadata to t3code project data on shutdown
5. Peer model — all sessions equal, no leader/worker distinction

### Phase 4: MCP Server
1. Build proper MCP server (NOT a stub) — reference LiteCore's implementation
2. Register with Claude webview via get_mcp_servers
3. Expose browser control, PTY control, editor control as MCP tools
4. Flip browserIntegrationSupported: true in ClaudeBridge.buildInitState()

### Phase 5: File Associations
1. Parse process.argv for file paths (cold launch)
2. Add app.on('second-instance') handler (hot launch)
3. Encode file path into loadURL query string OR send file:open IPC
4. Renderer handlers already exist — zero renderer changes needed

## Team Orchestration

You operate as the team lead and orchestrate the team to execute this plan.
You NEVER write code directly — you use Task and Agent tools to deploy team members.

### Team Members
| Role | Model | Focus |
|------|-------|-------|
| bridge-wirer | Sonnet | Phase 1: Wire AgentBridge, add env param to PtyManager |
| panel-crud | Opus | Phase 2: Add create/destroy endpoints, window globals, security model |
| session-registry | Sonnet | Phase 3: Build SessionRegistry, project persistence, session linking |
| mcp-builder | Opus | Phase 4: Build MCP server, wire to Claude webview |
| file-assoc | Sonnet | Phase 5: Wire file associations in main.ts |

## Step by Step Tasks

### Phase 1 (no dependencies)
- Task 1.1: Add `env?: Record<string, string>` param to PtyManager.create(), merge into spawn env
- Task 1.2: Import AgentBridge in registerLiteEditorDesktop.ts, wire start/stop
- Task 1.3: Inject LITEEDITOR_BRIDGE_TOKEN into PTY env on spawn

### Phase 2 (depends on Phase 1)
- Task 2.1: Register window.__createTerminal, __createBrowserPane, __openEditorPane globals in renderer
- Task 2.2: Add POST /pty/create endpoint (spawns PTY + pushes pane via executeJavaScript)
- Task 2.3: Add POST /browser/create endpoint (creates WebContentsView + pushes pane)
- Task 2.4: Add POST /editor/open endpoint (opens file in editor)
- Task 2.5: Add DELETE endpoints for PTY and browser cleanup
- Task 2.6: ⚠️ Research and implement stronger security model for panel creation

### Phase 3 (depends on Phase 1)
- Task 3.1: Create SessionRegistry class with register/unregister/resolve/list
- Task 3.2: Auto-register sessions on PTY create, link to AgentBridge
- Task 3.3: Capture Claude session ID from terminal output (regex on status bar pattern)
- Task 3.4: Save session metadata to t3code project structure on shutdown

### Phase 4 (depends on Phases 1, 2, 3)
- Task 4.1: Study LiteCore's MCP server implementation
- Task 4.2: Build LiteEditor MCP server with browser/PTY/editor tools
- Task 4.3: Wire get_mcp_servers in ClaudeBridge to return LiteEditor's MCP server
- Task 4.4: Flip browserIntegrationSupported: true
- Task 4.5: Test Claude webview → MCP → browser pane end-to-end

### Phase 5 (no dependencies, parallel with everything)
- Task 5.1: Add process.argv parsing in main.ts for cold launch
- Task 5.2: Add app.on('second-instance') for hot launch
- Task 5.3: Encode file path in loadURL query string OR send file:open IPC

## Acceptance Criteria

- [ ] AgentBridge starts on app boot, writes token to ~/.liteeditor/bridge-token
- [ ] External agent can POST /pty/create with {cwd: "C:/some/path"} and see a terminal pane appear
- [ ] External agent can POST /browser/create and see a browser pane appear
- [ ] External agent can POST /editor/open with {filePath: "..."} and see the file open
- [ ] Claude webview can use MCP tools to control browser pane
- [ ] Session IDs are saved to t3code project data structure
- [ ] Claude session ID captured and linked to project
- [ ] Double-clicking a file in Windows Explorer opens it in LiteEditor
- [ ] Panel creation uses a security model stronger than simple bearer token ⚠️
- [ ] All agents are peers — any agent can access any session it has the ID for
- [ ] CWD accepts absolute or project-relative paths, defaults to project root

## Validation Commands

```bash
# Build
cd C:/Projects/LiteEditor && npx turbo run build --force

# Launch
cd C:/Projects/LiteEditor && run.bat

# Test bridge is running
curl -s http://127.0.0.1:7423/pty/list -H "Authorization: Bearer $(cat ~/.liteeditor/bridge-token)"

# Test PTY create
curl -X POST http://127.0.0.1:7423/pty/create -H "Authorization: Bearer $(cat ~/.liteeditor/bridge-token)" -H "Content-Type: application/json" -d '{"cwd": "C:/Projects/LiteEditor"}'

# Test browser create
curl -X POST http://127.0.0.1:7423/browser/create -H "Authorization: Bearer $(cat ~/.liteeditor/bridge-token)" -H "Content-Type: application/json" -d '{"url": "https://google.com"}'
```

## Remaining Uncertainties

- **Panel creation security model** ⚠️ — Bearer token is weak. Need to research: capability tokens per session? Signed requests? IPC-only for panel creation with HTTP for control?
- **t3code project structure format** — Need to understand how project data is persisted to know where to save session metadata
- **LiteCore MCP server compatibility** — Need to verify it maps cleanly to LiteEditor's architecture
- **Codex session linking** — Explicitly deferred to a later plan

## Execution Echo

After implementing this plan, revisit:
- Did the plan succeed as written?
- What assumptions turned out to be wrong?
- What question, if asked during planning, would have changed the plan?
- Was the security model sufficient or did it need hardening?

## Execution Workflow

1. Create worktree → 2. Write tests → 3. Implement → 4. Debug failures → 5. Verify → 6. Review → 7. Finish branch
