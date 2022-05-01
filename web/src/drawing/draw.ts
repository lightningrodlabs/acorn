export default function draw(
  ctx: CanvasRenderingContext2D,
  drawFn: () => void
) {
  ctx.save()
  drawFn()
  ctx.restore()
}
