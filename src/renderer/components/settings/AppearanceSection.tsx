import React from 'react'
import { ACCENT_PRESETS } from '../../lib/accent'

function normalizeHex(color: string) {
  if (!color) return ''
  return color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`
}

export interface AppearanceProps {
  accentColor: string
  setAccentColor: (color: string) => void
  particleDensity: number
  setParticleDensity: (v: number) => void
  particleSpeed: number
  setParticleSpeed: (v: number) => void
  particleLifespan: number
  setParticleLifespan: (v: number) => void
  glassBlur: number
  setGlassBlur: (v: number) => void
  reduceMotion: boolean
  setReduceMotion: (v: boolean) => void
}

export function AppearanceSection({
  accentColor, setAccentColor,
  particleDensity, setParticleDensity,
  particleSpeed, setParticleSpeed,
  particleLifespan, setParticleLifespan,
  glassBlur, setGlassBlur,
  reduceMotion, setReduceMotion,
}: AppearanceProps) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h3 className="font-display italic text-xl text-bone">Appearance</h3>

      {/* Accent color picker */}
      <section className="flex flex-col gap-2">
        <span className="text-[10px] text-stone uppercase tracking-widest font-medium">Accent Color</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ACCENT_PRESETS).map(([name, hex]) => (
            <button
              key={name}
              onClick={() => setAccentColor(hex)}
              className="group relative flex flex-col items-center gap-1"
              title={name}
            >
              <span
                className="h-8 w-8 rounded-full border-2 transition-all duration-200"
                style={{
                  backgroundColor: hex,
                  borderColor: accentColor === hex ? '#e8e4dc' : 'transparent',
                  boxShadow: accentColor === hex ? `0 0 12px ${hex}60` : 'none',
                }}
              />
              <span className="text-[9px] text-stone">{name}</span>
            </button>
          ))}
        </div>
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
          <span className="text-xs text-bone">{normalizeHex(accentColor)}</span>
        </div>
      </section>

      {/* Effects */}
      <div className="border-t border-divider/30 pt-4">
        <span className="text-[10px] text-stone uppercase tracking-widest font-medium">Effects</span>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-stone uppercase tracking-widest font-medium">Particle Density</span>
          <span className="text-[10px] text-stone tabular-nums">{particleDensity}</span>
        </div>
        <input
          type="range" min={0} max={300} step={10}
          value={particleDensity}
          onChange={(e) => setParticleDensity(parseInt(e.target.value))}
          className="w-full h-1 accent-ember"
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-stone uppercase tracking-widest font-medium">Particle Speed</span>
          <span className="text-[10px] text-stone tabular-nums">{particleSpeed.toFixed(1)}x</span>
        </div>
        <input
          type="range" min={0.2} max={3} step={0.1}
          value={particleSpeed}
          onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
          className="w-full h-1 accent-ember"
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-stone uppercase tracking-widest font-medium">Particle Lifespan</span>
          <span className="text-[10px] text-stone tabular-nums">{particleLifespan.toFixed(1)}s</span>
        </div>
        <input
          type="range" min={0.5} max={5} step={0.1}
          value={particleLifespan}
          onChange={(e) => setParticleLifespan(parseFloat(e.target.value))}
          className="w-full h-1 accent-ember"
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-stone uppercase tracking-widest font-medium">Glass Blur</span>
          <span className="text-[10px] text-stone tabular-nums">{glassBlur}px</span>
        </div>
        <input
          type="range" min={0} max={40} step={2}
          value={glassBlur}
          onChange={(e) => setGlassBlur(parseInt(e.target.value))}
          className="w-full h-1 accent-ember"
        />
      </section>

      <section>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
            className="accent-ember"
          />
          <span className="text-xs text-bone">Reduce motion</span>
        </label>
        <p className="text-[10px] text-stone mt-1 pl-5">Disables particle effects and animations</p>
      </section>
    </div>
  )
}
