import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

const drawProgressBar = ({
  progress,
  xPosition,
  yPosition,
  width,
  height,
  backgroundColor,
  foregroundColor,
  ctx,
}: {
  xPosition: number
  yPosition: number
  width: number
  height: number
  progress: number
  backgroundColor: string
  foregroundColor: string
  ctx: CanvasRenderingContext2D
}) => {
  if (progress === 0 || progress === 100) {
    return 0 // height
  }

  // the background
  draw(ctx, () => {
    drawRoundCornerRectangle({
      xPosition,
      yPosition,
      width,
      height,
      radius: height / 2 + 1,
      color: backgroundColor,
      useDashedStroke: false,
      useStroke: false,
      useBoxShadow: false,
      useGlow: false,
      ctx,
    })
  })
  // the foreground
  draw(ctx, () => {
    drawRoundCornerRectangle({
      xPosition,
      yPosition,
      width: width * (progress / 100),
      height,
      radius: height / 2 + 1,
      color: foregroundColor,
      useDashedStroke: false,
      useStroke: false,
      useBoxShadow: false,
      useGlow: false,
      ctx,
    })
  })
  return height
}

export default drawProgressBar
