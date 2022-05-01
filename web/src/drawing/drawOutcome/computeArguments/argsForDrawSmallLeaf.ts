import { ComputedOutcome } from '../../../types'
import drawSmallLeaf from '../drawSmallLeaf'

export const argsForDrawSmallLeaf = ({
  outcome,
  ctx,
}: {
  outcome: ComputedOutcome
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawSmallLeaf>[0] => {
  const args: Parameters<typeof drawSmallLeaf>[0] = {
    xPosition: 0,
    yPosition: 0,
    isAchieved: false,
    isSmall: false,
    ctx,
  }
  return args
}
