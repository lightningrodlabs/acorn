import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

const drawGlow = ({
  xPosition,
  yPosition,
  width,
  height,
  cornerRadius,
  useGlow,
  glowColor,
  ctx,
}: {
  xPosition: number
  yPosition: number
  width: number
  height: number
  cornerRadius: number
  useGlow: boolean
  glowColor: string
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    if (useGlow) {
      drawRoundCornerRectangle({
        ctx,
        xPosition,
        yPosition,
        width,
        height,
        radius: cornerRadius,
        color: '#FFFFFF',
        useStroke: false,
        useBoxShadow: true,
        useGlow,
        glowColor,
      })
    }
  })

export default drawGlow
