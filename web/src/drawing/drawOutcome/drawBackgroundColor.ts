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
    // these create shadow effects for
    // the outcome card, a dream-like effect
    // for everything painted on it
    ctx.shadowColor = '#C7BEB460'
    ctx.shadowBlur = 30
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0


    drawRoundCornerRectangle({
      ctx,
      xPosition,
      yPosition,
      width,
      height,
      radius: cornerRadius,
      color: backgroundColor,
      useBoxShadow: true,
      useDashedStroke: false,
      useStroke: false,
      useGlow: false,
    })
  })

export default drawBackgroundColor
