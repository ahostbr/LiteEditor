// @ts-nocheck
import { useCallback } from "react";
import { Plus, Minus, RotateCcw, Check } from "lucide-react";
import { useRepositoryStore } from "../../stores/repository-store";
import type { ChangedFile, FileStatus } from "../../types/repository";

function statusColor(status: FileStatus): string {
  switch (status) {
    case "added":
    case "untracked":
      return "#22c55e";
    case "modified":
      return "#eab308";
    case "deleted":
      return "#ef4444";
    case "renamed":
      return "#60a5fa";
    case "conflicted":
      return "#f97316";
    default:
      return "var(--text-muted)";
  }
}

function statusLabel(status: FileStatus): string {
  switch (status) {
    case "added":
      return "A";
    case "modified":
      return "M";
    case "deleted":
      return "D";
    case "renamed":
      return "R";
    case "copied":
      return "C";
    case "untracked":
      return "U";
    case "conflicted":
      return "!";
    default:
      return "?";
  }
}

export function ChangesPanel() {
  const changedFiles = useRepositoryStore((s) => s.changedFiles);
  const selectedFile = useRepositoryStore((s) => s.selectedFile);
  const selectFile = useRepositoryStore((s) => s.selectFile);
  const stageFile = useRepositoryStore((s) => s.stageFile);
  const unstageFile = useRepositoryStore((s) => s.unstageFile);
  const stageAll = useRepositoryStore((s) => s.stageAll);
  const unstageAll = useRepositoryStore((s) => s.unstageAll);
  const discardFileChanges = useRepositoryStore((s) => s.discardFileChanges);
  const commitSummary = useRepositoryStore((s) => s.commitSummary);
  const commitDescription = useRepositoryStore((s) => s.commitDescription);
  const setCommitSummary = useRepositoryStore((s) => s.setCommitSummary);
  const setCommitDescription = useRepositoryStore((s) => s.setCommitDescription);
  const createCommit = useRepositoryStore((s) => s.createCommit);

  const staged = changedFiles.filter((f) => f.staged);
  const unstaged = changedFiles.filter((f) => !f.staged);

  const handleDiscard = useCallback(
    async (path: string) => {
      const result = await window.api.dialog.showMessageBox({
        type: "warning",
        title: "Discard Changes",
        message: `Discard changes to "${path}"?`,
        buttons: ["Discard", "Cancel"],
        defaultId: 1,
        cancelId: 1,
      });
      if (result === 0) {
        discardFileChanges(path);
      }
    },
    [discardFileChanges],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Staged files */}
      <div className="shrink-0">
        <div
          className="flex items-center justify-between px-2 py-1"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Staged ({staged.length})
          </span>
          {staged.length > 0 && (
            <button
              onClick={() => unstageAll()}
              className="p-0.5 rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
              title="Unstage all"
            >
              <Minus size={12} />
            </button>
          )}
        </div>
        <div className="max-h-[150px] overflow-y-auto">
          {staged.map((file) => (
            <FileRow
              key={file.path}
              file={file}
              isSelected={file.path === selectedFile}
              onClick={() => selectFile(file.path)}
              actionIcon={<Minus size={11} />}
              actionTitle="Unstage"
              onAction={() => unstageFile(file.path)}
            />
          ))}
          {staged.length === 0 && (
            <div className="px-2 py-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
              No staged changes
            </div>
          )}
        </div>
      </div>

      {/* Unstaged files */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div
          className="flex items-center justify-between px-2 py-1 shrink-0"
          style={{ borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Changes ({unstaged.length})
          </span>
          {unstaged.length > 0 && (
            <button
              onClick={() => stageAll()}
              className="p-0.5 rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
              title="Stage all"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {unstaged.map((file) => (
            <FileRow
              key={file.path}
              file={file}
              isSelected={file.path === selectedFile}
              onClick={() => selectFile(file.path)}
              actionIcon={<Plus size={11} />}
              actionTitle="Stage"
              onAction={() => stageFile(file.path)}
              secondaryActionIcon={<RotateCcw size={11} />}
              secondaryActionTitle="Discard"
              onSecondaryAction={() => handleDiscard(file.path)}
            />
          ))}
        </div>
      </div>

      {/* Commit form */}
      <div className="shrink-0 p-2 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
        <input
          type="text"
          value={commitSummary}
          onChange={(e) => setCommitSummary(e.target.value)}
          placeholder="Commit message"
          className="w-full px-2 py-1 rounded text-[11px] outline-none"
          style={{
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && commitSummary.trim() && staged.length > 0) {
              createCommit();
            }
          }}
        />
        <textarea
          value={commitDescription}
          onChange={(e) => setCommitDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-2 py-1 rounded text-[11px] outline-none resize-none"
          style={{
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        <button
          onClick={() => createCommit()}
          disabled={!commitSummary.trim() || staged.length === 0}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-medium transition-colors disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)", color: "#000" }}
        >
          <Check size={12} />
          Commit ({staged.length} file{staged.length !== 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
}

function FileRow({
  file,
  isSelected,
  onClick,
  actionIcon,
  actionTitle,
  onAction,
  secondaryActionIcon,
  secondaryActionTitle,
  onSecondaryAction,
}: {
  file: ChangedFile;
  isSelected: boolean;
  onClick: () => void;
  actionIcon: React.ReactNode;
  actionTitle: string;
  onAction: () => void;
  secondaryActionIcon?: React.ReactNode;
  secondaryActionTitle?: string;
  onSecondaryAction?: () => void;
}) {
  const fileName = file.path.replace(/^.*[\\/]/, "");
  const dirPath = file.path.includes("/") ? file.path.replace(/\/[^/]+$/, "/") : "";

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 cursor-pointer transition-colors group"
      style={{
        backgroundColor: isSelected ? "var(--bg-overlay)" : undefined,
      }}
      onClick={onClick}
    >
      {/* Status badge */}
      <span
        className="text-[9px] font-bold w-[14px] text-center shrink-0"
        style={{ color: statusColor(file.status) }}
      >
        {statusLabel(file.status)}
      </span>

      {/* File name + dir */}
      <span className="flex-1 truncate text-[11px]" style={{ color: "var(--text-primary)" }}>
        {fileName}
        {dirPath && <span style={{ color: "var(--text-muted)" }}> {dirPath}</span>}
      </span>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {secondaryActionIcon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSecondaryAction?.();
            }}
            className="p-0.5 rounded"
            style={{ color: "var(--text-muted)" }}
            title={secondaryActionTitle}
          >
            {secondaryActionIcon}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="p-0.5 rounded"
          style={{ color: "var(--text-muted)" }}
          title={actionTitle}
        >
          {actionIcon}
        </button>
      </div>
    </div>
  );
}
