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
  skipRender,
  useLineLimit,
  onlyMeasure,
  xPosition,
  yPosition,
  zoomLevel,
  statement,
  width,
  color,
  ctx,
  statementPlaceholder,
  statementPlaceholderHeight,
  statementPlaceholderLineSpace,
  statementPlaceholderColor,
}: {
  skipRender: boolean
  useLineLimit: boolean
  onlyMeasure: boolean
  xPosition: number
  yPosition: number
  zoomLevel: number
  statement: string
  width: number
  color: string
  ctx: CanvasRenderingContext2D
  statementPlaceholder: boolean
  statementPlaceholderHeight: number
  statementPlaceholderLineSpace: number
  statementPlaceholderColor: string
}): number => {
  let height: number = 0
  // early exit with no rendering, in the case of skipRender
  if (skipRender) return height

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

    let dynamicTotalOutcomeStatementHeight: number
    // If calling the function is not showing statement placeholder and not for measuring only
    if (!statementPlaceholder) {
      if (!onlyMeasure) {
        // statement font color
        ctx.fillStyle = color
        // Render each line of the Statement text
        lines.forEach((line, index) => {
          let linePosition = index * (fontSizeToUse + lineSpacingToUse)
          ctx.fillText(line, textBoxLeft, textBoxTop + linePosition)
        })
      }
      // make the height of Outcome Statament
      // dependent on the number of lines it has
      // which will determine the height of the card
      // and the space between the statement and
      // the bottom of the card
      dynamicTotalOutcomeStatementHeight =
        fontSizeToUse * lines.length + lineSpacingToUse * lines.length
    } else if (statementPlaceholder) {
      // If showing the statement placeholder
      if (!onlyMeasure) {
        ctx.fillStyle = statementPlaceholderColor
        lines.forEach((line, index) => {
          let linePosition =
            index * (statementPlaceholderHeight + statementPlaceholderLineSpace)
          ctx.fillRect(
            textBoxLeft,
            textBoxTop + linePosition,
            width,
            statementPlaceholderHeight
          )
        })
      }
      dynamicTotalOutcomeStatementHeight =
        statementPlaceholderHeight * lines.length +
        statementPlaceholderLineSpace * lines.length
    }

    // let measurements = ctx.measureText(lines[0])
    // help from https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
    // let fontHeight =
    //   measurements.fontBoundingBoxAscent + measurements.fontBoundingBoxDescent

    if (lines.length < 4 && !statementPlaceholder) {
      height = Math.max(
        outcomeStatementMinHeightWithoutMeta,
        dynamicTotalOutcomeStatementHeight
      )
    } else {
      height = dynamicTotalOutcomeStatementHeight
    }
  })
  return height
}

export default drawStatement
