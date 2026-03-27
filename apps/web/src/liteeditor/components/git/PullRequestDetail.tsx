// @ts-nocheck
import { useState } from "react";
import { GitMerge, X, Check, MessageSquare, ArrowRight } from "lucide-react";
import { useGitHubStore } from "../../stores/github-store";
import { useDialogStore } from "../../stores/dialog-store";
import { DiffViewer } from "./DiffViewer";

export function PullRequestDetail() {
  const prDetail = useGitHubStore((s) => s.prDetail);
  const prDiff = useGitHubStore((s) => s.prDiff);
  const prReviews = useGitHubStore((s) => s.prReviews);
  const mergePullRequest = useGitHubStore((s) => s.mergePullRequest);
  const closePullRequest = useGitHubStore((s) => s.closePullRequest);
  const submitReview = useGitHubStore((s) => s.submitReview);
  const pendingReviewComments = useGitHubStore((s) => s.pendingReviewComments);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!prDetail) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-xs">Select a PR to view details</span>
      </div>
    );
  }

  const handleMerge = async (method: "squash" | "rebase" | "merge") => {
    const result = await useDialogStore.getState().showDialog({
      title: "Merge Pull Request",
      message: `Merge PR #${prDetail.number} "${prDetail.title}" via ${method}?`,
      detail: `${prDetail.headRefName} → ${prDetail.baseRefName}`,
      buttons: [
        { label: "Merge", variant: "primary" },
        { label: "Cancel", variant: "muted" },
      ],
      cancelIndex: 1,
    });
    if (result === 0) {
      await mergePullRequest(prDetail.number, method);
    }
  };

  const handleClose = async () => {
    const result = await useDialogStore.getState().showDialog({
      title: "Close Pull Request",
      message: `Close PR #${prDetail.number} without merging?`,
      buttons: [
        { label: "Close PR", variant: "destructive" },
        { label: "Cancel", variant: "muted" },
      ],
      cancelIndex: 1,
    });
    if (result === 0) {
      await closePullRequest(prDetail.number);
    }
  };

  const handleSubmitReview = async (event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT") => {
    const labels: Record<string, string> = {
      APPROVE: "Approve",
      REQUEST_CHANGES: "Request Changes",
      COMMENT: "Comment",
    };
    const result = await useDialogStore.getState().showDialog({
      title: `Submit Review: ${labels[event]}`,
      message: `Submit review on PR #${prDetail.number}?`,
      detail:
        pendingReviewComments.length > 0
          ? `${pendingReviewComments.length} inline comment(s) will be included.`
          : undefined,
      buttons: [
        {
          label: labels[event],
          variant:
            event === "APPROVE" ? "primary" : event === "REQUEST_CHANGES" ? "destructive" : "muted",
        },
        { label: "Cancel", variant: "muted" },
      ],
      cancelIndex: 1,
    });
    if (result === 0) {
      await submitReview(prDetail.number, event, reviewBody);
      setReviewBody("");
      setShowReviewForm(false);
    }
  };

  const stateColor =
    prDetail.state === "MERGED" ? "#a855f7" : prDetail.state === "CLOSED" ? "var(--color-danger, #ef4444)" : "var(--color-ok, #4ade80)";

  return (
    <div className="flex flex-col h-full">
      {/* PR Header */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
            #{prDetail.number} {prDetail.title}
          </span>
          <span
            className="text-[9px] px-1.5 rounded font-medium"
            style={{ backgroundColor: `${stateColor}20`, color: stateColor }}
          >
            {prDetail.state}
          </span>
          {prDetail.isDraft && (
            <span
              className="text-[9px] px-1.5 rounded"
              style={{ backgroundColor: "var(--bg-overlay)", color: "var(--text-muted)" }}
            >
              Draft
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-2 mt-1 text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          <span>{prDetail.author.login}</span>
          <span>{prDetail.headRefName}</span>
          <ArrowRight size={10} />
          <span>{prDetail.baseRefName}</span>
          <span className="ml-auto" style={{ color: "var(--color-ok, #4ade80)" }}>
            +{prDetail.additions}
          </span>
          <span style={{ color: "var(--color-danger, #ef4444)" }}>-{prDetail.deletions}</span>
          <span>{prDetail.changedFiles} files</span>
        </div>

        {/* Actions */}
        {prDetail.state === "OPEN" && (
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => handleMerge("squash")}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{ backgroundColor: "var(--color-ok, #4ade80)", color: "var(--accent-foreground, #0a0a0b)" }}
            >
              <GitMerge size={10} />
              Squash
            </button>
            <button
              onClick={() => handleMerge("rebase")}
              className="px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{ backgroundColor: "var(--bg-overlay)", color: "var(--text-secondary)" }}
            >
              Rebase
            </button>
            <button
              onClick={() => handleMerge("merge")}
              className="px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{ backgroundColor: "var(--bg-overlay)", color: "var(--text-secondary)" }}
            >
              Merge
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{ backgroundColor: "var(--bg-overlay)", color: "var(--text-secondary)" }}
            >
              <MessageSquare size={10} />
              Review
              {pendingReviewComments.length > 0 && (
                <span
                  className="text-[8px] px-1 rounded-full"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground, #0a0a0b)" }}
                >
                  {pendingReviewComments.length}
                </span>
              )}
            </button>
            <button
              onClick={handleClose}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{ color: "var(--color-danger, #ef4444)" }}
            >
              <X size={10} />
              Close
            </button>
          </div>
        )}

        {/* Review submission form */}
        {showReviewForm && (
          <div
            className="mt-2 p-2 rounded"
            style={{ backgroundColor: "var(--bg-muted)", border: "1px solid var(--border)" }}
          >
            <textarea
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="Review summary (optional)"
              rows={2}
              className="w-full px-2 py-1 rounded text-[11px] outline-none resize-none mb-1.5"
              style={{
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => handleSubmitReview("APPROVE")}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium"
                style={{ backgroundColor: "var(--color-ok, #4ade80)", color: "var(--accent-foreground, #0a0a0b)" }}
              >
                <Check size={10} /> Approve
              </button>
              <button
                onClick={() => handleSubmitReview("REQUEST_CHANGES")}
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-danger, #ef4444) 15%, transparent)", color: "var(--color-danger, #ef4444)" }}
              >
                Request Changes
              </button>
              <button
                onClick={() => handleSubmitReview("COMMENT")}
                className="px-2 py-1 rounded text-[10px] font-medium"
                style={{ backgroundColor: "var(--bg-overlay)", color: "var(--text-secondary)" }}
              >
                Comment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File tabs + diff */}
      {prDiff && prDiff.length > 0 && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* File tabs */}
          <div
            className="flex gap-0 overflow-x-auto shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {prDiff.map((file, i) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(i)}
                className="px-2 py-1 text-[10px] shrink-0 transition-colors"
                style={{
                  color: i === selectedFileIndex ? "var(--text-primary)" : "var(--text-muted)",
                  borderBottom:
                    i === selectedFileIndex ? "2px solid var(--accent)" : "2px solid transparent",
                }}
              >
                {file.path.replace(/^.*[\\/]/, "")}
              </button>
            ))}
          </div>
          {/* Diff viewer */}
          <div className="flex-1 min-h-0">
            <DiffViewer diff={prDiff[selectedFileIndex] || null} />
          </div>
        </div>
      )}
    </div>
  );
}
