import {
  firstZoomThreshold,
  fontSizeExtraLargeInt,
  fontSizeInt,
  fontSizeLargeInt,
  getLinesForParagraphs,
  lineSpacing,
  lineSpacingExtraLarge,
  lineSpacingLarge,
  secondZoomThreshold,
} from '../dimensions'
import draw from '../draw'

const drawStatement = ({
  xPosition,
  yPosition,
  zoomLevel,
  statement,
  width,
  color,
  ctx,
}: {
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
    })

    // PERHAPS: we might re-enable this
    // for space reasons
    // we limit the number of visible lines of the Outcome Title to 2 or 3,
    // and provide an ellipsis if there are more lines than that
    // let lineLimit = 3
    // for extra large text, reduce to only two lines
    // if (scale < secondZoomThreshold) {
    //   lineLimit = 2
    // }
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
    // The code for doing limited line counts
    // lines.slice(0, lineLimit).forEach((line, index) => {
    lines.forEach((line, index) => {
      let linePosition = index * (fontSizeToUse + lineSpacingToUse)
      let lineText = line
      // if we're on the last line and there's more than the visible number of lines
      // if (lines.length > lineLimit && index === lineLimit - 1) {
      // then replace the last characters with an ellipsis
      // to indicate that there's more that's hidden
      // lineText = `${line.slice(0, line.length - 3)}...`
      // }
      ctx.fillText(lineText, textBoxLeft, textBoxTop + linePosition)
    })
    let measurements = ctx.measureText(lines[0])
    // help from https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
    let fontHeight =
      measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent
    height = fontHeight * lines.length + lineSpacingToUse * lines.length
  })
  return height
}

export default drawStatement
