import {
  ACHIEVED_BACKGROUND_COLOR,
  NOT_ACHIEVED_BACKGROUND_COLOR,
  AWAITING_EVAL_BACKGROUND_COLOR,
  READY_SIGNOFF_BACKGROUND_COLOR,
  CRITERIA_REGRESSION_BACKGROUND_COLOR,
  DEFAULT_OUTCOME_BACKGROUND_COLOR,
} from '../../../styles'
import {
  ComputedOutcome,
  ComputedSimpleAchievementStatus,
  ComputedScope,
} from '../../../types'
import {
  isAwaitingHumanEvaluation,
  isReadyForSignoff,
  hasCriteriaRegression,
} from '../../../awaitingEval'
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
  const halfBorder = borderWidth / 2
  const xPosition = outcomeLeftX + halfBorder
  const yPosition = outcomeTopY + halfBorder
  const width = outcomeWidth - borderWidth
  const height = outcomeHeight - borderWidth
  const backgroundCornerRadius = cornerRadius - 1
  let backgroundColor: string
  let useGreenBoxShadow = false
  if (
    outcome.computedAchievementStatus.simple ===
    ComputedSimpleAchievementStatus.Achieved
  ) {
    // Achieved with an unmet criterion is a regression — warn, don't stay green
    if (hasCriteriaRegression(outcome)) {
      backgroundColor = CRITERIA_REGRESSION_BACKGROUND_COLOR
    } else {
      backgroundColor = ACHIEVED_BACKGROUND_COLOR
      useGreenBoxShadow = true
    }
  } else if (outcome.computedScope === ComputedScope.Small) {
    // ramp: all criteria met → gold (ready to finalize); a human criterion still
    // pending → pink ("evaluate me"); otherwise tan (in progress)
    backgroundColor = isReadyForSignoff(outcome)
      ? READY_SIGNOFF_BACKGROUND_COLOR
      : isAwaitingHumanEvaluation(outcome)
      ? AWAITING_EVAL_BACKGROUND_COLOR
      : NOT_ACHIEVED_BACKGROUND_COLOR
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
    useGreenBoxShadow,
    ctx,
  }
  return args
}
