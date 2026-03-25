// @ts-nocheck
import { useEffect, useState } from "react";
import { GitBranch, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useRepositoryStore } from "../../stores/repository-store";
import { useGitHubStore } from "../../stores/github-store";
import { useEditorStore } from "../../stores/editor-store";
import { ChangesPanel } from "./ChangesPanel";
import { HistoryPanel } from "./HistoryPanel";
import { DiffViewer } from "./DiffViewer";
import { PullRequestsPanel } from "./PullRequestsPanel";
import { PullRequestDetail } from "./PullRequestDetail";
import { PullRequestCreate } from "./PullRequestCreate";
import { IssuesPanel } from "./IssuesPanel";
import { IssueDetail } from "./IssueDetail";
import { IssueCreate } from "./IssueCreate";
import { GhCliSetup } from "./GhCliSetup";
import type { RepositoryTab } from "../../types/repository";

interface RepositoryViewProps {
  repoPath?: string;
}

export function RepositoryView({ repoPath }: RepositoryViewProps) {
  const projectRoot = useEditorStore((s) => s.projectRoot);
  const effectivePath = repoPath || projectRoot;
  const activeTab = useRepositoryStore((s) => s.activeTab);
  const setActiveTab = useRepositoryStore((s) => s.setActiveTab);
  const currentBranch = useRepositoryStore((s) => s.currentBranch);
  const ahead = useRepositoryStore((s) => s.ahead);
  const behind = useRepositoryStore((s) => s.behind);
  const selectedDiff = useRepositoryStore((s) => s.selectedDiff);
  const fetchOrigin = useRepositoryStore((s) => s.fetchOrigin);
  const pushOrigin = useRepositoryStore((s) => s.pushOrigin);
  const pullOrigin = useRepositoryStore((s) => s.pullOrigin);
  const initialize = useRepositoryStore((s) => s.initialize);
  const shutdown = useRepositoryStore((s) => s.shutdown);
  const isLoading = useRepositoryStore((s) => s.isLoading);

  const ghCliReady = useGitHubStore((s) => s.ghCliReady);
  const initForRepo = useGitHubStore((s) => s.initForRepo);

  const [showCreatePr, setShowCreatePr] = useState(false);
  const [showCreateIssue, setShowCreateIssue] = useState(false);

  useEffect(() => {
    if (effectivePath) {
      initialize(effectivePath);
      initForRepo(effectivePath);
    }
    return () => shutdown();
  }, [effectivePath, initialize, shutdown, initForRepo]);

  if (!effectivePath) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-sm">No project opened</span>
      </div>
    );
  }

  const tabs: { id: RepositoryTab; label: string }[] = [
    { id: "changes", label: "Changes" },
    { id: "history", label: "History" },
    { id: "prs", label: "PRs" },
    { id: "issues", label: "Issues" },
  ];

  const isGitHubTab = activeTab === "prs" || activeTab === "issues";

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg-surface)" }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <GitBranch size={13} style={{ color: "var(--text-muted)" }} />
        <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>
          {currentBranch || "Loading..."}
        </span>

        {ahead > 0 && (
          <button
            onClick={() => pushOrigin()}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}
            title={`Push ${ahead} commit${ahead > 1 ? "s" : ""}`}
          >
            <ArrowUp size={10} />
            {ahead}
          </button>
        )}
        {behind > 0 && (
          <button
            onClick={() => pullOrigin()}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors"
            style={{ backgroundColor: "rgba(96, 165, 250, 0.15)", color: "#60a5fa" }}
            title={`Pull ${behind} commit${behind > 1 ? "s" : ""}`}
          >
            <ArrowDown size={10} />
            {behind}
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={() => fetchOrigin()}
          className="p-1 rounded transition-colors"
          style={{ color: "var(--text-muted)" }}
          title="Fetch"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex px-3 gap-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="pb-1.5 pt-1 text-[11px] font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom:
                activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* gh CLI check for GitHub tabs */}
      {isGitHubTab && !ghCliReady ? (
        <GhCliSetup />
      ) : (
        /* Content: sidebar + detail */
        <div className="flex flex-1 min-h-0">
          {/* Left sidebar */}
          <div
            className="w-[260px] shrink-0 flex flex-col"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            {activeTab === "changes" && <ChangesPanel />}
            {activeTab === "history" && <HistoryPanel />}
            {activeTab === "prs" && <PullRequestsPanel onCreatePr={() => setShowCreatePr(true)} />}
            {activeTab === "issues" && (
              <IssuesPanel onCreateIssue={() => setShowCreateIssue(true)} />
            )}
          </div>

          {/* Right: detail view */}
          <div className="flex-1 min-w-0">
            {activeTab === "changes" && <DiffViewer diff={selectedDiff} />}
            {activeTab === "history" && (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="text-xs">Select a commit to view details</span>
              </div>
            )}
            {activeTab === "prs" &&
              (showCreatePr ? (
                <PullRequestCreate
                  onClose={() => setShowCreatePr(false)}
                  onCreated={() => setShowCreatePr(false)}
                />
              ) : (
                <PullRequestDetail />
              ))}
            {activeTab === "issues" &&
              (showCreateIssue ? (
                <IssueCreate
                  onClose={() => setShowCreateIssue(false)}
                  onCreated={() => setShowCreateIssue(false)}
                />
              ) : (
                <IssueDetail />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
