import {
  firstZoomThreshold,
  fontSizeExtraLargeInt,
  fontSizeInt,
  fontSizeLargeInt,
  getLinesForParagraphs,
  lineSpacing,
  lineSpacingExtraLarge,
  lineSpacingLarge,
  outcomeStatementMinHeightWithoutMeta,
  secondZoomThreshold,
} from '../dimensions'
import draw from '../draw'

const drawStatement = ({
  useLineLimit,
  isRenderingOtherMetadata,
  onlyMeasure,
  xPosition,
  yPosition,
  zoomLevel,
  statement,
  width,
  color,
  ctx,
}: {
  useLineLimit: boolean
  isRenderingOtherMetadata: boolean
  onlyMeasure: boolean
  xPosition: number
  yPosition: number
  zoomLevel: number
  statement: string
  width: number
  color: string
  ctx: CanvasRenderingContext2D
}): number => {
  let height: number
  draw(ctx, () => {
    const textBoxLeft = xPosition
    const textBoxTop = yPosition
    const lines = getLinesForParagraphs({
      ctx,
      statement,
      zoomLevel,
      maxWidth: width,
      useLineLimit,
    })

    let lineSpacingToUse = lineSpacing // the default
    let fontSizeToUse = fontSizeInt
    if (zoomLevel < secondZoomThreshold) {
      lineSpacingToUse = lineSpacingExtraLarge
      fontSizeToUse = fontSizeExtraLargeInt
    } else if (zoomLevel < firstZoomThreshold) {
      lineSpacingToUse = lineSpacingLarge
      fontSizeToUse = fontSizeLargeInt
    }
    ctx.fillStyle = color

    lines.forEach((line, index) => {
      let linePosition = index * (fontSizeToUse + lineSpacingToUse)
      // If calling the function is not for measuring only
      if (!onlyMeasure) {
        ctx.fillText(line, textBoxLeft, textBoxTop + linePosition)
      }
    })

    // let measurements = ctx.measureText(lines[0])
    // help from https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
    // let fontHeight =
    //   measurements.fontBoundingBoxAscent + measurements.fontBoundingBoxDescent

    // make the height of Outcome Statament
    // dependent on the number of lines it has
    // which will determine the height of the card
    // and the space between the statement and
    // the bottom of the card
    const dynamicTotalOutcomeStatementHeight =
      fontSizeToUse * lines.length + lineSpacingToUse * lines.length

    if (lines.length < 4) {
      height = Math.max(
        outcomeStatementMinHeightWithoutMeta,
        dynamicTotalOutcomeStatementHeight
      )
    } else if (lines.length >= 4 && !isRenderingOtherMetadata) {
      height = dynamicTotalOutcomeStatementHeight + 40
    } else if (lines.length >= 4) {
      height = dynamicTotalOutcomeStatementHeight
    }
  })
  return height
}

export default drawStatement
