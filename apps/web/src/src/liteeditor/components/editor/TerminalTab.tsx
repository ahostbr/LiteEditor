// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useSettingsStore } from "../../stores/settings-store";
import { useTerminalStore } from "../../stores/terminal-store";
import { useUiStore } from "../../stores/ui-store";

interface TerminalTabProps {
  sessionId: string;
}

export function TerminalTab({ sessionId }: TerminalTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const settings = useSettingsStore();
  const updateSessionMeta = useTerminalStore((s) => s.updateSessionMeta);

  useEffect(() => {
    let cancelled = false;
    window.api.pty
      .getSessionInfo(sessionId)
      .then((info) => {
        if (!info || cancelled) return;
        updateSessionMeta(sessionId, {
          shell: info.shell,
          cwd: info.cwd,
          createdAt: info.createdAt,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [sessionId, updateSessionMeta]);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      scrollback: 5000,
      theme: {
        background: "#0c0c0f",
        foreground: "#d4d4d8",
        cursor: "#d4a039",
        selectionBackground: "#d4a03930",
        black: "#2a2a35",
        red: "#d15959",
        green: "#7ec87e",
        yellow: "#d4a039",
        blue: "#7ca8cf",
        magenta: "#b888c8",
        cyan: "#6cbfb5",
        white: "#c0c0c8",
        brightBlack: "#3a3a48",
        brightRed: "#e06868",
        brightGreen: "#8fd88f",
        brightYellow: "#e8b44a",
        brightBlue: "#8fb8df",
        brightMagenta: "#c898d8",
        brightCyan: "#7ccfc5",
        brightWhite: "#d4d4d8",
      },
      fontSize: settings.terminalFontSize,
      fontFamily: "JetBrains Mono, Consolas, Courier New, monospace",
      cursorBlink: true,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    // Fit after a short delay to ensure container is sized
    setTimeout(() => {
      fitAddon.fit();
      window.api.pty.resize(sessionId, term.cols, term.rows);
    }, 50);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Send user input to PTY
    term.onData((data) => {
      window.api.pty.write(sessionId, data);
    });

    // Receive PTY output
    const unsubData = window.api.pty.onData(sessionId, (data) => {
      term.write(data);
    });

    // Handle PTY exit — remove terminal and hide panel if last one
    const unsubExit = window.api.pty.onExit(sessionId, () => {
      useTerminalStore.getState().removeTerminal(sessionId);
      if (useTerminalStore.getState().sessions.length === 0) {
        useUiStore.getState().toggleTerminalPanel();
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      window.api.pty.resize(sessionId, term.cols, term.rows);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      unsubData();
      unsubExit();
      term.dispose();
    };
  }, [sessionId]);

  // Update font size when settings change
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.fontSize = settings.terminalFontSize;
      fitAddonRef.current?.fit();
    }
  }, [settings.terminalFontSize]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ backgroundColor: "#0c0c0f" }} />
  );
}
