import {
  DESCENDANTS_ACHIEVEMENT_STATUS_ACHIEVED_FONT_COLOR,
  DESCENDANTS_ACHIEVEMENT_STATUS_DEFAULT_FONT_COLOR,
} from '../../../styles'
import { ComputedOutcome } from '../../../types'
import {
  DESCENDANTS_ACHIEVEMENT_STATUS_FONT_FAMILY,
  DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM,
  outcomePaddingHorizontal,
  OUTCOME_VERTICAL_SPACE_BETWEEN,
} from '../../dimensions'
import drawDescendantsAchievementStatus from '../drawDescendantsAchievementStatus'

export const argsForDrawDescendantsAchievementStatus = ({
  outcome,
  outcomeLeftX,
  outcomeTopY,
  ctx,
}: {
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawDescendantsAchievementStatus>[0] => {
  const xPosition = outcomeLeftX + outcomePaddingHorizontal
  const yPosition = outcomeTopY + OUTCOME_VERTICAL_SPACE_BETWEEN

  const args: Parameters<typeof drawDescendantsAchievementStatus>[0] = {
    ctx,
    fontSize: DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM,
    fontFamily: DESCENDANTS_ACHIEVEMENT_STATUS_FONT_FAMILY,
    defaultTextColor: DESCENDANTS_ACHIEVEMENT_STATUS_DEFAULT_FONT_COLOR,
    achievedTextColor: DESCENDANTS_ACHIEVEMENT_STATUS_ACHIEVED_FONT_COLOR,
    withChildren: outcome.children.length > 0,
    xPosition,
    yPosition,
    computedScope: outcome.computedScope,
    computedAchievementStatus: outcome.computedAchievementStatus,
  }
  return args
}
