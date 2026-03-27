import { useEffect, useCallback } from "react";
import { useCanvasStore } from "../stores/canvas-store";

export function useCanvasNavigation() {
  const handleCanvasKey = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const store = useCanvasStore.getState();

    // Ctrl+Arrow: jump focus to nearest pane in direction
    if (ctrl && !shift && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const dir = e.key.replace("Arrow", "").toLowerCase() as "left" | "right" | "up" | "down";
      const nearest = store.findNearestPane(dir);
      if (nearest) {
        store.setFocusedPane(nearest);
        // Scroll viewport to center the focused pane
        const pane = store.panes.get(nearest);
        if (pane) {
          scrollToPane(pane.x, pane.y, pane.width, pane.height);
        }
      }
      return;
    }

    // Ctrl+1-9: jump to pane by index
    if (ctrl && !shift && e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      const pane = store.getPaneByIndex(index);
      if (pane) {
        store.setFocusedPane(pane.id);
        scrollToPane(pane.x, pane.y, pane.width, pane.height);
      }
      return;
    }

    // Ctrl+Shift+N: add new pane (emit custom event for AddPaneMenu)
    if (ctrl && shift && e.key === "N") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("canvas:add-pane-menu"));
      return;
    }

    // Ctrl+Shift+Arrow: move focused pane by grid unit
    if (ctrl && shift && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const focused = store.focusedPaneId ? store.panes.get(store.focusedPaneId) : null;
      if (!focused) return;
      const step = 20;
      switch (e.key) {
        case "ArrowLeft":
          store.movePane(focused.id, focused.x - step, focused.y);
          break;
        case "ArrowRight":
          store.movePane(focused.id, focused.x + step, focused.y);
          break;
        case "ArrowUp":
          store.movePane(focused.id, focused.x, focused.y - step);
          break;
        case "ArrowDown":
          store.movePane(focused.id, focused.x, focused.y + step);
          break;
      }
      return;
    }

    // Ctrl+M: toggle minimap
    if (ctrl && !shift && e.key === "m") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("canvas:toggle-minimap"));
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleCanvasKey);
    return () => window.removeEventListener("keydown", handleCanvasKey);
  }, [handleCanvasKey]);
}

function scrollToPane(x: number, y: number, width: number, height: number) {
  // Get viewport size from document
  const viewportEl = document.querySelector("[data-canvas-surface]")?.parentElement;
  if (!viewportEl) return;
  const vw = viewportEl.clientWidth;
  const vh = viewportEl.clientHeight;

  // Center the pane in the viewport
  const targetX = x + width / 2 - vw / 2;
  const targetY = y + height / 2 - vh / 2;
  useCanvasStore.getState().scrollTo(targetX, targetY);
}
