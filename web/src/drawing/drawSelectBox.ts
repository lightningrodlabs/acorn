function SelectBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  color: string,
  stroke: boolean,
  strokeWidth: number
) {
  const r = x + w
  const b = y + h

  ctx.save()
  ctx.beginPath()

  if (stroke) ctx.strokeStyle = color
  else ctx.fillStyle = color

  ctx.lineWidth = stroke ? strokeWidth : 1.5
  ctx.moveTo(x + radius, y)
  ctx.lineTo(r - radius, y)
  ctx.quadraticCurveTo(r, y, r, y + radius)
  ctx.lineTo(r, y + h - radius)
  ctx.quadraticCurveTo(r, b, r - radius, b)
  ctx.lineTo(x + radius, b)
  ctx.quadraticCurveTo(x, b, x, b - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)

  if (stroke) ctx.stroke()
  else ctx.fill()

  ctx.restore()
}

// render the select box
export default function render(
  initialCoord: { x: number; y: number },
  currentCoord: { x: number; y: number },
  ctx: CanvasRenderingContext2D
) {
  const realWidth = currentCoord.x - initialCoord.x
  const realHeight = currentCoord.y - initialCoord.y
  let x = initialCoord.x
  let y = initialCoord.y
  if (realWidth < 0) {
    x += realWidth
  }
  if (realHeight < 0) {
    y += realHeight
  }
  const widthAbsValue = Math.abs(realWidth)
  const heightAbsValue = Math.abs(realHeight)
  const lesser = Math.min(widthAbsValue, heightAbsValue)
  // the dark border
  SelectBox(
    ctx,
    x,
    y,
    widthAbsValue,
    heightAbsValue,
    Math.min(10, lesser),
    '#344cff',
    true,
    3
  )
  // the semi-transparent lighter background color
  SelectBox(
    ctx,
    x + 2,
    y + 2,
    widthAbsValue - 2,
    heightAbsValue - 2,
    Math.min(7, lesser),
    '#344cff31',
    false,
    4
  )
}
