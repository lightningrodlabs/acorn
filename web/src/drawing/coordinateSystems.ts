// this was helpful: https://stackoverflow.com/questions/48343436/how-to-convert-svg-element-coordinates-to-screen-coordinates
export function coordsPageToCanvas(
  pageCoords: { x: number; y: number },
  translate: { x: number; y: number },
  scale: number
) {
  // an array representing the canvas transformation matrix
  // scale x, skew x, skew y, scale y, translate x, and translate y
  let matrix = new DOMMatrix([scale, 0, 0, scale, translate.x, translate.y])
  matrix.invertSelf()
  return {
    x: pageCoords.x * matrix.a + pageCoords.y * matrix.c + matrix.e,
    y: pageCoords.x * matrix.b + pageCoords.y * matrix.d + matrix.f,
  }
}

export function coordsCanvasToPage(
  canvasCoords: { x: number; y: number },
  translate: { x: number; y: number },
  scale: number
) {
  // an array representing the canvas transformation matrix
  // scale x, skew x, skew y, scale y, translate x, and translate y
  let matrix = new DOMMatrix([scale, 0, 0, scale, translate.x, translate.y])
  return {
    x: canvasCoords.x * matrix.a + canvasCoords.y * matrix.c + matrix.e,
    y: canvasCoords.x * matrix.b + canvasCoords.y * matrix.d + matrix.f,
  }
}
