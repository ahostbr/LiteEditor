// @ts-nocheck
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useGitHubStore } from "../../stores/github-store";
import { useRepositoryStore } from "../../stores/repository-store";

interface PullRequestCreateProps {
  onClose: () => void;
  onCreated: () => void;
}

export function PullRequestCreate({ onClose, onCreated }: PullRequestCreateProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [base, setBase] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const currentBranch = useRepositoryStore((s) => s.currentBranch);
  const createPullRequest = useGitHubStore((s) => s.createPullRequest);
  const loadPrTemplate = useGitHubStore((s) => s.loadPrTemplate);
  const labels = useGitHubStore((s) => s.labels);
  const loadLabels = useGitHubStore((s) => s.loadLabels);

  useEffect(() => {
    // Load PR template
    loadPrTemplate().then((tmpl) => {
      if (tmpl) setBody(tmpl);
    });
    // Load labels
    loadLabels();
    // Default base to main/master
    setBase("main");
  }, [loadPrTemplate, loadLabels]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setError("");
    try {
      await createPullRequest(title.trim(), body, base, currentBranch);
      onCreated();
    } catch (e) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
          Create Pull Request
        </span>
        <button onClick={onClose} className="p-0.5 rounded" style={{ color: "var(--text-muted)" }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {/* Branch info */}
        <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
            {currentBranch}
          </span>
          <span>→</span>
          <input
            type="text"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="px-1.5 py-0.5 rounded text-[10px] w-[100px] outline-none"
            style={{
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            placeholder="base branch"
          />
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="PR Title"
          autoFocus
          className="w-full px-2 py-1.5 rounded text-[11px] outline-none"
          style={{
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />

        {/* Body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Description..."
          rows={12}
          className="w-full px-2 py-1.5 rounded text-[11px] outline-none resize-none"
          style={{
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />

        {error && (
          <div
            className="text-[10px] px-2 py-1 rounded"
            style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}
          >
            {error}
          </div>
        )}
      </div>

      <div
        className="flex justify-end gap-2 px-3 py-2 shrink-0"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded text-[11px] font-medium"
          style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-overlay)" }}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!title.trim() || creating}
          className="px-3 py-1.5 rounded text-[11px] font-medium disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground, #0a0a0b)" }}
        >
          {creating ? "Creating..." : "Create PR"}
        </button>
      </div>
    </div>
  );
}
