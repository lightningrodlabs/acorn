import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

const drawColoredBorder = ({
  xPosition,
  yPosition,
  width,
  height,
  strokeWidth,
  cornerRadius,
  borderColor,
  ctx,
}: {
  xPosition: number
  yPosition: number
  width: number
  height: number
  strokeWidth: number
  cornerRadius: number
  borderColor: string
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    drawRoundCornerRectangle({
      ctx,
      xPosition,
      yPosition,
      width,
      height,
      strokeWidth,
      radius: cornerRadius,
      color: borderColor,
      useStroke: true,
      useBoxShadow: false,
      useGlow: false,
    })
  })

export default drawColoredBorder
