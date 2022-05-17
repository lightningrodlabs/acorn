import { Tag } from '../../types'
import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

const drawTags = ({
  onlyMeasure,
  tagVerticalSpaceBetween,
  tagHorizontalSpaceBetween,
  tagHorizontalPadding,
  tagVerticalPadding,
  cornerRadius,
  fontSizeRem,
  fontFamily,
  fontColor,
  tags,
  xPosition,
  yPosition,
  maxWidth,
  ctx,
}: {
  onlyMeasure: boolean
  tagVerticalSpaceBetween: number
  tagHorizontalSpaceBetween: number
  tagHorizontalPadding: number
  tagVerticalPadding: number
  cornerRadius: number
  fontSizeRem: number
  fontFamily: string
  fontColor: string
  tags: Tag[]
  xPosition: number
  yPosition: number
  maxWidth: number
  ctx: CanvasRenderingContext2D
}): number => {
  // because the height of this is dynamic
  // we equip it to return the height to the caller
  if (tags.length === 0) {
    return 0 // height
  }

  // temp value
  let lines: number = 1
  let singleLineHeight: number
  // final return value
  let tagsHeight: number
  draw(ctx, () => {
    // have to set font before using measureText
    ctx.font = `${fontSizeRem}rem ${fontFamily}`
    ctx.textBaseline = 'top'
    ctx.fillStyle = fontColor

    let measurements = ctx.measureText(
      'the text doesnt matter here to measure height'
    )
    // help from https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
    let fontHeight =
      measurements.actualBoundingBoxAscent +
      measurements.actualBoundingBoxDescent

    // draw the first one in the first position,
    // the next ones have to track the position of the last ones
    let currentX: number = xPosition
    let currentY: number = yPosition
    tags.forEach((tag) => {
      if (!tag) {
        return
      }
      const textWidth = ctx.measureText(tag.text).width
      const width = textWidth + tagHorizontalPadding * 2
      const height = fontHeight + tagVerticalPadding * 2
      singleLineHeight = height
      const heightPlusVerticalSpace = height + tagVerticalSpaceBetween
      const widthPlusHorizontalSpace = width + tagHorizontalSpaceBetween
      if (currentX + widthPlusHorizontalSpace > xPosition + maxWidth) {
        currentX = xPosition
        currentY += heightPlusVerticalSpace
        lines += 1
      }
      // there is a situation where we want to measure
      // how 'high' this 'component' will be, without actually
      // rendering it, and that's what this code is for
      if (!onlyMeasure) {
        drawRoundCornerRectangle({
          ctx,
          xPosition: currentX,
          yPosition: currentY,
          width,
          height,
          radius: cornerRadius,
          color: tag.backgroundColor,
          useStroke: false,
          useBoxShadow: false,
          useGlow: false,
        })
        ctx.fillText(
          tag.text,
          currentX + tagHorizontalPadding,
          currentY + tagVerticalPadding
        )
      }
      currentX += widthPlusHorizontalSpace
    })
  })
  tagsHeight = lines * singleLineHeight + (lines - 1) * tagVerticalSpaceBetween
  return tagsHeight
}

export default drawTags
