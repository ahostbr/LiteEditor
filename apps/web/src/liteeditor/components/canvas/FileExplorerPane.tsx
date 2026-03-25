// @ts-nocheck
import { FileExplorer } from "../sidebar/FileExplorer";

export function FileExplorerPane() {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      <FileExplorer />
    </div>
  );
}
