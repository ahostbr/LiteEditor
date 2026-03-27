// @ts-nocheck
import { useEffect, useCallback } from "react";
import { GitPullRequest, RefreshCw, Plus, Check, X, MessageSquare, Clock } from "lucide-react";
import { useGitHubStore } from "../../stores/github-store";
import type { PullRequest, PrFilter } from "../../types/github";

function reviewBadge(decision: PullRequest["reviewDecision"]) {
  switch (decision) {
    case "APPROVED":
      return (
        <span
          className="text-[8px] px-1 rounded font-medium"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-ok, #4ade80) 15%, transparent)", color: "var(--color-ok, #4ade80)" }}
        >
          Approved
        </span>
      );
    case "CHANGES_REQUESTED":
      return (
        <span
          className="text-[8px] px-1 rounded font-medium"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-danger, #ef4444) 15%, transparent)", color: "var(--color-danger, #ef4444)" }}
        >
          Changes
        </span>
      );
    case "REVIEW_REQUIRED":
      return (
        <span
          className="text-[8px] px-1 rounded font-medium"
          style={{ backgroundColor: "color-mix(in srgb, var(--accent-color, #c9a24d) 15%, transparent)", color: "var(--accent-color, #c9a24d)" }}
        >
          Review
        </span>
      );
    default:
      return null;
  }
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface PullRequestsPanelProps {
  onCreatePr: () => void;
}

export function PullRequestsPanel({ onCreatePr }: PullRequestsPanelProps) {
  const pullRequests = useGitHubStore((s) => s.pullRequests);
  const selectedPrNumber = useGitHubStore((s) => s.selectedPrNumber);
  const prFilter = useGitHubStore((s) => s.prFilter);
  const isLoading = useGitHubStore((s) => s.isLoading);
  const loadPullRequests = useGitHubStore((s) => s.loadPullRequests);
  const selectPullRequest = useGitHubStore((s) => s.selectPullRequest);

  useEffect(() => {
    loadPullRequests();
  }, [loadPullRequests]);

  const handleFilterChange = useCallback(
    (filter: PrFilter) => {
      loadPullRequests(filter);
    },
    [loadPullRequests],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters */}
      <div
        className="flex items-center gap-1 px-2 py-1 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex gap-0.5 flex-1">
          {(["open", "closed", "all"] as PrFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className="px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-colors"
              style={{
                backgroundColor: prFilter === f ? "var(--accent)" : "transparent",
                color: prFilter === f ? "var(--accent-foreground, #0a0a0b)" : "var(--text-muted)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={onCreatePr}
          className="p-0.5 rounded transition-colors"
          style={{ color: "var(--text-muted)" }}
          title="Create PR"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => loadPullRequests()}
          className="p-0.5 rounded transition-colors"
          style={{ color: "var(--text-muted)" }}
          title="Refresh"
        >
          <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* PR list */}
      <div className="flex-1 overflow-y-auto">
        {pullRequests.map((pr) => (
          <div
            key={pr.number}
            className="px-2 py-1.5 cursor-pointer transition-colors border-b"
            style={{
              backgroundColor: pr.number === selectedPrNumber ? "var(--bg-overlay)" : undefined,
              borderColor: "var(--border)",
            }}
            onClick={() => selectPullRequest(pr.number === selectedPrNumber ? null : pr.number)}
          >
            <div className="flex items-center gap-1.5">
              <GitPullRequest
                size={12}
                style={{
                  color:
                    pr.state === "MERGED"
                      ? "#a855f7"
                      : pr.state === "CLOSED"
                        ? "var(--color-danger, #ef4444)"
                        : "var(--color-ok, #4ade80)",
                  flexShrink: 0,
                }}
              />
              <span
                className="text-[11px] font-medium truncate flex-1"
                style={{ color: "var(--text-primary)" }}
              >
                {pr.title}
              </span>
              <span
                className="text-[9px] font-mono shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                #{pr.number}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 ml-[18px]">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {pr.author.login}
              </span>
              {reviewBadge(pr.reviewDecision)}
              {pr.isDraft && (
                <span
                  className="text-[8px] px-1 rounded"
                  style={{ backgroundColor: "var(--bg-overlay)", color: "var(--text-muted)" }}
                >
                  Draft
                </span>
              )}
              {pr.labels.slice(0, 2).map((l) => (
                <span
                  key={l.name}
                  className="text-[8px] px-1 rounded"
                  style={{ backgroundColor: `#${l.color}30`, color: `#${l.color}` }}
                >
                  {l.name}
                </span>
              ))}
              <span className="text-[9px] ml-auto shrink-0" style={{ color: "var(--text-muted)" }}>
                {timeAgo(pr.updatedAt)}
              </span>
            </div>
          </div>
        ))}
        {!isLoading && pullRequests.length === 0 && (
          <div className="px-2 py-6 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
            No pull requests
          </div>
        )}
      </div>
    </div>
  );
}
