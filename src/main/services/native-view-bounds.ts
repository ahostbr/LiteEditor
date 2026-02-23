import { BrowserWindow } from 'electron'

export interface NativeViewBounds {
  x: number
  y: number
  width: number
  height: number
  viewportWidth?: number
  viewportHeight?: number
}

export function toContentBounds(mainWindow: BrowserWindow, bounds: NativeViewBounds): Electron.Rectangle {
  const contentBounds = mainWindow.getContentBounds()

  let x = bounds.x
  let y = bounds.y
  let width = bounds.width
  let height = bounds.height

  const hasViewportSize =
    typeof bounds.viewportWidth === 'number' &&
    bounds.viewportWidth > 0 &&
    typeof bounds.viewportHeight === 'number' &&
    bounds.viewportHeight > 0

  if (hasViewportSize) {
    const scaleX = contentBounds.width / bounds.viewportWidth
    const scaleY = contentBounds.height / bounds.viewportHeight
    x *= scaleX
    y *= scaleY
    width *= scaleX
    height *= scaleY
  }

  return {
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
    width: Math.max(0, Math.round(width)),
    height: Math.max(0, Math.round(height))
  }
}
