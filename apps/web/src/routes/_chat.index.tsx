import { createFileRoute } from "@tanstack/react-router";
import { EmberSparks } from "../liteeditor/components/effects/EmberSparks";
import { MatrixRain } from "../liteeditor/components/effects/MatrixRain";
import { useSettingsStore } from "../liteeditor/stores/settings-store";

function ChatIndexRouteView() {
  const activeTheme = useSettingsStore((s) => s.activeTheme);
  const isMatrix = activeTheme === "matrix";

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col relative overflow-hidden"
      style={isMatrix ? { backgroundColor: "#000" } : {
        backgroundImage: "url('/hero-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isMatrix ? (
        <MatrixRain />
      ) : (
        <EmberSparks
          particleDensity={40}
          particleSpeed={1}
          particleLifespan={8}
          reduceMotion={false}
        />
      )}

      <div className="flex flex-1 flex-col items-center justify-center text-center relative z-10">
        <img
          src="/liteeditor-large-icon.png"
          alt="LiteEditor"
          className="w-60 h-60 mb-4 drop-shadow-lg"
        />
        <p className="text-sm" style={{ color: isMatrix ? "#33ff33" : "var(--color-stone, #6b6760)" }}>
          No active thread
        </p>
        <p className="text-xs mt-1" style={{ color: isMatrix ? "#33ff33" : "var(--color-stone, #6b6760)", opacity: 0.6 }}>
          Select a thread or create a new one to get started
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_chat/")({
  component: ChatIndexRouteView,
});
