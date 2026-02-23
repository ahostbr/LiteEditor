"""
LiteEditor Agent Bridge -- MCP Server
======================================
Exposes two tools via FastMCP:
  • pty     – PTY session management (register, read, write, submit, ctrl, list, help)
  • browser – Browser panel control (navigate, read_page, screenshot, click, type, etc.)

Global agent directory: ~/.liteeditor/agents/  (one JSON file per agent_id)
"""

from __future__ import annotations

import json
import os
import re
import time
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any

from fastmcp import FastMCP

# ---------------------------------------------------------------------------
# HTTP bridge config
# ---------------------------------------------------------------------------
BRIDGE_URL = "http://127.0.0.1:7423"

# ---------------------------------------------------------------------------
# Terminal output filter  (ported from Kuroryuu)
# Strips ANSI codes, CLI spinners, progress bars, prompts, and other
# terminal artifacts so agents receive clean readable text.
# ---------------------------------------------------------------------------

# ANSI escape sequence patterns
_ANSI_CSI = re.compile(r"\x1b\[[0-9;]*[a-zA-Z]")          # CSI sequences
_ANSI_OSC = re.compile(r"\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)?")  # OSC (window titles)
_ANSI_OTHER = re.compile(r"\x1b[^[\]].?")                  # Other escapes

# Whole-line patterns — if a stripped line matches, drop it entirely
_CLI_UI_LINE_PATTERNS = [
    r"^0;.*Claude.*$",                        # Window title
    r"^[\s]*[✶✢✻✽●·*]+[\s]*$",               # Spinner characters only
    r"^(?:Channeling|Slithering|Wrangling|Thinking)…$",  # Spinner text
    r"^\s*·\s*thinking\)?\s*$",               # Thinking indicator
    # Asterisk-prefixed spinner lines
    r"^\*(?:Vibing|Thinking|Channeling|Slithering|Wrangling)(?:\.{2,}|…)$",
    r"^\*[A-Za-z]+\.{2,}$",                   # Generic *Word...
    r"^\(esc to interrupt.*\)$",              # Interrupt hint
    r"^ctrl\+[a-z] to edit in \w+$",          # Keyboard hint
    r"^─{10,}$",                              # Separator dashes
    # Progress bars: "Opus 4.5 17% 34K/200K" etc.
    r"^(?:Opus|Sonnet|Haiku)\s+\d+\.?\d*\s+\d+%\s+[\d.]+[KMG]?/[\d.]+[KMG]?$",
    r"^\d+%\s+[\d.]+[KMG]?/[\d.]+[KMG]?$",  # Just progress
    r"^[\d.]+[KMG]?/[\d.]+[KMG]?$",          # Just token counts
    r"^❯\s*$",                                # Empty prompt
    r"^>\s*$",                                # Empty prompt
    r"^Reading \d+ files?…$",                 # File reading indicator
    r"^Searching…$",                          # Searching indicator
    r"^Run\s+`?claude\s+install`?",           # Install hint
    r"^https?://docs\.anthropic\.com/\S*$",   # Bare docs URLs
    r"^n/docs/\S*$",                          # Truncated doc paths
    r"^or see$",                              # Fragment from install msg
    r"^for more options\.?$",                 # Fragment from install msg
    r"^\s*$",                                 # Completely empty
]
_CLI_UI_RE = re.compile("|".join(_CLI_UI_LINE_PATTERNS), re.IGNORECASE)

# Inline patterns — stripped wherever they appear (replaced with a space)
_INLINE_STRIP = [
    # Progress indicators: "Opus 4.5 0%", "Sonnet 3.5 50%", etc.
    re.compile(r"\b(?:Opus|Sonnet|Haiku)\s+\d+\.?\d*\s+\d+%", re.IGNORECASE),
    # Token counts: "0/200K", "150K/200K", "1.5M/2M"
    re.compile(r"\b\d+\.?\d*[KMG]?/\d+\.?\d*[KMG]?\b"),
    # Percentage with token count: "50% 100K/200K"
    re.compile(r"\b\d+%\s*\d+\.?\d*[KMG]?/\d+\.?\d*[KMG]?\b"),
    # Keyboard hints
    re.compile(r"ctrl\+[a-z]\s+to\s+edit\s+in\s+\w+", re.IGNORECASE),
    re.compile(r"\(?\s*esc\s+to\s+interrupt[^)]*\)?", re.IGNORECASE),
    # Installation/migration messages
    re.compile(r"Claude Code has switched from npm to native installer\.\s*", re.IGNORECASE),
    re.compile(r"Run\s+`?claude\s+install`?\s+or\s+see\s+", re.IGNORECASE),
    # Spinner text (without asterisk)
    re.compile(r"\b(?:Channeling|Slithering|Wrangling|Thinking)…\s*"),
    # Asterisk-prefixed spinner text
    re.compile(r"\*(?:Vibing|Thinking|Channeling|Slithering|Wrangling)(?:\.{2,}|…)\s*", re.IGNORECASE),
    # Generic asterisk spinner: *Word...
    re.compile(r"\*[A-Za-z]+\.{2,}\s*"),
    # Reading/searching indicators
    re.compile(r"Reading\s+\d+\s+files?…\s*", re.IGNORECASE),
    re.compile(r"Searching…\s*", re.IGNORECASE),
    # Garbled partial words from terminal overwrites
    re.compile(r"\b[A-Za-z]\s+[A-Za-z]\s+[A-Za-z]\s+[A-Za-z]\b"),
    re.compile(r"\*[a-z]+\s+", re.IGNORECASE),
    # Docs URLs mixed into output
    re.compile(r"https?://docs\.anthropic\.com/[^\s]*", re.IGNORECASE),
]


def _filter_terminal_output(text: str) -> str:
    """Strip ANSI codes and CLI artifacts from raw PTY output."""
    if not text:
        return ""

    # 1. Strip ANSI escape sequences
    text = _ANSI_CSI.sub("", text)
    text = _ANSI_OSC.sub("", text)
    text = _ANSI_OTHER.sub("", text)

    # 2. Strip inline patterns
    for pat in _INLINE_STRIP:
        text = pat.sub(" ", text)

    # 3. Handle carriage returns (progress bar overwrites)
    lines = text.split("\n")
    cleaned: list[str] = []

    for line in lines:
        if "\r" in line:
            segments = line.split("\r")
            for seg in reversed(segments):
                s = seg.strip()
                if s and len(s) > 3 and not re.match(r"^[*\s\w]{1,3}$", s):
                    line = seg
                    break
            else:
                line = segments[-1]

        trimmed = line.strip()

        if not trimmed:
            continue
        if len(trimmed) <= 2:
            continue
        # Skip lines that are mostly whitespace with scattered chars
        if len(trimmed) > 5:
            spaces = sum(1 for c in trimmed if c in " \t")
            if spaces > len(trimmed) * 0.6:
                continue
        if _CLI_UI_RE.match(trimmed):
            continue
        # Isolated spinner characters
        if len(trimmed) <= 3 and all(c in "✶✢✻✽●·*" for c in trimmed):
            continue
        # Bare progress remnants
        if re.match(r"^\d+%$", trimmed) or re.match(r"^\d+[KMG]?/\d+[KMG]?$", trimmed):
            continue

        cleaned.append(line.rstrip())

    # 4. Collapse excessive blank lines
    result = "\n".join(cleaned)
    result = re.sub(r"\n{3,}", "\n\n", result)

    return result.strip()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
AGENTS_DIR = Path.home() / ".liteeditor" / "agents"
AGENTS_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# FastMCP app
# ---------------------------------------------------------------------------
mcp = FastMCP(
    "LiteEditor Agent Bridge",
    instructions=(
        "Exposes two tools: 'pty' and 'browser'. "
        "The 'pty' tool manages terminal sessions with routed actions: "
        "register, read, write, submit, ctrl, list, help. "
        "The 'browser' tool controls browser panels with actions: "
        "list, navigate, back, forward, reload, read_page, screenshot, "
        "click, type, scroll, select_option, execute_js, console_logs, help."
    ),
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _agent_file(agent_id: str) -> Path:
    """Return the path to an agent's registry file."""
    safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in agent_id)
    return AGENTS_DIR / f"{safe}.json"


def _read_agent(agent_id: str) -> dict[str, Any] | None:
    """Load an agent's registry entry or None."""
    p = _agent_file(agent_id)
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _write_agent(agent_id: str, data: dict[str, Any]) -> None:
    """Persist an agent's registry entry."""
    _agent_file(agent_id).write_text(
        json.dumps(data, indent=2), encoding="utf-8"
    )


def _list_agents() -> list[dict[str, Any]]:
    """Return all registered agents."""
    agents: list[dict[str, Any]] = []
    for f in AGENTS_DIR.glob("*.json"):
        try:
            agents.append(json.loads(f.read_text(encoding="utf-8")))
        except (json.JSONDecodeError, OSError):
            continue
    return agents


def _pid_alive(pid: int) -> bool:
    """Check whether a PID is still running."""
    try:
        if sys.platform == "win32":
            import ctypes
            kernel32 = ctypes.windll.kernel32  # type: ignore[attr-defined]
            PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
            handle = kernel32.OpenProcess(
                PROCESS_QUERY_LIMITED_INFORMATION, False, pid
            )
            if handle:
                kernel32.CloseHandle(handle)
                return True
            return False
        else:
            os.kill(pid, 0)
            return True
    except OSError:
        return False


def _bridge_request(method: str, path: str, body: dict | None = None) -> dict:
    """Make an HTTP request to the Agent Bridge in the Electron process."""
    url = f"{BRIDGE_URL}{path}"
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            url, data=data, method=method,
            headers={"Content-Type": "application/json"},
        )
    else:
        req = urllib.request.Request(url, method=method)

    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _read_pty_output(pty_session_id: str, pid: int) -> str:
    """Read recent output from a PTY session via the HTTP bridge."""
    try:
        result = _bridge_request("POST", "/pty/read", {"session_id": pty_session_id})
        raw = result.get("output", "")
        return _filter_terminal_output(raw)
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("error", str(exc))
        except Exception:
            detail = str(exc)
        return f"[bridge error: {detail}]"
    except urllib.error.URLError:
        return (
            "[Agent bridge unavailable — is LiteEditor running?]\n"
            "The HTTP bridge at 127.0.0.1:7423 is not responding."
        )


def _talk_to_pty(pty_session_id: str, pid: int, command: str) -> str:
    """Send a command to a PTY session via /pty/talk (writes command+\\r atomically)."""
    try:
        result = _bridge_request("POST", "/pty/talk", {
            "session_id": pty_session_id,
            "command": command,
        })
        return f"Sent {result.get('bytes', len(command)+1)} bytes to '{pty_session_id}'"
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("error", str(exc))
        except Exception:
            detail = str(exc)
        return f"[bridge error: {detail}]"
    except urllib.error.URLError:
        return (
            "[Agent bridge unavailable — is LiteEditor running?]\n"
            "The HTTP bridge at 127.0.0.1:7423 is not responding."
        )


def _write_to_pty(pty_session_id: str, pid: int, data: str, auto_submit: bool = False) -> str:
    """Write data into a PTY session via the HTTP bridge."""
    try:
        result = _bridge_request("POST", "/pty/write", {
            "session_id": pty_session_id,
            "data": data,
            "auto_submit": auto_submit,
        })
        return f"Wrote {result.get('bytes', len(data))} bytes to '{pty_session_id}'"
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("error", str(exc))
        except Exception:
            detail = str(exc)
        return f"[bridge error: {detail}]"
    except urllib.error.URLError:
        return (
            "[Agent bridge unavailable — is LiteEditor running?]\n"
            "The HTTP bridge at 127.0.0.1:7423 is not responding."
        )


def _resolve_pid_from_bridge(pty_session_id: str) -> int:
    """Query the PTY bridge for the PID of a given session."""
    session = _get_bridge_session_info(pty_session_id)
    if not session:
        return 0
    try:
        return int(session.get("pid", 0))
    except (TypeError, ValueError):
        return 0


def _get_bridge_session_info(pty_session_id: str) -> dict[str, Any] | None:
    """Return one PTY session payload from the bridge by ID."""
    try:
        result = _bridge_request("GET", "/pty/list")
        for s in result.get("sessions", []):
            if s.get("id") == pty_session_id:
                return s
    except Exception:
        pass
    return None


def _list_bridge_sessions() -> str:
    """Query the PTY bridge for active sessions."""
    try:
        result = _bridge_request("GET", "/pty/list")
        sessions = result.get("sessions", [])
        if not sessions:
            return "No active PTY sessions in the bridge."
        lines = [f"Active PTY sessions ({len(sessions)}):"]
        for s in sessions:
            parts = [f"  - {s.get('id', '<unknown>')}"]
            if s.get("pid"):
                parts.append(f"pid={s['pid']}")
            if s.get("shell"):
                parts.append(f"shell={s['shell']}")
            if s.get("cwd"):
                parts.append(f"cwd={s['cwd']}")
            created_at = s.get("createdAt")
            if isinstance(created_at, (int, float)):
                started = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(created_at / 1000))
                parts.append(f"started={started}")
            lines.append("  ".join(parts))
        return "\n".join(lines)
    except urllib.error.URLError:
        return (
            "[Agent bridge unavailable — is LiteEditor running?]\n"
            "The HTTP bridge at 127.0.0.1:7423 is not responding."
        )


# ---------------------------------------------------------------------------
# PTY Tool
# ---------------------------------------------------------------------------

@mcp.tool()
def pty(
    action: str,
    agent_id: str | None = None,
    pid: int | None = None,
    pty_session_id: str | None = None,
    data: str | None = None,
    meta: dict[str, Any] | None = None,
) -> str:
    """
    PTY Bridge -- single tool, multiple actions.

    Actions
    -------
    register  – Register an agent.  Required: agent_id, pty_session_id.
                Optional: pid (auto-resolved from bridge if omitted),
                          meta (dict of extra info like shell, cwd, etc.)
    read      – Read terminal output from a registered agent.
                Required: agent_id  (the *target* agent to read from).
    write     – Write text/keystrokes to a registered agent's PTY.
                Required: agent_id (target), data (text to send).
    submit    – Send a bare carriage return (\\r) to trigger Enter.
                Required: agent_id (target).
    ctrl      – Send a Ctrl+<key> byte. Required: agent_id, data (single letter).
    list      – List active PTY sessions from the bridge.  No params needed.
    help      – Show this help text.  No extra params needed.

    The global agent directory lives at ~/.liteeditor/agents/ -- one JSON file per agent.
    """
    action = action.strip().lower()

    if action == "help":
        return _pty_action_help()

    if action == "register":
        return _pty_action_register(agent_id, pid, pty_session_id, meta)

    if action == "read":
        return _pty_action_read(agent_id)

    if action == "write":
        return _pty_action_write(agent_id, data)

    if action == "list":
        return _list_bridge_sessions()

    if action == "submit":
        return _pty_action_submit(agent_id)

    if action == "ctrl":
        return _pty_action_ctrl(agent_id, data)

    return (
        f"Unknown action '{action}'. "
        "Valid actions: register, read, write, submit, ctrl, list, help"
    )


# ---------------------------------------------------------------------------
# PTY action implementations
# ---------------------------------------------------------------------------

def _pty_action_help() -> str:
    agents = _list_agents()
    alive = [a for a in agents if _pid_alive(a.get("pid", -1))]
    lines = [
        "==================================================",
        "       LiteEditor PTY Bridge -- MCP Tool          ",
        "==================================================",
        "",
        "ACTIONS:",
        "",
        "  register   Register this agent in the global directory.",
        "             params: agent_id, pid, pty_session_id, [meta]",
        "",
        "  read       Read terminal output from another agent.",
        "             params: agent_id  (target agent)",
        "",
        "  write      Send text to another agent's PTY.",
        "             params: agent_id  (target), data  (text)",
        "",
        "  submit     Send Enter (\\r) to an agent's PTY.",
        "             params: agent_id  (target)",
        "",
        "  ctrl       Send Ctrl+<key> to an agent's PTY.",
        "             params: agent_id  (target), data  (single letter)",
        "",
        "  list       List active PTY sessions from the bridge.",
        "             (no params needed)",
        "",
        "  help       Show this help and list registered agents.",
        "",
        f"DIRECTORY: {AGENTS_DIR}",
        f"REGISTERED: {len(agents)} total, {len(alive)} alive",
        "",
    ]
    if agents:
        lines.append("AGENTS:")
        for a in agents:
            status = "alive" if _pid_alive(a.get("pid", -1)) else "DEAD"
            lines.append(
                f"  - {a['agent_id']}  pid={a['pid']}  "
                f"pty={a['pty_session_id']}  [{status}]"
            )
    return "\n".join(lines)


def _pty_action_register(
    agent_id: str | None,
    pid: int | None,
    pty_session_id: str | None,
    meta: dict[str, Any] | None,
) -> str:
    if not agent_id:
        return "Error: 'agent_id' is required for register."
    if not pty_session_id:
        return "Error: 'pty_session_id' is required for register."

    bridge_session = _get_bridge_session_info(pty_session_id)

    if not pid or pid == 0:
        pid = _resolve_pid_from_bridge(pty_session_id)

    enriched_meta: dict[str, Any] = dict(meta) if isinstance(meta, dict) else {}
    if bridge_session:
        if bridge_session.get("shell") and "shell" not in enriched_meta:
            enriched_meta["shell"] = bridge_session["shell"]
        if bridge_session.get("cwd") and "cwd" not in enriched_meta:
            enriched_meta["cwd"] = bridge_session["cwd"]
        if bridge_session.get("createdAt") and "createdAt" not in enriched_meta:
            enriched_meta["createdAt"] = bridge_session["createdAt"]

    entry: dict[str, Any] = {
        "agent_id": agent_id,
        "pid": pid,
        "pty_session_id": pty_session_id,
        "registered_at": time.time(),
        "registered_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if enriched_meta:
        entry["meta"] = enriched_meta

    _write_agent(agent_id, entry)
    return (
        f"Registered agent '{agent_id}' "
        f"(pid={pid}, pty={pty_session_id}) -> {_agent_file(agent_id)}"
    )


def _pty_action_read(agent_id: str | None) -> str:
    if not agent_id:
        return "Error: 'agent_id' is required for read."

    entry = _read_agent(agent_id)
    if entry is None:
        known = [a["agent_id"] for a in _list_agents()]
        return (
            f"Agent '{agent_id}' not found in registry.\n"
            f"Known agents: {known or '(none)'}"
        )

    pid = entry["pid"]
    warning = ""
    if not _pid_alive(pid):
        warning = (
            f"[warn] Agent '{agent_id}' (pid={pid}) may no longer be "
            "running. Output may be stale.\n\n"
        )

    return warning + _read_pty_output(entry["pty_session_id"], pid)


def _pty_action_write(agent_id: str | None, data: str | None) -> str:
    if not agent_id:
        return "Error: 'agent_id' is required for write."
    if not data:
        return "Error: 'data' is required for write."

    entry = _read_agent(agent_id)
    if entry is None:
        known = [a["agent_id"] for a in _list_agents()]
        return (
            f"Agent '{agent_id}' not found in registry.\n"
            f"Known agents: {known or '(none)'}"
        )

    pid = entry["pid"]
    warning = ""
    if not _pid_alive(pid):
        warning = (
            f"[warn] Agent '{agent_id}' (pid={pid}) may no longer be "
            "running. Attempting write anyway.\n"
        )

    _write_to_pty(entry["pty_session_id"], pid, data)
    time.sleep(0.5)
    return warning + _write_to_pty(entry["pty_session_id"], pid, "\r")


def _pty_action_submit(agent_id: str | None) -> str:
    if not agent_id:
        return "Error: 'agent_id' is required for submit."

    entry = _read_agent(agent_id)
    if entry is None:
        known = [a["agent_id"] for a in _list_agents()]
        return (
            f"Agent '{agent_id}' not found in registry.\n"
            f"Known agents: {known or '(none)'}"
        )

    pid = entry["pid"]
    warning = ""
    if not _pid_alive(pid):
        warning = (
            f"[warn] Agent '{agent_id}' (pid={pid}) may no longer be "
            "running. Attempting submit anyway.\n"
        )

    return warning + _write_to_pty(entry["pty_session_id"], pid, "\r")


def _pty_action_ctrl(agent_id: str | None, key: str | None) -> str:
    """Send a raw Ctrl+<key> byte to a PTY."""
    if not agent_id:
        return "Error: 'agent_id' is required for ctrl."
    if not key:
        return "Error: 'data' (key letter) is required for ctrl. e.g. data='c' for Ctrl+C."

    key = key.strip().lower()
    if len(key) != 1 or not key.isalpha():
        return f"Error: 'data' must be a single letter a-z, got '{key}'."

    byte = chr(ord(key) - ord('a') + 1)

    entry = _read_agent(agent_id)
    if entry is None:
        known = [a["agent_id"] for a in _list_agents()]
        return (
            f"Agent '{agent_id}' not found in registry.\n"
            f"Known agents: {known or '(none)'}"
        )

    pid = entry["pid"]
    warning = ""
    if not _pid_alive(pid):
        warning = (
            f"[warn] Agent '{agent_id}' (pid={pid}) may no longer be "
            "running. Attempting ctrl anyway.\n"
        )

    return warning + _write_to_pty(entry["pty_session_id"], pid, byte)


# ---------------------------------------------------------------------------
# Browser Tool
# ---------------------------------------------------------------------------

@mcp.tool()
def browser(
    action: str,
    session_id: str | None = None,
    url: str | None = None,
    index: int | None = None,
    text: str | None = None,
    direction: str | None = None,
    amount: int | None = None,
    element_index: int | None = None,
    option_index: int | None = None,
    code: str | None = None,
    since: int | None = None,
) -> str:
    """
    Browser Panel -- single tool, multiple actions.

    Actions
    -------
    list          – List active browser sessions. No params needed.
    navigate      – Navigate to a URL. Required: session_id, url.
    back          – Go back. Required: session_id.
    forward       – Go forward. Required: session_id.
    reload        – Reload the page. Required: session_id.
    read_page     – Read indexed interactive elements + visible text.
                    Required: session_id.
    screenshot    – Capture page as base64 PNG data URL.
                    Required: session_id.
    click         – Click element by index. Required: session_id, index.
    type          – Type text into element. Required: session_id, text.
                    Optional: index (element to focus first).
    scroll        – Scroll the page. Required: session_id, direction (up/down/left/right).
                    Optional: amount (pixels, default 300).
    select_option – Select dropdown option. Required: session_id, element_index, option_index.
    execute_js    – Execute arbitrary JavaScript. Required: session_id, code.
    console_logs  – Get console logs. Required: session_id. Optional: since (timestamp).
    help          – Show this help text.

    Use 'list' first to discover available browser sessions, then use their
    session_id for subsequent actions.
    """
    action = action.strip().lower()

    if action == "help":
        return _browser_action_help()

    if action == "list":
        return _browser_action_list()

    if action == "navigate":
        return _browser_action_navigate(session_id, url)

    if action == "back":
        return _browser_action_simple(session_id, "/browser/go-back", "go back")

    if action == "forward":
        return _browser_action_simple(session_id, "/browser/go-forward", "go forward")

    if action == "reload":
        return _browser_action_simple(session_id, "/browser/reload", "reload")

    if action == "read_page":
        return _browser_action_read_page(session_id)

    if action == "screenshot":
        return _browser_action_screenshot(session_id)

    if action == "click":
        return _browser_action_click(session_id, index)

    if action == "type":
        return _browser_action_type(session_id, text, index)

    if action == "scroll":
        return _browser_action_scroll(session_id, direction, amount)

    if action == "select_option":
        return _browser_action_select_option(session_id, element_index, option_index)

    if action == "execute_js":
        return _browser_action_execute_js(session_id, code)

    if action == "console_logs":
        return _browser_action_console_logs(session_id, since)

    return (
        f"Unknown action '{action}'. "
        "Valid actions: list, navigate, back, forward, reload, read_page, "
        "screenshot, click, type, scroll, select_option, execute_js, "
        "console_logs, help"
    )


# ---------------------------------------------------------------------------
# Browser action implementations
# ---------------------------------------------------------------------------

def _browser_bridge_error(exc: Exception) -> str:
    """Format a bridge error message."""
    if isinstance(exc, urllib.error.HTTPError):
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("error", str(exc))
        except Exception:
            detail = str(exc)
        return f"[bridge error: {detail}]"
    if isinstance(exc, urllib.error.URLError):
        return (
            "[Agent bridge unavailable — is LiteEditor running?]\n"
            "The HTTP bridge at 127.0.0.1:7423 is not responding."
        )
    return f"[error: {exc}]"


def _browser_action_help() -> str:
    return """==================================================
       LiteEditor Browser Panel -- MCP Tool
==================================================

ACTIONS:

  list          List active browser sessions.
                (no params needed)

  navigate      Navigate to a URL.
                params: session_id, url

  back          Go back in history.
                params: session_id

  forward       Go forward in history.
                params: session_id

  reload        Reload the current page.
                params: session_id

  read_page     Read page content: indexed interactive elements + visible text.
                params: session_id

  screenshot    Capture the page as a base64 PNG data URL.
                params: session_id

  click         Click an interactive element by its index.
                params: session_id, index

  type          Type text into an element.
                params: session_id, text, [index]

  scroll        Scroll the page.
                params: session_id, direction (up/down/left/right), [amount]

  select_option Select a dropdown option.
                params: session_id, element_index, option_index

  execute_js    Execute arbitrary JavaScript in the page.
                params: session_id, code

  console_logs  Get console log entries.
                params: session_id, [since]

  help          Show this help text.

WORKFLOW:
  1. browser(action="list") → get session IDs
  2. browser(action="read_page", session_id="...") → see page elements
  3. browser(action="click", session_id="...", index=5) → interact
"""


def _browser_action_list() -> str:
    try:
        result = _bridge_request("GET", "/browser/list")
        sessions = result.get("sessions", [])
        if not sessions:
            return "No active browser sessions. Open a browser panel in LiteEditor first."
        lines = [f"Active browser sessions ({len(sessions)}):"]
        for s in sessions:
            lines.append(f"  - {s}")
        return "\n".join(lines)
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_navigate(session_id: str | None, url: str | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for navigate."
    if not url:
        return "Error: 'url' is required for navigate."

    try:
        result = _bridge_request("POST", "/browser/navigate", {
            "session_id": session_id,
            "url": url,
        })
        if result.get("success"):
            return f"Navigated to: {result.get('url', url)}"
        return f"Navigation failed: {result.get('error', 'unknown error')}"
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_simple(session_id: str | None, path: str, label: str) -> str:
    if not session_id:
        return f"Error: 'session_id' is required for {label}."

    try:
        result = _bridge_request("POST", path, {"session_id": session_id})
        if result.get("success"):
            return f"Success: {label}"
        return f"Failed to {label}: {result.get('error', 'unknown error')}"
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_read_page(session_id: str | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for read_page."

    try:
        result = _bridge_request("POST", "/browser/read-page", {
            "session_id": session_id,
        })
        if not result.get("success"):
            return f"Failed to read page: {result.get('error', 'unknown error')}"

        lines = []
        lines.append(f"URL: {result.get('url', '?')}")
        lines.append(f"Title: {result.get('title', '?')}")
        lines.append("")

        elements = result.get("elements", [])
        if elements:
            lines.append(f"Interactive elements ({len(elements)}):")
            for el in elements:
                idx = el.get("index", "?")
                tag = el.get("tag", "?")
                text = el.get("text", "")
                el_type = el.get("type", "")
                href = el.get("href", "")
                value = el.get("value", "")
                placeholder = el.get("placeholder", "")
                aria = el.get("ariaLabel", "")

                desc_parts = [f"[{idx}] <{tag}>"]
                if el_type:
                    desc_parts[0] = f"[{idx}] <{tag} type={el_type}>"
                if text:
                    desc_parts.append(f'"{text[:80]}"')
                if href:
                    desc_parts.append(f"href={href[:100]}")
                if value:
                    desc_parts.append(f"value={value[:80]}")
                if placeholder:
                    desc_parts.append(f"placeholder={placeholder[:80]}")
                if aria:
                    desc_parts.append(f"aria={aria[:80]}")

                lines.append("  " + "  ".join(desc_parts))
        else:
            lines.append("No interactive elements found in viewport.")

        lines.append("")
        visible_text = result.get("visibleText", "")
        if visible_text:
            lines.append("--- Visible Text ---")
            lines.append(visible_text[:3000])

        return "\n".join(lines)
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_screenshot(session_id: str | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for screenshot."

    try:
        result = _bridge_request("POST", "/browser/screenshot", {
            "session_id": session_id,
        })
        if not result.get("success"):
            return f"Failed to capture screenshot: {result.get('error', 'unknown error')}"

        data_url = result.get("dataUrl", "")
        return data_url
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_click(session_id: str | None, index: int | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for click."
    if index is None:
        return "Error: 'index' is required for click."

    try:
        result = _bridge_request("POST", "/browser/click", {
            "session_id": session_id,
            "index": index,
        })
        if result.get("success"):
            return f"Clicked element [{index}]"
        return f"Click failed: {result.get('error', 'unknown error')}"
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_type(session_id: str | None, text: str | None, index: int | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for type."
    if text is None:
        return "Error: 'text' is required for type."

    body: dict[str, Any] = {"session_id": session_id, "text": text}
    if index is not None:
        body["index"] = index

    try:
        result = _bridge_request("POST", "/browser/type", body)
        if result.get("success"):
            target = f" into element [{index}]" if index is not None else ""
            return f"Typed text{target}"
        return f"Type failed: {result.get('error', 'unknown error')}"
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_scroll(session_id: str | None, direction: str | None, amount: int | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for scroll."
    if not direction:
        return "Error: 'direction' is required for scroll (up/down/left/right)."

    body: dict[str, Any] = {
        "session_id": session_id,
        "direction": direction,
    }
    if amount is not None:
        body["amount"] = amount

    try:
        result = _bridge_request("POST", "/browser/scroll", body)
        if result.get("success"):
            return f"Scrolled {direction}" + (f" by {amount}px" if amount else "")
        return f"Scroll failed: {result.get('error', 'unknown error')}"
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_select_option(
    session_id: str | None,
    element_index: int | None,
    option_index: int | None,
) -> str:
    if not session_id:
        return "Error: 'session_id' is required for select_option."
    if element_index is None:
        return "Error: 'element_index' is required for select_option."
    if option_index is None:
        return "Error: 'option_index' is required for select_option."

    try:
        result = _bridge_request("POST", "/browser/select-option", {
            "session_id": session_id,
            "element_index": element_index,
            "option_index": option_index,
        })
        if result.get("success"):
            return f"Selected option [{option_index}] in element [{element_index}]"
        return f"Select failed: {result.get('error', 'unknown error')}"
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_execute_js(session_id: str | None, code: str | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for execute_js."
    if not code:
        return "Error: 'code' is required for execute_js."

    try:
        result = _bridge_request("POST", "/browser/execute-js", {
            "session_id": session_id,
            "code": code,
        })
        if result.get("success"):
            js_result = result.get("result")
            if js_result is not None:
                return f"Result: {json.dumps(js_result, indent=2, default=str)}"
            return "Executed successfully (no return value)"
        return f"JS execution failed: {result.get('error', 'unknown error')}"
    except Exception as exc:
        return _browser_bridge_error(exc)


def _browser_action_console_logs(session_id: str | None, since: int | None) -> str:
    if not session_id:
        return "Error: 'session_id' is required for console_logs."

    body: dict[str, Any] = {"session_id": session_id}
    if since is not None:
        body["since"] = since

    try:
        result = _bridge_request("POST", "/browser/console-logs", body)
        if not result.get("success"):
            return f"Failed to get logs: {result.get('error', 'unknown error')}"

        logs = result.get("logs", [])
        if not logs:
            return "No console logs."

        lines = [f"Console logs ({len(logs)}):"]
        for log in logs:
            level = log.get("level", "info").upper()
            msg = log.get("message", "")
            ts = log.get("timestamp", 0)
            time_str = time.strftime("%H:%M:%S", time.localtime(ts / 1000)) if ts else "?"
            lines.append(f"  [{time_str}] {level}: {msg[:500]}")

        return "\n".join(lines)
    except Exception as exc:
        return _browser_bridge_error(exc)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    transport = os.environ.get("MCP_TRANSPORT", "stdio")
    if transport == "sse":
        port = int(os.environ.get("MCP_PORT", "7422"))
        mcp.run(transport="sse", host="127.0.0.1", port=port)
    else:
        mcp.run()
