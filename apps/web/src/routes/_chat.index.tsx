import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import LiteEditorApp from "../liteeditor/App";
import "../liteeditor/app.css";
import { useCanvasStore } from "../liteeditor/stores/canvas-store";
import { setLiteEditorHostConfig } from "../liteeditor/hostMode";

function ChatIndexRouteView() {
  // When navigating to the home route (no thread selected), clear any
  // thread-specific canvas state so panes from a previous thread don't bleed through.
  useEffect(() => {
    setLiteEditorHostConfig(null);
    useCanvasStore.getState().clearPanes();
  }, []);

  return <LiteEditorApp />;
}

export const Route = createFileRoute("/_chat/")({
  component: ChatIndexRouteView,
});
