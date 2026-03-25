// @ts-nocheck
import { Save, X } from "lucide-react";
import { FileIcon } from "../shared/FileIcon";
import { useZenStore } from "../../stores/zen-store";
import { cn } from "../../lib/cn";

interface EditorPanelHeaderProps {
  panelId: string;
  filePath: string;
  title: string;
  isDirty: boolean;
  isActive: boolean;
  onFocus: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function EditorPanelHeader({
  panelId,
  filePath,
  title,
  isDirty,
  isActive,
  onFocus,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: EditorPanelHeaderProps) {
  const removePanel = useZenStore((s) => s.removePanel);
  const markPanelDirty = useZenStore((s) => s.markPanelDirty);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const monaco = (window as any).__monaco;
    if (!monaco) return;
    const uri = monaco.Uri.file(filePath);
    const model = monaco.editor.getModel(uri);
    if (!model) return;
    try {
      await window.api.fs.writeFile(filePath, model.getValue());
      markPanelDirty(panelId, false);
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 h-[36px] shrink-0 cursor-default overflow-hidden",
        isActive ? "border-t-2" : "border-t-2 border-transparent",
      )}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTopColor: isActive ? "var(--accent)" : "transparent",
        borderBottom: "1px solid var(--border)",
      }}
      onClick={onFocus}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col min-w-0 flex-1 justify-center">
        <div className="flex items-center gap-2">
          <FileIcon name={title} />
          <span
            className="text-sm truncate"
            style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            {title}
          </span>
          {isDirty && (
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "var(--accent)" }}
              title="Unsaved changes"
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isDirty && (
          <button
            onClick={handleSave}
            className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
            title="Save"
          >
            <Save size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removePanel(panelId);
          }}
          className="p-1 rounded hover:bg-[var(--bg-muted)] opacity-50 hover:opacity-100 transition-opacity"
          title="Close Panel"
        >
          <X size={14} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
    </div>
  );
}
