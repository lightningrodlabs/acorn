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
  glowBlur,
  ctx,
}: {
  xPosition: number
  yPosition: number
  width: number
  height: number
  cornerRadius: number
  useGlow: boolean
  glowColor: string
  glowBlur: number // px
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
        useDashedStroke: false,
        useStroke: false,
        useBoxShadow: true,
        useGlow,
        glowBlur,
        glowColor,
      })
    }
  })

export default drawGlow
