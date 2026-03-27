import { createFileRoute } from "@tanstack/react-router";
import LiteEditorApp from "../liteeditor/App";
import "../liteeditor/app.css";

function ChatIndexRouteView() {
  // Render the full LiteEditor canvas as the home screen.
  // Previously this showed a splash logo with "No active thread" —
  // now the canvas is always available, with TemplatePicker shown when empty.
  return <LiteEditorApp />;
}

export const Route = createFileRoute("/_chat/")({
  component: ChatIndexRouteView,
});
