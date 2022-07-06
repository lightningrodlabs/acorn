import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

const drawSelectedBorder = ({
  isSelected,
  xPosition,
  yPosition,
  width,
  height,
  cornerRadius,
  strokeColor,
  strokeWidth,
  ctx,
}: {
  isSelected: boolean
  xPosition: number
  yPosition: number
  width: number
  height: number
  cornerRadius: number
  strokeColor: string
  strokeWidth: number
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    if (isSelected) {
      drawRoundCornerRectangle({
        ctx,
        xPosition,
        yPosition,
        width,
        height,
        radius: cornerRadius,
        color: strokeColor,
        useDashedStroke: false,
        useStroke: true,
        strokeWidth: strokeWidth,
        useBoxShadow: false,
        useGlow: false,
      })
    }
  })

export default drawSelectedBorder
