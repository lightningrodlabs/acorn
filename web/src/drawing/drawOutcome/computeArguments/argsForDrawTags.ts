import { TAGS_TAG_FONT_COLOR } from '../../../styles'
import { ComputedOutcome, ComputedScope, Tag } from '../../../types'
import { WithActionHash } from '../../../types/shared'
import {
  outcomePaddingHorizontal,
  TAGS_SPACE_BETWEEN,
  TAGS_TAG_CORNER_RADIUS,
  TAGS_TAG_FONT_FAMILY,
  TAGS_TAG_FONT_SIZE_REM,
  TAGS_TAG_HORIZONTAL_PADDING,
  TAGS_TAG_VERTICAL_PADDING,
} from '../../dimensions'
import drawTags from '../drawTags'

export const argsForDrawTags = ({
  onlyMeasure = false,
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  topOffsetY,
  projectTags,
  zoomLevel,
  ctx,
}: {
  onlyMeasure?: boolean
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  topOffsetY: number
  outcomeWidth: number
  projectTags: WithActionHash<Tag>[]
  zoomLevel: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawTags>[0] => {
  // turn the actionHash array of tags into
  // an array of actual Tag objects
  const tags = outcome.tags
    .map((actionHash) => {
      return projectTags.find(
        (projectTag) => projectTag.actionHash === actionHash
      )
    })
    // filter out tags which have not yet loaded, or are otherwise missing
    .filter((t) => t)
  const xPosition = outcomeLeftX + outcomePaddingHorizontal
  const yPosition = outcomeTopY + topOffsetY
  const maxWidth = outcomeWidth - 2 * outcomePaddingHorizontal

  const tagPlaceholder = outcome
    ? outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.5
    : false

  const skipRender = outcome
    ? outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.3
    : false

  const args: Parameters<typeof drawTags>[0] = {
    onlyMeasure,
    skipRender,
    ctx,
    tagVerticalSpaceBetween: TAGS_SPACE_BETWEEN,
    tagHorizontalSpaceBetween: TAGS_SPACE_BETWEEN,
    tagHorizontalPadding: TAGS_TAG_HORIZONTAL_PADDING,
    tagVerticalPadding: TAGS_TAG_VERTICAL_PADDING,
    cornerRadius: TAGS_TAG_CORNER_RADIUS,
    fontSizeRem: TAGS_TAG_FONT_SIZE_REM,
    fontFamily: TAGS_TAG_FONT_FAMILY,
    fontColor: TAGS_TAG_FONT_COLOR,
    tags,
    xPosition,
    yPosition,
    maxWidth,
    tagPlaceholder,
  }
  return args
}
