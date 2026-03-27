// @ts-nocheck
import React from "react";
import { ACCENT_PRESETS, applyThemeToDOM } from "../../lib/accent";
import { THEMES, type ThemePreset } from "../../lib/themes";
import { useSettingsStore } from "../../stores/settings-store";
import { Check } from "lucide-react";

function normalizeHex(color: string) {
  if (!color) return "";
  return color.startsWith("#") ? color.toUpperCase() : `#${color.toUpperCase()}`;
}

export interface AppearanceProps {
  accentColor: string;
  setAccentColor: (color: string) => void;
  particleDensity: number;
  setParticleDensity: (v: number) => void;
  particleSpeed: number;
  setParticleSpeed: (v: number) => void;
  particleLifespan: number;
  setParticleLifespan: (v: number) => void;
  glassBlur: number;
  setGlassBlur: (v: number) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
}

export function AppearanceSection({
  accentColor,
  setAccentColor,
  particleDensity,
  setParticleDensity,
  particleSpeed,
  setParticleSpeed,
  particleLifespan,
  setParticleLifespan,
  glassBlur,
  setGlassBlur,
  reduceMotion,
  setReduceMotion,
}: AppearanceProps) {
  const activeTheme = useSettingsStore((s) => s.activeTheme);
  const setActiveTheme = useSettingsStore((s) => s.setActiveTheme);

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-display italic text-xl" style={{ color: "var(--text-primary, #e8e4dc)" }}>Appearance</h3>

      {/* Theme selector */}
      <section className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #7a756d)" }}>
          Theme
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-muted, #7a756d)" }}>
          Choose your preferred color scheme
        </span>
        <div className="grid grid-cols-4 gap-2 mt-1">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setActiveTheme(theme.id);
                setAccentColor(theme.accent);
                applyThemeToDOM(theme);
              }}
              className="relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all duration-200"
              style={{
                borderColor: activeTheme === theme.id ? theme.accent : "var(--color-divider, rgba(255,255,255,0.07))",
                backgroundColor: theme.panel,
                boxShadow: activeTheme === theme.id ? `0 0 8px ${theme.accent}40` : "none",
              }}
            >
              {/* Checkmark for selected theme */}
              {activeTheme === theme.id && (
                <div
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Check size={10} style={{ color: theme.void }} strokeWidth={3} />
                </div>
              )}
              {/* Color swatches — 3 vertical bars */}
              <div className="flex items-end gap-1 h-8">
                <div
                  className="w-2 rounded-sm"
                  style={{ height: 28, backgroundColor: theme.accent }}
                />
                <div
                  className="w-2 rounded-sm"
                  style={{ height: 20, backgroundColor: theme.bone }}
                />
                <div
                  className="w-2 rounded-sm"
                  style={{ height: 14, backgroundColor: theme.ash }}
                />
              </div>
              {/* Theme name */}
              <span
                className="text-[10px] font-medium"
                style={{ color: theme.bone }}
              >
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Custom accent color picker */}
      <section className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #7a756d)" }}>
          Custom Accent
        </span>
        <div className="flex items-center gap-3 mt-2">
          <label className="group relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-divider/50 bg-shelf">
            <span
              className="h-6 w-6 rounded-full border border-white/15"
              style={{ backgroundColor: accentColor }}
            />
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(normalizeHex(e.target.value))}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom accent color"
            />
          </label>
          <span className="text-xs" style={{ color: "var(--text-primary, #e8e4dc)" }}>{normalizeHex(accentColor)}</span>
        </div>
      </section>

      {/* Effects */}
      <div className="border-t border-divider/30 pt-4">
        <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #7a756d)" }}>
          Effects
        </span>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #7a756d)" }}>
            Particle Density
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted, #7a756d)" }}>{particleDensity}</span>
        </div>
        <input
          type="range"
          min={0}
          max={300}
          step={10}
          value={particleDensity}
          onChange={(e) => setParticleDensity(parseInt(e.target.value))}
          className="w-full h-1"
          style={{ accentColor: "var(--accent, #c9a24d)" }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #7a756d)" }}>
            Particle Speed
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted, #7a756d)" }}>{particleSpeed.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={3}
          step={0.1}
          value={particleSpeed}
          onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
          className="w-full h-1"
          style={{ accentColor: "var(--accent, #c9a24d)" }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #7a756d)" }}>
            Particle Lifespan
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted, #7a756d)" }}>
            {particleLifespan.toFixed(1)}s
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.1}
          value={particleLifespan}
          onChange={(e) => setParticleLifespan(parseFloat(e.target.value))}
          className="w-full h-1"
          style={{ accentColor: "var(--accent, #c9a24d)" }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted, #7a756d)" }}>
            Glass Blur
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted, #7a756d)" }}>{glassBlur}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={40}
          step={2}
          value={glassBlur}
          onChange={(e) => setGlassBlur(parseInt(e.target.value))}
          className="w-full h-1"
          style={{ accentColor: "var(--accent, #c9a24d)" }}
        />
      </section>

      <section>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
            style={{ accentColor: "var(--accent, #c9a24d)" }}
          />
          <span className="text-xs" style={{ color: "var(--text-primary, #e8e4dc)" }}>Reduce motion</span>
        </label>
        <p className="text-[10px] mt-1 pl-5" style={{ color: "var(--text-muted, #7a756d)" }}>Disables particle effects and animations</p>
      </section>
    </div>
  );
}
