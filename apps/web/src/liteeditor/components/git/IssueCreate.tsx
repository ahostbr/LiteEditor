// @ts-nocheck
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useGitHubStore } from "../../stores/github-store";

interface IssueCreateProps {
  onClose: () => void;
  onCreated: () => void;
}

export function IssueCreate({ onClose, onCreated }: IssueCreateProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const createIssue = useGitHubStore((s) => s.createIssue);
  const labels = useGitHubStore((s) => s.labels);
  const loadLabels = useGitHubStore((s) => s.loadLabels);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setError("");
    try {
      await createIssue(title.trim(), body);
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
          Create Issue
        </span>
        <button onClick={onClose} className="p-0.5 rounded" style={{ color: "var(--text-muted)" }}>
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title"
          autoFocus
          className="w-full px-2 py-1.5 rounded text-[11px] outline-none"
          style={{
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Description..."
          rows={10}
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
          style={{ backgroundColor: "var(--accent)", color: "#000" }}
        >
          {creating ? "Creating..." : "Create Issue"}
        </button>
      </div>
    </div>
  );
}
