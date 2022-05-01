import { ComputedOutcome } from '../../../types'
import drawBeingEdited from '../drawBeingEdited'

// TODO (later)
export const argsForDrawBeingEdited = ({
  outcome,
  ctx,
}: {
  outcome: ComputedOutcome
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawBeingEdited>[0] => {
  const args: Parameters<typeof drawBeingEdited>[0] = {
    ctx,
  }
  return args
}
