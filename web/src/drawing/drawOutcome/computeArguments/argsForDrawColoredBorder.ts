import {
  ACHIEVED_BORDER_COLOR,
  NOT_ACHIEVED_BORDER_COLOR,
  ACHIEVED_BACKGROUND_COLOR,
  DEFAULT_OUTCOME_BORDER_COLOR,
} from '../../../styles'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../../types'
import { borderWidth, cornerRadius } from '../../dimensions'
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
  const strokeWidth = borderWidth
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
    borderColor = ACHIEVED_BORDER_COLOR
  } else if (
    outcome.computedScope === ComputedScope.Small &&
    outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.NotAchieved
  ) {
    borderColor = NOT_ACHIEVED_BORDER_COLOR
    console.log('test is it ever here')
  } else if (
    outcome.computedScope === ComputedScope.Big &&
    outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved
  ) {
    // it is supposed to look borderless, and so
    // it has to match the background color of
    // achieved
    borderColor = ACHIEVED_BACKGROUND_COLOR
  } else {
    borderColor = DEFAULT_OUTCOME_BORDER_COLOR
  }
  console.log(outcome.computedScope, outcome.computedAchievementStatus.simple)
  const args: Parameters<typeof drawColoredBorder>[0] = {
    xPosition,
    yPosition,
    width,
    height,
    strokeWidth,
    cornerRadius,
    borderColor,
    ctx,
  }
  return args
}
