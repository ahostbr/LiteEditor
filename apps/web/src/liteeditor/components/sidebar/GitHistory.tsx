import React, { useState } from "react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { useRepositoryStore } from "../../stores/repository-store";

export function GitHistory() {
  const { commits, loadHistory } = useRepositoryStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadHistory();
        }}
        className="flex items-center gap-1 px-3 py-1.5 cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Clock size={14} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          History
        </span>
      </div>
      {isOpen && (
        <div className="pb-1">
          {commits.map((commit) => (
            <div
              key={commit.hash}
              className="px-6 py-1 hover:bg-[var(--bg-overlay)] transition-colors"
            >
              <div className="text-xs truncate" style={{ color: "var(--text-primary)" }}>
                {commit.message}
              </div>
              <div className="flex gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span>{commit.shortHash}</span>
                <span>{commit.authorName}</span>
                <span>{new Date(commit.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {commits.length === 0 && (
            <div className="px-6 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
              No commits yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
