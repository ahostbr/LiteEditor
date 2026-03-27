import { useCallback } from "react";
import { PanelRenderer } from "./PanelRenderer";
import { useZenStore, type ZenPanel } from "../../stores/zen-store";
import { useLayoutStore, type GridLayout as GridLayoutType } from "../../stores/layout-store";

function getGridClass(count: number, gridLayout: GridLayoutType): string {
  if (gridLayout === "2x2") return "grid-cols-2 grid-rows-2";
  if (gridLayout === "3x3") return "grid-cols-3 grid-rows-3";

  // Auto layout
  if (count === 1) return "grid-cols-1 grid-rows-1";
  if (count === 2) return "grid-cols-2 grid-rows-1";
  if (count <= 4) return "grid-cols-2 grid-rows-2";
  if (count <= 6) return "grid-cols-3 grid-rows-2";
  if (count <= 9) return "grid-cols-3 grid-rows-3";
  return "grid-cols-4 grid-rows-3";
}

interface GridLayoutProps {
  panels: ZenPanel[];
}

export function GridLayout({ panels }: GridLayoutProps) {
  const activePanelId = useZenStore((s) => s.activePanelId);
  const setActivePanel = useZenStore((s) => s.setActivePanel);
  const reorderPanels = useZenStore((s) => s.reorderPanels);
  const gridLayout = useLayoutStore((s) => s.gridLayout);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        reorderPanels(fromIndex, toIndex);
      }
    },
    [reorderPanels],
  );

  return (
    <div
      className={`grid gap-[1px] h-full ${getGridClass(panels.length, gridLayout)}`}
      style={{ backgroundColor: "var(--border)" }}
    >
      {panels.map((panel, index) => (
        <div
          key={panel.id}
          className="flex flex-col min-h-0 min-w-0 overflow-hidden"
          style={{ backgroundColor: "var(--bg-base)" }}
        >
          <PanelRenderer
            panel={panel}
            isActive={panel.id === activePanelId}
            visible
            onFocus={() => setActivePanel(panel.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          />
        </div>
      ))}
    </div>
  );
}
