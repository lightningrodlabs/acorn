import {
  ACHIEVED_BORDER_COLOR,
  NOT_ACHIEVED_BORDER_COLOR,
  AWAITING_EVAL_BORDER_COLOR,
  READY_SIGNOFF_BORDER_COLOR,
  CRITERIA_REGRESSION_BACKGROUND_COLOR,
  CRITERIA_REGRESSION_BORDER_COLOR,
  ACHIEVED_BACKGROUND_COLOR,
  DEFAULT_OUTCOME_BORDER_COLOR,
  IN_BREAKDOWN_BORDER_COLOR,
} from '../../../styles'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../../types'
import {
  isAwaitingHumanEvaluation,
  isReadyForSignoff,
  hasCriteriaRegression,
} from '../../../awaitingEval'
import {
  borderWidth,
  cornerRadiusBorder,
  dashedBorderWidth,
} from '../../dimensions'
import drawColoredBorder from '../drawColoredBorder'

export const argsForDrawColoredBorder = ({
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
}): Parameters<typeof drawColoredBorder>[0] => {
  const halfBorder = borderWidth / 2

  const xPosition = outcomeLeftX + halfBorder
  const yPosition = outcomeTopY + halfBorder
  const width = outcomeWidth - borderWidth
  const height = outcomeHeight - borderWidth
  let strokeWidth = borderWidth
  // logic for In Breakdown Mode presentation for an Uncertain Outcome
  const useDashedStroke =
    outcome.computedScope === ComputedScope.Uncertain &&
    'Uncertain' in outcome.scope
      ? outcome.scope.Uncertain.inBreakdown
      : false
  if (useDashedStroke) {
    strokeWidth = dashedBorderWidth
  }

  let borderColor: string
  // we are only using a colored border
  // for Small scope Outcomes
  // as well as to match the background
  // color of a Big Achieved Outcome (and look borderless)
  if (
    outcome.computedScope === ComputedScope.Small &&
    outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved
  ) {
    // Achieved with an unmet criterion is a regression — warn, don't stay green
    borderColor = hasCriteriaRegression(outcome)
      ? CRITERIA_REGRESSION_BORDER_COLOR
      : ACHIEVED_BORDER_COLOR
  } else if (
    outcome.computedScope === ComputedScope.Small &&
    outcome.computedAchievementStatus.simple !==
      ComputedSimpleAchievementStatus.Achieved
  ) {
    // gold when all criteria are met (ready to finalize); pink when a human verdict
    // is still pending; otherwise tan
    borderColor = isReadyForSignoff(outcome)
      ? READY_SIGNOFF_BORDER_COLOR
      : isAwaitingHumanEvaluation(outcome)
      ? AWAITING_EVAL_BORDER_COLOR
      : NOT_ACHIEVED_BORDER_COLOR
  } else if (
    outcome.computedScope === ComputedScope.Big &&
    outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved
  ) {
    // it is supposed to look borderless, and so
    // it has to match the background color of
    // achieved (or of the criteria-regression warning)
    borderColor = hasCriteriaRegression(outcome)
      ? CRITERIA_REGRESSION_BACKGROUND_COLOR
      : ACHIEVED_BACKGROUND_COLOR
  } else if (
    outcome.computedScope === ComputedScope.Uncertain &&
    'Uncertain' in outcome.scope &&
    outcome.scope.Uncertain.inBreakdown
  ) {
    // dashed colored border for In Breakdown Mode for Uncertain Scope
    borderColor = IN_BREAKDOWN_BORDER_COLOR
  } else {
    borderColor = DEFAULT_OUTCOME_BORDER_COLOR
  }
  const args: Parameters<typeof drawColoredBorder>[0] = {
    xPosition,
    yPosition,
    width,
    height,
    strokeWidth,
    useDashedStroke,
    cornerRadius: cornerRadiusBorder,
    borderColor,
    ctx,
  }
  return args
}
