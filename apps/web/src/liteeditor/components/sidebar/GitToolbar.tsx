import React from "react";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useRepositoryStore } from "../../stores/repository-store";

export function GitToolbar() {
  const currentBranch = useRepositoryStore((s) => s.currentBranch);
  const ahead = useRepositoryStore((s) => s.ahead);
  const behind = useRepositoryStore((s) => s.behind);
  const pushOrigin = useRepositoryStore((s) => s.pushOrigin);
  const pullOrigin = useRepositoryStore((s) => s.pullOrigin);
  const fetchOrigin = useRepositoryStore((s) => s.fetchOrigin);
  const refreshStatus = useRepositoryStore((s) => s.refreshStatus);

  return (
    <div
      className="flex items-center gap-1 px-3 py-2"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {currentBranch && (
        <span className="text-xs mr-2" style={{ color: "var(--text-secondary)" }}>
          {currentBranch}
          {(ahead > 0 || behind > 0) && (
            <span style={{ color: "var(--text-muted)" }}>
              {" "}
              ({ahead > 0 && `↑${ahead}`}
              {behind > 0 && `↓${behind}`})
            </span>
          )}
        </span>
      )}
      <div className="flex-1" />
      <ToolbarBtn onClick={fetchOrigin} title="Fetch">
        <RefreshCw size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={pullOrigin} title="Pull">
        <ArrowDown size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={pushOrigin} title="Push">
        <ArrowUp size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={refreshStatus} title="Refresh">
        <RefreshCw size={14} />
      </ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1 rounded hover:bg-[var(--bg-overlay)] transition-colors"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </button>
  );
}
