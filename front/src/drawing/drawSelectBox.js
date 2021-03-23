function SelectBox(ctx, x, y, w, h, radius, color, stroke, strokeWidth) {
  const r = x + w
  const b = y + h

  ctx.save()
  ctx.beginPath()

  if (stroke) ctx.strokeStyle = color
  else ctx.fillStyle = color

  ctx.lineWidth = stroke ? strokeWidth : '1'
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

// render a goal card
export default function render({ x, y }, { w, h }, ctx) {
  if (w < 0) {
    x += w
    w *= -1
  }
  if (h < 0) {
    y += h
    h *= -1
  }

  SelectBox(ctx, x, y, w, h, 10, '#5F65FF', true, 3)
  SelectBox(ctx, x + 2, y + 2, w - 2, h - 2, 7, '#5F65FF31', false, 4)
}
