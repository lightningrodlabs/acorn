import { STATEMENT_PLACEHOLDER_COLOR } from '../../styles'
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
  statementPlaceholder,
  statementPlaceholderColor,
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
  statementPlaceholder: boolean
  statementPlaceholderColor: string
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

    // If calling the function is not showing statement placeholder and not for measuring only
    if (!statementPlaceholder && !onlyMeasure) {
      // statement font color
      ctx.fillStyle = color
      // Render each line of the Statement text
      lines.forEach((line, index) => {
        let linePosition = index * (fontSizeToUse + lineSpacingToUse)
        ctx.fillText(line, textBoxLeft, textBoxTop + linePosition)
      })
      // If showing the statement placeholder
    } else if (statementPlaceholder && !onlyMeasure) {
      ctx.fillStyle = statementPlaceholderColor
      lines.forEach((line, index) => {
        let linePosition = index * (fontSizeToUse + lineSpacingToUse)
        ctx.fillRect(textBoxLeft, textBoxTop + linePosition, width, fontSizeToUse)
      })
    }

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
