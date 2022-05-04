import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../../types'
import drawSmallLeaf from '../drawSmallLeaf'

const IMAGE_SIZE = 30
const BORDER_RADIUS_COMPENSATION = 10

export const argsForDrawSmallLeaf = ({
  outcome,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  ctx,
}: {
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawSmallLeaf>[0] => {
  const args: Parameters<typeof drawSmallLeaf>[0] = {
    xPosition: outcomeLeftX + outcomeWidth - BORDER_RADIUS_COMPENSATION,
    yPosition: outcomeTopY - IMAGE_SIZE + BORDER_RADIUS_COMPENSATION,
    isAchieved:
      outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved,
    isSmall: outcome.computedScope === ComputedScope.Small,
    size: IMAGE_SIZE,
    ctx,
  }
  return args
}
