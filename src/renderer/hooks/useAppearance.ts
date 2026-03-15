import { useEffect } from 'react'
import {
  applyAccentToDOM,
  applyGlassBlurToDOM,
  applyParticleColorToDOM,
  applyGlowColorToDOM,
  applyParticleSpeedToDOM,
} from '../lib/accent'

export interface AppearanceValues {
  accentColor: string
  glassBlur: number
  reduceMotion: boolean
  particleColor: string
  glowColor: string
  particleSpeed: number
}

/**
 * Store-agnostic appearance hook.
 * Pass in the current appearance values from whatever store your app uses.
 * This hook applies them to the DOM as CSS variables.
 */
export function useAppearance(values: AppearanceValues) {
  const { accentColor, glassBlur, reduceMotion, particleColor, glowColor, particleSpeed } = values

  useEffect(() => { applyAccentToDOM(accentColor) }, [accentColor])
  useEffect(() => { applyGlassBlurToDOM(glassBlur) }, [glassBlur])
  useEffect(() => { applyParticleColorToDOM(particleColor) }, [particleColor])
  useEffect(() => { applyGlowColorToDOM(glowColor) }, [glowColor])
  useEffect(() => { applyParticleSpeedToDOM(particleSpeed) }, [particleSpeed])

  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', '')
    } else {
      document.documentElement.removeAttribute('data-reduce-motion')
    }
  }, [reduceMotion])
}
