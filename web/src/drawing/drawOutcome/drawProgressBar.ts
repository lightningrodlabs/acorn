import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

const drawProgressBar = ({
  skipRender,
  onlyMeasure,
  progress,
  xPosition,
  yPosition,
  width,
  height,
  backgroundColor,
  foregroundColor,
  ctx,
}: {
  skipRender: boolean
  onlyMeasure: boolean
  xPosition: number
  yPosition: number
  width: number
  height: number
  progress: number
  backgroundColor: string
  foregroundColor: string
  ctx: CanvasRenderingContext2D
}): number => {
  // skipRender is a way of preventing this function
  // from rendering the element
  if (progress === 0 || progress === 100 || skipRender) {
    return 0 // height
  }

  // onlyMeasure means act as if we were rendering it, and return
  // the height of the would-be element, but don't actually render it to the canvas
  if (!onlyMeasure) {
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
  }
  return height
}

export default drawProgressBar
