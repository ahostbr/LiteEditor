// @ts-nocheck
import { useEffect, useRef } from "react";
import { useZenStore } from "../../stores/zen-store";
import { useCanvasStore } from "../../stores/canvas-store";
import { useUiStore } from "../../stores/ui-store";
import { nativeBoundsController } from "../../lib/native-bounds-controller";

interface BrowserPanelProps {
  panelId: string;
  initialUrl: string;
  visible?: boolean;
}

const browserDriver = {
  setBounds: (sessionId: string, bounds: Parameters<typeof window.api.browser.setBounds>[1]) =>
    window.api.browser.setBounds(sessionId, bounds),
  showView: (sessionId: string) => window.api.browser.showView(sessionId),
  hideView: (sessionId: string) => window.api.browser.hideView(sessionId),
};

export function BrowserPanel({ panelId, initialUrl, visible = true }: BrowserPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const nativeOverlayOpen = useUiStore((s) => s.nativeOverlayOpen);
  const effectiveVisible = visible && !nativeOverlayOpen;

  // Register with centralized bounds controller
  useEffect(() => {
    nativeBoundsController.register(
      panelId,
      "browser",
      "",
      containerRef,
      browserDriver,
      effectiveVisible,
    );
    return () => {
      nativeBoundsController.unregister(panelId);
    };
  }, [panelId]);

  // Sync visibility with controller
  useEffect(() => {
    nativeBoundsController.updateVisibility(panelId, effectiveVisible);
    // Also directly show/hide when visibility changes (for immediate response)
    if (sessionIdRef.current) {
      if (effectiveVisible) {
        window.api.browser.showView(sessionIdRef.current);
      } else {
        window.api.browser.hideView(sessionIdRef.current);
      }
    }
  }, [effectiveVisible, panelId]);

  // Create or reuse view, wire up state updates
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Check both zen store and canvas store for existing session
      const zenPanel = useZenStore.getState().panels.find((p) => p.id === panelId);
      const canvasPane = useCanvasStore.getState().panes.get(panelId);
      let sessionId = zenPanel?.browserSessionId || canvasPane?.browserSessionId || null;

      if (sessionId) {
        sessionIdRef.current = sessionId;
        nativeBoundsController.updateSessionId(panelId, sessionId);
      } else {
        sessionId = await window.api.browser.createView(initialUrl);
        if (cancelled) {
          window.api.browser.destroyView(sessionId);
          return;
        }

        sessionIdRef.current = sessionId;
        nativeBoundsController.updateSessionId(panelId, sessionId);

        // Persist sessionId to whichever store owns this panel
        useZenStore.setState((state) => ({
          panels: state.panels.map((p) =>
            p.id === panelId ? { ...p, browserSessionId: sessionId! } : p,
          ),
        }));
        if (canvasPane || useCanvasStore.getState().panes.has(panelId)) {
          useCanvasStore.getState().updatePane(panelId, { browserSessionId: sessionId! });
        }
      }
    };

    init();

    // State updates from main process
    const unsub = window.api.browser.onStateUpdate((_event, data) => {
      if (data.sessionId !== sessionIdRef.current) return;
      if (data.title) {
        useZenStore.setState((state) => ({
          panels: state.panels.map((p) => (p.id === panelId ? { ...p, title: data.title! } : p)),
        }));
      }
    });

    return () => {
      cancelled = true;
      unsub();
      if (sessionIdRef.current) {
        window.api.browser.hideView(sessionIdRef.current);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
