import { ComputedOutcome } from "../../../types"
import drawPeopleActive from "../drawPeopleActive"

export const argsForDrawPeopleActive = ({
  outcome,
  ctx,
}: {
  outcome: ComputedOutcome
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawPeopleActive>[0] => {
  const args: Parameters<typeof drawPeopleActive>[0] = {
    members: [],
    xPosition: 0,
    yPosition: 0,
    avatarSize: 0,
    avatarSpace: 0,
    ctx,
  }
  return args
}
