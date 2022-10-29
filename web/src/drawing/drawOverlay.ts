import draw from './draw'

export default function render(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  draw(ctx, () => {
    // counteract the scale and translation
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = 'rgb(239 236 231 / 90%)'
    ctx.fillRect(x, y, width, height)
  })
}
