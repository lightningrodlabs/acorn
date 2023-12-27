
export default function setupCanvas(
  canvas: HTMLCanvasElement,
  screenWidth: number,
  screenHeight: number,
  zoomLevel: number,
  translate: { x: number; y: number }
) {
  // Get the device pixel ratio, falling back to 1.
  const dpr = window.devicePixelRatio || 1
  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect()
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  // zoomLevel x, skew x, skew y, zoomLevel y, translate x, and translate y
  ctx.setTransform(1, 0, 0, 1, 0, 0) // normalize
  // clear the entirety of the canvas
  ctx.clearRect(0, 0, screenWidth, screenHeight)
  // zoomLevel all drawing operations by the dpr, as well as the zoom, so you
  // don't have to worry about the difference.
  ctx.setTransform(
    zoomLevel * dpr,
    0,
    0,
    zoomLevel * dpr,
    translate.x * dpr,
    translate.y * dpr
  )
  return ctx
}
