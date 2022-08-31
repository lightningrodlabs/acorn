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
      useLineLimit: true,
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
      // lines.forEach((line, index) => {
      let linePosition = index * (fontSizeToUse + lineSpacingToUse)
      // let lineText = line
      // if we're on the last line and there's more than the visible number of lines
      // if (lines.length > lineLimit && index === lineLimit - 1) {
      //   // then replace the last characters with an ellipsis
      //   // to indicate that there's more that's hidden
      //   lineText = `${line.slice(0, line.length - 3)}...`
      // }
      // If calling the function is not for measuring only
      if (!onlyMeasure) {
        ctx.fillText(line, textBoxLeft, textBoxTop + linePosition)
      }
    })
    let measurements = ctx.measureText(lines[0])
    // help from https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
    let fontHeight =
      measurements.actualBoundingBoxAscent +
      measurements.actualBoundingBoxDescent
    // make the height of Outcome Statament
    //  dependant on the number of lines it has
    // which will determine the height of the card
    // and the space between the statement and
    // the bottom of the card
    const dynamicTotalOutcomeStatementHeight =
      fontHeight * lines.length + lineSpacingToUse * lines.length
    if (lines.length < 4) {
      height = Math.max(
        outcomeStatementMinHeightWithoutMeta,
        dynamicTotalOutcomeStatementHeight
      )
    } else if (lines.length >= 4 && !isRenderingOtherMetadata) {
      height = dynamicTotalOutcomeStatementHeight + 20
    } else if (lines.length >= 4) {
      height = dynamicTotalOutcomeStatementHeight
    }
  })
  return height
}

export default drawStatement
