// @ts-nocheck
import React from "react";
import { CheckSquare, Square, Plus, Minus } from "lucide-react";
import { useGitStore } from "../../stores/git-store";
import { GitFileItem } from "./GitFileItem";

export function GitChanges() {
  const { changedFiles, stageAll, unstageAll } = useGitStore();

  const stagedFiles = changedFiles.filter((f) => f.staged);
  const unstagedFiles = changedFiles.filter((f) => !f.staged);

  if (changedFiles.length === 0) {
    return (
      <div className="px-3 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
        No changes detected
      </div>
    );
  }

  return (
    <div>
      {/* Staged changes */}
      {stagedFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Staged Changes ({stagedFiles.length})
            </span>
            <button
              onClick={unstageAll}
              className="p-0.5 rounded hover:bg-[var(--bg-overlay)] transition-colors"
              title="Unstage All"
            >
              <Minus size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          {stagedFiles.map((file) => (
            <GitFileItem key={`s-${file.path}`} file={file} />
          ))}
        </div>
      )}

      {/* Unstaged changes */}
      <div>
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Changes ({unstagedFiles.length})
          </span>
          <button
            onClick={stageAll}
            className="p-0.5 rounded hover:bg-[var(--bg-overlay)] transition-colors"
            title="Stage All"
          >
            <Plus size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
        {unstagedFiles.map((file) => (
          <GitFileItem key={`u-${file.path}`} file={file} />
        ))}
      </div>
    </div>
  );
}
