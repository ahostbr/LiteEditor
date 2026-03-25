import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { EmberSparks } from "../liteeditor/components/effects/EmberSparks";

function ChatIndexRouteView() {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col relative overflow-hidden"
      style={{
        backgroundImage: "url('/hero-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <EmberSparks
        particleDensity={40}
        particleSpeed={1}
        particleLifespan={8}
        reduceMotion={false}
      />

      <div className="flex flex-1 flex-col items-center justify-center text-center relative z-10">
        <img
          src="/liteeditor-large-icon.png"
          alt="LiteEditor"
          className="w-20 h-20 mb-4 drop-shadow-lg"
        />
        <p className="text-sm" style={{ color: "var(--color-stone, #6b6760)" }}>
          No active thread
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-stone, #6b6760)", opacity: 0.6 }}>
          Select a thread or create a new one to get started
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_chat/")({
  component: ChatIndexRouteView,
});
