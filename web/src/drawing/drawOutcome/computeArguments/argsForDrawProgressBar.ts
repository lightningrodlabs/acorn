import {
  PROGRESS_BAR_FOREGROUND_COLOR,
  PROGRESS_BAR_BACKGROUND_COLOR,
} from '../../../styles'
import { ComputedOutcome, ComputedScope } from '../../../types'
import {
  DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT,
  outcomePaddingHorizontal,
  OUTCOME_VERTICAL_SPACE_BETWEEN,
  PROGRESS_BAR_HEIGHT,
} from '../../dimensions'
import drawProgressBar from '../drawProgressBar'

export const argsForDrawProgressBar = ({
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  outcomeStatementHeight,
  outcomeTagsHeight,
  outcomeTimeAndAssigneesHeight,
  ctx,
}: {
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  outcomeStatementHeight: number
  outcomeTagsHeight: number
  outcomeTimeAndAssigneesHeight: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawProgressBar>[0] => {
  const xPosition = outcomeLeftX + outcomePaddingHorizontal
  const width = outcomeWidth - outcomePaddingHorizontal * 2

  const verticalSpacing =
    OUTCOME_VERTICAL_SPACE_BETWEEN * 3 +
    // if tags existed, then we need another spacer
    (outcomeTagsHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN : 0) +
    // if time or assignees existed, then we need another spacer
    (outcomeTimeAndAssigneesHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN : 0)

  const yPosition =
    outcomeTopY +
    DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT +
    outcomeStatementHeight +
    outcomeTagsHeight +
    outcomeTimeAndAssigneesHeight +
    verticalSpacing

  const progress =
    outcome.computedScope === ComputedScope.Big
      ? Math.round(
          (outcome.computedAchievementStatus.smallsAchieved /
            outcome.computedAchievementStatus.smallsTotal) *
            100
        )
      : outcome.computedScope === ComputedScope.Small &&
        outcome.computedAchievementStatus.tasksTotal > 0
      ? Math.round(
          (outcome.computedAchievementStatus.tasksAchieved /
            outcome.computedAchievementStatus.tasksTotal) *
            100
        )
      : 0
  const args: Parameters<typeof drawProgressBar>[0] = {
    ctx,
    xPosition,
    yPosition,
    width,
    height: PROGRESS_BAR_HEIGHT,
    progress,
    backgroundColor: PROGRESS_BAR_BACKGROUND_COLOR,
    foregroundColor: PROGRESS_BAR_FOREGROUND_COLOR,
  }
  return args
}
