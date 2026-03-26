// @ts-nocheck
import { useEffect, useRef } from "react";
import { useZenStore } from "../../stores/zen-store";
import { useCanvasStore } from "../../stores/canvas-store";
import { useUiStore } from "../../stores/ui-store";
import { nativeBoundsController } from "../../lib/native-bounds-controller";

interface ClaudePanelProps {
  panelId: string;
  visible?: boolean;
}

const claudeDriver = {
  setBounds: (sessionId: string, bounds: Parameters<typeof window.api.claude.setBounds>[1]) =>
    window.api.claude.setBounds(sessionId, bounds),
  showView: (sessionId: string) => window.api.claude.showView(sessionId),
  hideView: (sessionId: string) => window.api.claude.hideView(sessionId),
};

export function ClaudePanel({ panelId, visible = true }: ClaudePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const nativeOverlayOpen = useUiStore((s) => s.nativeOverlayOpen);
  const effectiveVisible = visible && !nativeOverlayOpen;

  // Register with centralized bounds controller
  useEffect(() => {
    nativeBoundsController.register(
      panelId,
      "claude",
      "",
      containerRef,
      claudeDriver,
      effectiveVisible,
    );
    return () => {
      nativeBoundsController.unregister(panelId);
    };
  }, [panelId]);

  // Sync visibility with controller
  useEffect(() => {
    nativeBoundsController.updateVisibility(panelId, effectiveVisible);
    if (sessionIdRef.current) {
      if (effectiveVisible) {
        window.api.claude.showView(sessionIdRef.current);
      } else {
        window.api.claude.hideView(sessionIdRef.current);
      }
    }
  }, [effectiveVisible, panelId]);

  // Create or reuse session, manage lifecycle
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Check both stores for existing session (pane sync shares panels across modes)
      const zenPanel = useZenStore.getState().panels.find((p) => p.id === panelId);
      const canvasPane = useCanvasStore.getState().panes.get(panelId);
      let sessionId = zenPanel?.claudeSessionId || canvasPane?.claudeSessionId || null;

      if (sessionId) {
        sessionIdRef.current = sessionId;
        nativeBoundsController.updateSessionId(panelId, sessionId);
      } else {
        sessionId = await window.api.claude.createSession();
        if (cancelled) {
          window.api.claude.destroySession(sessionId);
          return;
        }

        sessionIdRef.current = sessionId;
        nativeBoundsController.updateSessionId(panelId, sessionId);

        // Update whichever store owns this panel
        useZenStore.setState((state) => ({
          panels: state.panels.map((p) =>
            p.id === panelId ? { ...p, claudeSessionId: sessionId! } : p,
          ),
        }));
        if (canvasPane || useCanvasStore.getState().panes.has(panelId)) {
          useCanvasStore.getState().updatePane(panelId, { claudeSessionId: sessionId! });
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (sessionIdRef.current) {
        window.api.claude.hideView(sessionIdRef.current);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
