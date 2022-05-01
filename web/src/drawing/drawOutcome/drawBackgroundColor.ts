import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

const drawBackgroundColor = ({
  xPosition,
  yPosition,
  width,
  height,
  cornerRadius,
  backgroundColor,
  ctx,
}: {
  xPosition: number
  yPosition: number
  width: number
  height: number
  cornerRadius: number
  backgroundColor: string
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    drawRoundCornerRectangle({
      ctx,
      xPosition,
      yPosition,
      width,
      height,
      radius: cornerRadius,
      color: backgroundColor,
      useBoxShadow: true,
      useStroke: false,
      useGlow: false,
    })
  })

export default drawBackgroundColor
