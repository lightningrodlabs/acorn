import {
  ACHIEVED_BACKGROUND_COLOR,
  NOT_ACHIEVED_BACKGROUND_COLOR,
  DEFAULT_OUTCOME_BACKGROUND_COLOR,
} from '../../../styles'
import {
  ComputedOutcome,
  ComputedSimpleAchievementStatus,
  ComputedScope,
} from '../../../types'
import { borderWidth, cornerRadius } from '../../dimensions'
import drawBackgroundColor from '../drawBackgroundColor'

/*
  Draw Background Color
*/
export const argsForDrawBackgroundColor = ({
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  outcomeHeight,
  ctx,
}: {
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  outcomeHeight: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawBackgroundColor>[0] => {
  const twiceBorder = borderWidth * 2
  const xPosition = outcomeLeftX + borderWidth
  const yPosition = outcomeTopY + borderWidth
  const width = outcomeWidth - twiceBorder
  const height = outcomeHeight - twiceBorder
  const backgroundCornerRadius = cornerRadius - 1
  let backgroundColor: string
  if (
    outcome.computedAchievementStatus.simple ===
    ComputedSimpleAchievementStatus.Achieved
  ) {
    backgroundColor = ACHIEVED_BACKGROUND_COLOR
  } else if (outcome.computedScope === ComputedScope.Small) {
    backgroundColor = NOT_ACHIEVED_BACKGROUND_COLOR
  } else {
    backgroundColor = DEFAULT_OUTCOME_BACKGROUND_COLOR
  }
  const args: Parameters<typeof drawBackgroundColor>[0] = {
    xPosition,
    yPosition,
    width,
    height,
    cornerRadius: backgroundCornerRadius,
    // compute according to Scope and Achievement Status
    backgroundColor,
    ctx,
  }
  return args
}
