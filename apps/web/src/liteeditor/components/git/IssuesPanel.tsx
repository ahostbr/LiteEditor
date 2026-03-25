// @ts-nocheck
import { useEffect, useCallback } from "react";
import { CircleDot, RefreshCw, Plus } from "lucide-react";
import { useGitHubStore } from "../../stores/github-store";
import type { Issue, IssueFilter } from "../../types/github";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

interface IssuesPanelProps {
  onCreateIssue: () => void;
}

export function IssuesPanel({ onCreateIssue }: IssuesPanelProps) {
  const issues = useGitHubStore((s) => s.issues);
  const selectedIssueNumber = useGitHubStore((s) => s.selectedIssueNumber);
  const issueFilter = useGitHubStore((s) => s.issueFilter);
  const isLoading = useGitHubStore((s) => s.isLoading);
  const loadIssues = useGitHubStore((s) => s.loadIssues);
  const selectIssue = useGitHubStore((s) => s.selectIssue);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleFilterChange = useCallback(
    (filter: IssueFilter) => {
      loadIssues(filter);
    },
    [loadIssues],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-1 px-2 py-1 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex gap-0.5 flex-1">
          {(["open", "closed", "all"] as IssueFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className="px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-colors"
              style={{
                backgroundColor: issueFilter === f ? "var(--accent)" : "transparent",
                color: issueFilter === f ? "#000" : "var(--text-muted)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={onCreateIssue}
          className="p-0.5 rounded"
          style={{ color: "var(--text-muted)" }}
          title="New Issue"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => loadIssues()}
          className="p-0.5 rounded"
          style={{ color: "var(--text-muted)" }}
          title="Refresh"
        >
          <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Issue list */}
      <div className="flex-1 overflow-y-auto">
        {issues.map((issue) => (
          <div
            key={issue.number}
            className="px-2 py-1.5 cursor-pointer transition-colors border-b"
            style={{
              backgroundColor:
                issue.number === selectedIssueNumber ? "var(--bg-overlay)" : undefined,
              borderColor: "var(--border)",
            }}
            onClick={() => selectIssue(issue.number === selectedIssueNumber ? null : issue.number)}
          >
            <div className="flex items-center gap-1.5">
              <CircleDot
                size={12}
                style={{
                  color: issue.state === "open" ? "#22c55e" : "#a855f7",
                  flexShrink: 0,
                }}
              />
              <span
                className="text-[11px] font-medium truncate flex-1"
                style={{ color: "var(--text-primary)" }}
              >
                {issue.title}
              </span>
              <span
                className="text-[9px] font-mono shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                #{issue.number}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 ml-[18px]">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {issue.author.login}
              </span>
              {issue.labels.slice(0, 3).map((l) => (
                <span
                  key={l.name}
                  className="text-[8px] px-1 rounded"
                  style={{ backgroundColor: `#${l.color}30`, color: `#${l.color}` }}
                >
                  {l.name}
                </span>
              ))}
              {issue.comments.totalCount > 0 && (
                <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                  {issue.comments.totalCount} comments
                </span>
              )}
              <span className="text-[9px] ml-auto shrink-0" style={{ color: "var(--text-muted)" }}>
                {timeAgo(issue.updatedAt)}
              </span>
            </div>
          </div>
        ))}
        {!isLoading && issues.length === 0 && (
          <div className="px-2 py-6 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
            No issues
          </div>
        )}
      </div>
    </div>
  );
}
