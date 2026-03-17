import { useCallback, useRef, useEffect, useState } from 'react'
import { useCanvasStore } from '../../stores/canvas-store'

interface SpringState {
  velocityX: number
  velocityY: number
  animating: boolean
}

const SCROLL_SPEED = 1.5
const FRICTION = 0.92
const MIN_VELOCITY = 0.5
const ZOOM_SPEED = 0.002
const MIN_ZOOM = 0.25
const MAX_ZOOM = 3

// Spring physics for column-focus scroll (Niri-inspired)
const SPRING_STIFFNESS = 0.08
const SPRING_DAMPING = 0.85
const SPRING_MIN_VELOCITY = 0.3

// e.buttons bitmask: 1=left, 2=right, 4=middle
const BOTH_LR = 3   // left(1) + right(2)
const MIDDLE = 4

export function useCanvasViewport() {
  const springRef = useRef<SpringState>({ velocityX: 0, velocityY: 0, animating: false })
  const rafRef = useRef<number>(0)

  const [grabbing, setGrabbing] = useState(false)
  const grabRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startViewportX: 0,
    startViewportY: 0,
    suppressContext: false
  })

  function startGrab(clientX: number, clientY: number) {
    if (grabRef.current.active) return
    const store = useCanvasStore.getState()
    grabRef.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      startViewportX: store.viewportX,
      startViewportY: store.viewportY,
      // Only suppress context menu after grab ends — set true on first move
      suppressContext: false
    }
    setGrabbing(true)
  }

  function endGrab() {
    if (!grabRef.current.active) return
    grabRef.current.active = false
    setGrabbing(false)
  }

  function isGrabCombo(buttons: number): boolean {
    // Both left+right, or middle
    return (buttons & BOTH_LR) === BOTH_LR || (buttons & MIDDLE) !== 0
  }

  useEffect(() => {
    // Use capture phase + check e.buttons bitmask (always accurate)
    const onDown = (e: PointerEvent) => {
      if (isGrabCombo(e.buttons)) {
        startGrab(e.clientX, e.clientY)
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const onMove = (e: PointerEvent) => {
      // Check buttons on every move — if combo is held, ensure we're grabbing
      if (!grabRef.current.active && isGrabCombo(e.buttons)) {
        startGrab(e.clientX, e.clientY)
      }

      if (!grabRef.current.active) return

      // If buttons released during move, end grab
      if (!isGrabCombo(e.buttons)) {
        endGrab()
        return
      }

      const zoom = useCanvasStore.getState().zoom
      const dx = (e.clientX - grabRef.current.startX) / zoom
      const dy = (e.clientY - grabRef.current.startY) / zoom
      // Only suppress context menu if the user actually moved while grabbing
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        grabRef.current.suppressContext = true
      }
      useCanvasStore.getState().scrollTo(
        grabRef.current.startViewportX - dx,
        grabRef.current.startViewportY - dy
      )
      e.preventDefault()
      e.stopPropagation()
    }

    const onUp = (e: PointerEvent) => {
      if (grabRef.current.active && !isGrabCombo(e.buttons)) {
        endGrab()
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const onContext = (e: MouseEvent) => {
      if (grabRef.current.suppressContext) {
        e.preventDefault()
        // Reset after one suppression
        setTimeout(() => { grabRef.current.suppressContext = false }, 50)
      }
    }

    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onUp, true)
    window.addEventListener('contextmenu', onContext, true)

    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', onUp, true)
      window.removeEventListener('contextmenu', onContext, true)
    }
  }, [])

  // --- Momentum animation ---
  const animate = useCallback(() => {
    const spring = springRef.current
    if (!spring.animating) return

    useCanvasStore.getState().scrollBy(spring.velocityX, spring.velocityY)

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

  // --- Wheel: scroll or zoom ---
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Ctrl+wheel = zoom
    if (e.ctrlKey || e.metaKey) {
      const store = useCanvasStore.getState()
      const oldZoom = store.zoom
      const delta = -e.deltaY * ZOOM_SPEED
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oldZoom + delta * oldZoom))

      const container = (e.currentTarget as HTMLElement)
      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      const canvasX = store.viewportX + cursorX / oldZoom
      const canvasY = store.viewportY + cursorY / oldZoom

      const newViewportX = canvasX - cursorX / newZoom
      const newViewportY = canvasY - cursorY / newZoom

      store.setViewport(newViewportX, newViewportY, newZoom)
      return
    }

    // Normal scroll (Shift+wheel swaps axes for horizontal scroll)
    const spring = springRef.current
    const zoom = useCanvasStore.getState().zoom
    const rawDX = e.deltaX
    const rawDY = e.deltaY
    const dx = (e.shiftKey ? (rawDX || rawDY) : rawDX) * SCROLL_SPEED / zoom
    const dy = (e.shiftKey ? 0 : rawDY) * SCROLL_SPEED / zoom

    useCanvasStore.getState().scrollBy(dx, dy)

    spring.velocityX = dx * 0.3
    spring.velocityY = dy * 0.3

    if (!spring.animating) {
      spring.animating = true
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [animate])

  // --- Spring animation for column focus ---
  const springVelRef = useRef({ x: 0, y: 0 })
  const springRafRef = useRef<number>(0)

  const springAnimate = useCallback(() => {
    const store = useCanvasStore.getState()
    const target = store.springTarget
    if (!target) return

    const dx = target.x - store.viewportX
    const dy = target.y - store.viewportY
    const vel = springVelRef.current

    vel.x += dx * SPRING_STIFFNESS
    vel.y += dy * SPRING_STIFFNESS
    vel.x *= SPRING_DAMPING
    vel.y *= SPRING_DAMPING

    store.scrollTo(store.viewportX + vel.x, store.viewportY + vel.y)

    if (Math.abs(vel.x) < SPRING_MIN_VELOCITY && Math.abs(vel.y) < SPRING_MIN_VELOCITY &&
        Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      // Snap to target and stop
      store.scrollTo(target.x, target.y)
      useCanvasStore.setState({ springTarget: null })
      vel.x = 0
      vel.y = 0
      return
    }

    springRafRef.current = requestAnimationFrame(springAnimate)
  }, [])

  // Watch for springTarget changes
  useEffect(() => {
    let prevTarget: { x: number; y: number } | null = null
    const unsub = useCanvasStore.subscribe((state) => {
      const target = state.springTarget
      if (target && target !== prevTarget) {
        prevTarget = target
        springVelRef.current = { x: 0, y: 0 }
        if (springRafRef.current) cancelAnimationFrame(springRafRef.current)
        springRafRef.current = requestAnimationFrame(springAnimate)
      } else if (!target) {
        prevTarget = null
      }
    })
    return () => {
      unsub()
      if (springRafRef.current) cancelAnimationFrame(springRafRef.current)
    }
  }, [springAnimate])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { handleWheel, grabbing }
}
