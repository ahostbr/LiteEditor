// @ts-nocheck
import { useEffect, useRef } from "react";
import { useZenStore } from "../../stores/zen-store";
import { useUiStore } from "../../stores/ui-store";
import { nativeBoundsController } from "../../lib/native-bounds-controller";

interface CodexPanelProps {
  panelId: string;
  visible?: boolean;
}

const codexDriver = {
  setBounds: (sessionId: string, bounds: Parameters<typeof window.api.codex.setBounds>[1]) =>
    window.api.codex.setBounds(sessionId, bounds),
  showView: (sessionId: string) => window.api.codex.showView(sessionId),
  hideView: (sessionId: string) => window.api.codex.hideView(sessionId),
};

export function CodexPanel({ panelId, visible = true }: CodexPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const nativeOverlayOpen = useUiStore((s) => s.nativeOverlayOpen);
  const effectiveVisible = visible && !nativeOverlayOpen;

  // Register with centralized bounds controller
  useEffect(() => {
    nativeBoundsController.register(
      panelId,
      "codex",
      "",
      containerRef,
      codexDriver,
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
        window.api.codex.showView(sessionIdRef.current);
      } else {
        window.api.codex.hideView(sessionIdRef.current);
      }
    }
  }, [effectiveVisible, panelId]);

  // Create or reuse session, manage lifecycle
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const zenPanel = useZenStore.getState().panels.find((p) => p.id === panelId);
      let sessionId = zenPanel?.codexSessionId || null;

      if (sessionId) {
        sessionIdRef.current = sessionId;
        nativeBoundsController.updateSessionId(panelId, sessionId);
      } else {
        sessionId = await window.api.codex.createSession();
        if (cancelled) {
          window.api.codex.destroySession(sessionId);
          return;
        }

        sessionIdRef.current = sessionId;
        nativeBoundsController.updateSessionId(panelId, sessionId);

        useZenStore.setState((state) => ({
          panels: state.panels.map((p) =>
            p.id === panelId ? { ...p, codexSessionId: sessionId! } : p,
          ),
        }));
      }
    };

    init();

    return () => {
      cancelled = true;
      if (sessionIdRef.current) {
        window.api.codex.hideView(sessionIdRef.current);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
