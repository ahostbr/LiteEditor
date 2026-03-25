// @ts-nocheck
import type { FileDiff, DiffLine } from "../../types/repository";

interface DiffViewerProps {
  diff: FileDiff | null;
}

function lineColor(type: DiffLine["type"]): string {
  switch (type) {
    case "add":
      return "rgba(34, 197, 94, 0.12)";
    case "delete":
      return "rgba(239, 68, 68, 0.12)";
    case "hunk":
      return "rgba(96, 165, 250, 0.08)";
    default:
      return "transparent";
  }
}

function lineTextColor(type: DiffLine["type"]): string {
  switch (type) {
    case "add":
      return "#22c55e";
    case "delete":
      return "#ef4444";
    case "hunk":
      return "var(--text-muted)";
    default:
      return "var(--text-primary)";
  }
}

function linePrefix(type: DiffLine["type"]): string {
  switch (type) {
    case "add":
      return "+";
    case "delete":
      return "-";
    case "hunk":
      return "@@";
    default:
      return " ";
  }
}

export function DiffViewer({ diff }: DiffViewerProps) {
  if (!diff) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-xs">Select a file to view diff</span>
      </div>
    );
  }

  if (diff.isBinary) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-xs">Binary file — cannot display diff</span>
      </div>
    );
  }

  if (diff.hunks.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-xs">No changes</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto font-mono text-[12px] leading-[18px]">
      {/* Diff header */}
      <div
        className="sticky top-0 px-3 py-1 text-[11px] font-medium"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          color: "var(--text-secondary)",
          zIndex: 1,
        }}
      >
        {diff.path}
        <span className="ml-3" style={{ color: "#22c55e" }}>
          +{diff.additions}
        </span>
        <span className="ml-2" style={{ color: "#ef4444" }}>
          -{diff.deletions}
        </span>
      </div>

      {/* Hunks */}
      {diff.hunks.map((hunk, hi) => (
        <div key={hi}>
          {hunk.lines.map((line, li) => (
            <div
              key={`${hi}-${li}`}
              className="flex"
              style={{ backgroundColor: lineColor(line.type) }}
            >
              {/* Line numbers */}
              <span
                className="w-[40px] shrink-0 text-right pr-2 select-none"
                style={{ color: "var(--text-muted)", fontSize: "10px" }}
              >
                {line.oldLineNumber ?? ""}
              </span>
              <span
                className="w-[40px] shrink-0 text-right pr-2 select-none"
                style={{ color: "var(--text-muted)", fontSize: "10px" }}
              >
                {line.newLineNumber ?? ""}
              </span>

              {/* Prefix */}
              <span
                className="w-[16px] shrink-0 text-center select-none"
                style={{ color: lineTextColor(line.type) }}
              >
                {linePrefix(line.type)}
              </span>

              {/* Content */}
              <span
                className="flex-1 whitespace-pre-wrap break-all px-1"
                style={{
                  color: line.type === "hunk" ? "var(--text-muted)" : "var(--text-primary)",
                }}
              >
                {line.content}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
