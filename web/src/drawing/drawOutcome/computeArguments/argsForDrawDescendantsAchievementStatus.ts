import {
  DESCENDANTS_ACHIEVEMENT_STATUS_ACHIEVED_FONT_COLOR,
  DESCENDANTS_ACHIEVEMENT_STATUS_DEFAULT_FONT_COLOR,
} from '../../../styles'
import { ComputedOutcome, ComputedScope } from '../../../types'
import {
  DESCENDANTS_ACHIEVEMENT_STATUS_FONT_FAMILY,
  DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM,
  DESCENDANTS_ACHIEVEMENT_STATUS_IMAGE_SIZE,
  outcomePaddingHorizontal,
} from '../../dimensions'
import drawDescendantsAchievementStatus from '../drawDescendantsAchievementStatus'

export const argsForDrawDescendantsAchievementStatus = ({
  onlyMeasure,
  outcome,
  outcomeLeftX,
  outcomeTopY,
  topOffsetY,
  zoomLevel,
  ctx,
}: {
  onlyMeasure?: boolean
  outcome: ComputedOutcome
  zoomLevel: number
  outcomeLeftX: number
  outcomeTopY: number
  topOffsetY: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawDescendantsAchievementStatus>[0] => {
  const xPosition = outcomeLeftX + outcomePaddingHorizontal
  const yPosition = outcomeTopY + topOffsetY

  const skipRender = outcome
    ? (outcome.computedScope === ComputedScope.Small && zoomLevel <= 0.5) ||
      (outcome.computedScope !== ComputedScope.Small && zoomLevel <= 0.12)
    : false

  // in px
  let imageSize = DESCENDANTS_ACHIEVEMENT_STATUS_IMAGE_SIZE
  // in rem
  let fontSize = DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM
  if (
    outcome &&
    outcome.computedScope !== ComputedScope.Small &&
    zoomLevel < 0.25
  ) {
    fontSize = DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM + 2.25
    imageSize = DESCENDANTS_ACHIEVEMENT_STATUS_IMAGE_SIZE + 36
  } else if (
    outcome &&
    outcome.computedScope !== ComputedScope.Small &&
    zoomLevel < 0.35
  ) {
    fontSize = DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM + 1.25
    imageSize = DESCENDANTS_ACHIEVEMENT_STATUS_IMAGE_SIZE + 20
  }

  let skipUncertainText = false
  if (
    outcome &&
    outcome.computedScope === ComputedScope.Uncertain &&
    // match the zoom level above here
    zoomLevel < 0.35
  ) {
    // this is too big and doesn't fit well at this scale
    skipUncertainText = true
  }

  const args: Parameters<typeof drawDescendantsAchievementStatus>[0] = {
    skipRender,
    onlyMeasure,
    skipUncertainText,
    imageSize,
    fontSize,
    fontFamily: DESCENDANTS_ACHIEVEMENT_STATUS_FONT_FAMILY,
    defaultTextColor: DESCENDANTS_ACHIEVEMENT_STATUS_DEFAULT_FONT_COLOR,
    achievedTextColor: DESCENDANTS_ACHIEVEMENT_STATUS_ACHIEVED_FONT_COLOR,
    withChildren: outcome.children.length > 0,
    xPosition,
    yPosition,
    computedScope: outcome.computedScope,
    computedAchievementStatus: outcome.computedAchievementStatus,
    ctx,
  }
  return args
}
