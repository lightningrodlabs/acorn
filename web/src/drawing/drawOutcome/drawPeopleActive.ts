import { Profile } from '../../types'
import draw from '../draw'
import drawAvatar from './drawAvatar'

// TODO
const drawPeopleActive = ({
  members,
  xPosition,
  yPosition,
  avatarSize,
  avatarSpace,
  ctx,
}: {
  members: Profile[]
  xPosition: number
  yPosition: number
  avatarSize: number
  avatarSpace: number
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    members.forEach((member, index) => {
      // defensive coding
      if (!member) return

      const xAvatarDraw = xPosition

      // adjust the y position according to the index of this member
      // since there can be many
      const yAvatarDraw =
        yPosition +
        (index + 1) * avatarSize - // unit
        index * (avatarSpace + 6) // spacer

      // make the status circle (stroke) color dynamic
      // const strokeColor = SELF_ASSIGNED_STATUS_COLORS[member.status]
      drawAvatar({
        ctx,
        member,
        width: avatarSize,
        height: avatarSize,
        xPosition: xAvatarDraw,
        yPosition: yAvatarDraw,
        textColor: '#FFFFFF',
        strokeColor: '#FFFFFF',
      })
    })
  })

export default drawPeopleActive
