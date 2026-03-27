import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Play,
  Square,
  Hammer,
  FlaskConical,
  CheckCircle,
  Settings,
  Bug,
  Rocket,
  Terminal,
  Globe,
} from "lucide-react";
import { useCanvasStore } from "../../stores/canvas-store";
import { StatusDot } from "./StatusDot";
import { logWarn } from "../../stores/error-store";

interface DetectedScript {
  id: string;
  name: string;
  command: string;
  source: string;
  icon: string;
  autoDetected: boolean;
}

interface ScriptsSectionProps {
  projectId: string;
  projectRootPath: string;
}

const DEV_SERVER_NAMES = ["dev", "start", "serve", "watch", "preview"];

function isDevServerScript(name: string): boolean {
  const lower = name.toLowerCase();
  return DEV_SERVER_NAMES.some((n) => lower.includes(n));
}

const iconMap: Record<string, React.ReactNode> = {
  play: <Play size={11} />,
  build: <Hammer size={11} />,
  test: <FlaskConical size={11} />,
  lint: <CheckCircle size={11} />,
  configure: <Settings size={11} />,
  debug: <Bug size={11} />,
  rocket: <Rocket size={11} />,
  custom: <Terminal size={11} />,
};

// Track running scripts in-memory (no store needed until IPC is wired)
interface RunningScriptState {
  scriptId: string;
  terminalPaneId: string;
}

export function ScriptsSection({ projectId, projectRootPath }: ScriptsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [scripts, setScripts] = useState<DetectedScript[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningScripts, setRunningScripts] = useState<RunningScriptState[]>([]);

  useEffect(() => {
    if (expanded && scripts.length === 0) {
      setLoading(true);
      window.api.project
        .detectScripts(projectRootPath)
        .then((result) => setScripts(result as DetectedScript[]))
        .catch(() => setScripts([]))
        .finally(() => setLoading(false));
    }
  }, [expanded, projectRootPath, scripts.length]);

  const isRunning = useCallback(
    (scriptId: string) => {
      return runningScripts.some((r) => r.scriptId === scriptId);
    },
    [runningScripts],
  );

  const runScript = useCallback(
    (script: DetectedScript) => {
      // Check if already running
      if (isRunning(script.id)) return;

      // Create a terminal pane with the script command
      const paneId = useCanvasStore.getState().addPane("terminal", {
        title: `${script.name}`,
      });

      setRunningScripts((prev) => [...prev, { scriptId: script.id, terminalPaneId: paneId }]);

      // Send command after PTY initializes
      setTimeout(() => {
        const pane = useCanvasStore.getState().panes.get(paneId);
        if (pane?.terminalSessionId) {
          window.api.pty.write(pane.terminalSessionId, `${script.command}\r`);
        }
      }, 500);
    },
    [isRunning],
  );

  const stopScript = useCallback(
    (script: DetectedScript) => {
      const running = runningScripts.find((r) => r.scriptId === script.id);
      if (!running) return;

      // Kill the terminal pane's PTY session
      const pane = useCanvasStore.getState().panes.get(running.terminalPaneId);
      if (pane?.terminalSessionId) {
        try {
          // Send SIGINT (Ctrl+C) to gracefully stop
          window.api.pty.write(pane.terminalSessionId, "\x03");
        } catch (err) {
          logWarn("ScriptsSection", `Failed to stop script ${script.name}`, err);
        }
      }

      setRunningScripts((prev) => prev.filter((r) => r.scriptId !== script.id));
    },
    [runningScripts],
  );

  // Sort: dev servers first, then alphabetical
  const sortedScripts = [...scripts].sort((a, b) => {
    const aIsDev = isDevServerScript(a.name);
    const bIsDev = isDevServerScript(b.name);
    if (aIsDev !== bIsDev) return aIsDev ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  // Count running dev servers for collapsed indicator
  const runningDevCount = runningScripts.filter((r) => {
    const script = scripts.find((s) => s.id === r.scriptId);
    return script && isDevServerScript(script.name);
  }).length;

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 w-full px-2 py-0.5 text-[10px] transition-colors hover:bg-[var(--bg-muted)]"
        style={{ paddingLeft: "20px", color: "var(--text-muted)" }}
      >
        {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <Terminal size={10} />
        <span className="font-medium">Scripts</span>
        {scripts.length > 0 && (
          <span className="text-[8px] ml-0.5 opacity-60">({scripts.length})</span>
        )}
        {/* Running indicator when collapsed */}
        {!expanded && runningDevCount > 0 && (
          <StatusDot
            state="running"
            size="sm"
            title={`${runningDevCount} running`}
            className="ml-auto"
          />
        )}
      </button>

      {expanded && (
        <div>
          {loading ? (
            <div
              className="text-[9px] py-1"
              style={{ paddingLeft: "32px", color: "var(--text-muted)" }}
            >
              Detecting...
            </div>
          ) : scripts.length === 0 ? (
            <div
              className="text-[9px] py-1"
              style={{ paddingLeft: "32px", color: "var(--text-muted)" }}
            >
              No scripts found
            </div>
          ) : (
            sortedScripts.map((script) => {
              const running = isRunning(script.id);
              const isDev = isDevServerScript(script.name);

              return (
                <div
                  key={script.id}
                  className="flex items-center gap-1.5 px-2 py-0.5 group transition-colors hover:bg-[var(--bg-overlay)]"
                  style={{ paddingLeft: "32px" }}
                >
                  {/* Status indicator */}
                  <StatusDot
                    state={running ? "running" : "idle"}
                    size="sm"
                    title={running ? "Running" : "Stopped"}
                  />

                  {/* Script icon */}
                  <span style={{ color: "var(--text-muted)" }}>
                    {iconMap[script.icon] || iconMap.custom}
                  </span>

                  {/* Script name */}
                  <span
                    className="text-[10px] truncate flex-1"
                    style={{ color: running ? "var(--text-primary)" : "var(--text-secondary)" }}
                    title={script.command}
                  >
                    {script.name}
                    {isDev && !running && <span className="text-[8px] ml-1 opacity-40">dev</span>}
                  </span>

                  {/* Run/Stop button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      running ? stopScript(script) : runScript(script);
                    }}
                    className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: running ? "#ef4444" : "var(--accent)" }}
                    title={running ? `Stop ${script.name}` : `Run ${script.name}`}
                  >
                    {running ? <Square size={10} /> : <Play size={10} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
