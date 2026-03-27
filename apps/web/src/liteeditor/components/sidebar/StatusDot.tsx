import { cn } from "../../lib/cn";

export type StatusDotState = "idle" | "running" | "success" | "warning" | "error";
export type StatusDotSize = "sm" | "md";

interface StatusDotProps {
  state: StatusDotState;
  size?: StatusDotSize;
  className?: string;
  title?: string;
}

const stateColors: Record<StatusDotState, string> = {
  idle: "var(--text-muted)",
  running: "#3b82f6", // blue
  success: "#22c55e", // green
  warning: "#f59e0b", // amber
  error: "#ef4444", // red
};

const sizePx: Record<StatusDotSize, number> = {
  sm: 6,
  md: 8,
};

export function StatusDot({ state, size = "sm", className, title }: StatusDotProps) {
  const px = sizePx[size];
  const color = stateColors[state];
  const pulse = state === "running";

  return (
    <span
      className={cn("inline-block rounded-full shrink-0", pulse && "animate-pulse", className)}
      style={{
        width: px,
        height: px,
        backgroundColor: color,
      }}
      title={title}
    />
  );
}

// Priority system for status aggregation (higher = more important)
const STATUS_PRIORITY: Record<StatusDotState, number> = {
  error: 5,
  warning: 4,
  running: 3,
  success: 2,
  idle: 1,
};

/** Returns the highest-priority status from a list */
export function aggregateStatus(statuses: StatusDotState[]): StatusDotState {
  if (statuses.length === 0) return "idle";
  return statuses.reduce(
    (highest, current) => (STATUS_PRIORITY[current] > STATUS_PRIORITY[highest] ? current : highest),
    "idle" as StatusDotState,
  );
}
