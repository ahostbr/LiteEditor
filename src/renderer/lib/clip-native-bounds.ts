/**
 * Clips native view bounds to the canvas container's visible area.
 * Native WebContentsViews don't respect CSS overflow:hidden or transforms,
 * so we must manually intersect their bounds with the canvas container rect.
 */
export function clipToCanvasContainer(
  bounds: { x: number; y: number; width: number; height: number }
): { x: number; y: number; width: number; height: number; visible: boolean } {
  const container = document.querySelector('[data-canvas-container]') as HTMLElement | null
  if (!container) {
    // Not in canvas mode — return bounds unchanged
    // Note: DOMRect properties are prototype getters, not own enumerable — spread won't copy them
    return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, visible: bounds.width > 0 && bounds.height > 0 }
  }

  const cr = container.getBoundingClientRect()

  const clippedX = Math.max(bounds.x, cr.left)
  const clippedY = Math.max(bounds.y, cr.top)
  const clippedRight = Math.min(bounds.x + bounds.width, cr.right)
  const clippedBottom = Math.min(bounds.y + bounds.height, cr.bottom)

  const width = Math.max(0, clippedRight - clippedX)
  const height = Math.max(0, clippedBottom - clippedY)

  return {
    x: Math.round(clippedX),
    y: Math.round(clippedY),
    width: Math.round(width),
    height: Math.round(height),
    visible: width > 4 && height > 4
  }
}
