import React from "react";

const STATUS_COLORS: Record<string, string> = {
  M: "var(--warning)",
  A: "var(--success)",
  D: "var(--error)",
  R: "var(--info)",
  C: "var(--info)",
  "?": "var(--text-muted)",
  "!": "var(--text-muted)",
  U: "var(--error)",
};

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "var(--text-muted)";
  const label = status === "?" ? "U" : status;

  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-sm"
      style={{ color }}
    >
      {label}
    </span>
  );
}
