import { ComputedOutcome, Profile } from '../../../types'
import drawPeopleActive from '../drawPeopleActive'

export const argsForDrawPeopleActive = ({
  outcome,
  ctx,
  outcomeFocusedMembers,
}: {
  outcome: ComputedOutcome
  ctx: CanvasRenderingContext2D
  outcomeFocusedMembers: Profile[]
}): Parameters<typeof drawPeopleActive>[0] => {
  const args: Parameters<typeof drawPeopleActive>[0] = {
    // TODO: check these fixed values on different zoom levels
    // and make them adapt according to zoom level
    outcomeFocusedMembers,
    xPosition: 82,
    yPosition: 132,
    avatarSize: 46,
    avatarSpace: 0,
    ctx,
  }
  return args
}
