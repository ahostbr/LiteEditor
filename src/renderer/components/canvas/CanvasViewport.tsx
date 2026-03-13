import { useCallback, useRef, useEffect } from 'react'
import { useCanvasStore } from '../../stores/canvas-store'

interface SpringState {
  velocityX: number
  velocityY: number
  animating: boolean
}

const SCROLL_SPEED = 1.5
const FRICTION = 0.92
const MIN_VELOCITY = 0.5

export function useCanvasViewport() {
  const springRef = useRef<SpringState>({ velocityX: 0, velocityY: 0, animating: false })
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    const spring = springRef.current
    if (!spring.animating) return

    const store = useCanvasStore.getState()
    store.scrollBy(spring.velocityX, spring.velocityY)

    spring.velocityX *= FRICTION
    spring.velocityY *= FRICTION

    if (Math.abs(spring.velocityX) < MIN_VELOCITY && Math.abs(spring.velocityY) < MIN_VELOCITY) {
      spring.animating = false
      spring.velocityX = 0
      spring.velocityY = 0
      return
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const spring = springRef.current

    // Direct scroll (trackpad or shift+scroll)
    const dx = e.deltaX * SCROLL_SPEED
    const dy = e.deltaY * SCROLL_SPEED

    useCanvasStore.getState().scrollBy(dx, dy)

    // Start momentum if not already animating
    spring.velocityX = dx * 0.3
    spring.velocityY = dy * 0.3

    if (!spring.animating) {
      spring.animating = true
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [animate])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { handleWheel }
}
