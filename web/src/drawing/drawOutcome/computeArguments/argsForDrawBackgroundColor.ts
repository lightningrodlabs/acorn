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
    backgroundColor = ACHIEVED_BACKGROUND_COLOR
    useGreenBoxShadow = true
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
    useGreenBoxShadow,
    ctx,
  }
  return args
}
