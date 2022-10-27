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
  zoomLevel,
  ctx,
}: {
  outcome: ComputedOutcome
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  zoomLevel: number
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawSmallLeaf>[0] => {
  // leaf size changes depending on the zoom level
  let leafSize = IMAGE_SIZE
  // if (zoomLevel < 0.15) {
  //   leafSize = 80
  // } else if (zoomLevel < 0.3) {
  //   leafSize = 60
  // } else if (zoomLevel < 0.45) {
  //   leafSize = 50
  // if (zoomLevel < 0.60) {
  //   leafSize = leafSize / zoomLevel * 0.5
  // }

  const args: Parameters<typeof drawSmallLeaf>[0] = {
    xPosition: outcomeLeftX + outcomeWidth - BORDER_RADIUS_COMPENSATION,
    yPosition: outcomeTopY - leafSize + BORDER_RADIUS_COMPENSATION,
    isAchieved:
      outcome.computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved,
    isSmall: outcome.computedScope === ComputedScope.Small,
    size: leafSize,
    ctx,
  }
  return args
}
