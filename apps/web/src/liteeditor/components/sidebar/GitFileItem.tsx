import React, { useState } from "react";
import { useRepositoryStore } from "../../stores/repository-store";
import type { ChangedFile } from "../../types/repository";
import { useEditorStore } from "../../stores/editor-store";
import { logWarn, logError } from "../../stores/error-store";
import { StatusBadge } from "../shared/StatusBadge";
import { ContextMenu, type ContextMenuItem } from "../shared/ContextMenu";

export function GitFileItem({ file }: { file: ChangedFile }) {
  const stageFile = useRepositoryStore((s) => s.stageFile);
  const unstageFile = useRepositoryStore((s) => s.unstageFile);
  const discardFileChanges = useRepositoryStore((s) => s.discardFileChanges);
  const openDiff = useEditorStore((s) => s.openDiff);
  const projectRoot = useEditorStore((s) => s.projectRoot);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const fileName = file.path.split(/[\/]/).pop() || file.path;
  const toggleStaged = () => (file.staged ? unstageFile(file.path) : stageFile(file.path));

  const handleClick = async () => {
    if (!projectRoot) return;
    try {
      const fullPath = `${projectRoot}/${file.path}`;
      let original = "";
      try {
        original = await window.api.git.getFileAtRevision(file.path, "HEAD");
      } catch (err) {
        logWarn("GitFileItem", `No HEAD revision for ${file.path} (likely new file)`, err);
      }
      const modified = await window.api.fs.readFile(fullPath);
      openDiff(file.path, original, modified);
    } catch (err) {
      logError("GitFileItem", `Failed to open diff for ${file.path}`, err);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const contextItems: ContextMenuItem[] = [
    { label: file.staged ? "Unstage" : "Stage", onClick: toggleStaged },
    { label: "Discard Changes", onClick: () => discardFileChanges(file.path) },
    { separator: true, label: "", onClick: () => {} },
    { label: "Open File", onClick: handleClick },
  ];

  return (
    <>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="flex items-center gap-2 px-3 py-0.5 cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStaged();
          }}
          className="shrink-0"
          title={file.staged ? "Unstage File" : "Stage File"}
        >
          <StatusBadge status={file.status} />
        </button>
        <span className="text-sm truncate flex-1" style={{ color: "var(--text-primary)" }}>
          {fileName}
        </span>
        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {file.path}
        </span>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
