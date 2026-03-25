// @ts-nocheck
import { SearchPanel } from "../sidebar/SearchPanel";

export function SearchPane() {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      <SearchPanel />
    </div>
  );
}
