import { pickColorForString } from '../../styles'
import { Profile } from '../../types'
import draw from '../draw'
import { getOrSetImageForUrl } from '../imageCache'

const drawAvatar = ({
  member,
  xPosition,
  yPosition,
  width,
  height,
  textColor,
  strokeColor,
  ctx,
}: {
  member: Profile
  xPosition: number
  yPosition: number
  width: number
  height: number
  textColor: string
  strokeColor: string
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    const avatarRadius = height / 2

    if (!member.avatarUrl) {
      /*
        Initials Avatar
      */

      const backgroundInitialsAvatarColor = pickColorForString(member.firstName)
      const initials =
        member.firstName && member.lastName
          ? `${member.firstName[0]?.toUpperCase()}${member.lastName[0]?.toUpperCase()}`
          : ''
      // the background for the initial avatar:
      draw(ctx, () => {
        ctx.fillStyle = backgroundInitialsAvatarColor
        ctx.beginPath()
        ctx.arc(
          xPosition + width / 2, // x
          yPosition + height / 2, // y
          avatarRadius, // radius (rounded)
          0,
          Math.PI * 2,
          true
        )
        // to be consistent with Avatar component
        // if avatar belongs to an imported project and not connected an active memeber
        if (member.isImported) {
          // set an opacity
          ctx.globalAlpha = 0.3
        }
        ctx.closePath()
        ctx.fill()
      })
      // the text for the initials avatar
      draw(ctx, () => {
        // to be consistent with Avatar component
        // if avatar belongs to an imported project and not connected an active memeber
        if (member.isImported) {
          // set an opacity
          ctx.globalAlpha = 0.5
        }
        ctx.fillStyle = textColor
        ctx.font = '12px PlusJakartaSans-extrabold'
        ctx.fillText(initials, xPosition + 6, yPosition + 18)
      })
    } else {
      /*
        when there is a image avatar
      */
      const img = getOrSetImageForUrl(member.avatarUrl, width, height)
      // assume that it will be drawn the next time 'render' is called
      // if it isn't already set
      if (!img) return
      // help from https://stackoverflow.com/questions/4276048/html5-canvas-fill-circle-with-image
      draw(ctx, () => {
        ctx.beginPath()
        ctx.arc(
          xPosition + width / 2, // x
          yPosition + height / 2, // y
          avatarRadius, // radius (rounded)
          0,
          Math.PI * 2,
          true
        )
        ctx.closePath()
        ctx.clip()
        // url, x coordinate, y coordinate, width, height
        let imgHeightToDraw = height,
          imgWidthToDraw = width
        let imgXToDraw = xPosition,
          imgYToDraw = yPosition
        // make sure avatar image doesn't stretch on canvas
        // if image width is more that image height (landscape)
        if (img.width / img.height > 1) {
          imgHeightToDraw = height
          imgWidthToDraw = (img.width / img.height) * width
          // move to the left by the amount that would center the image
          imgXToDraw = xPosition - (imgWidthToDraw - width) / 2
        }
        // if image height is more that image width (portrait)
        else if (img.width / img.height < 1) {
          imgWidthToDraw = width
          imgHeightToDraw = (img.height / img.width) * height
          // move upwards by the amount that would center the image
          imgYToDraw = yPosition - (imgHeightToDraw - height) / 2
        }
        // to be consistent with Avatar component
        // if avatar belongs to an imported project and not connected an active memeber
        if (member.isImported) {
          // set an opacity
          ctx.globalAlpha = 0.5
        }
        ctx.drawImage(
          img,
          imgXToDraw,
          imgYToDraw,
          imgWidthToDraw,
          imgHeightToDraw
        )
        ctx.beginPath()
        ctx.arc(xPosition, yPosition, avatarRadius, 0, Math.PI * 2, true)
        ctx.clip()
        ctx.closePath()
      })
    }

    // circle around the avatar image
    draw(ctx, () => {
      ctx.beginPath()
      ctx.arc(
        xPosition + avatarRadius,
        yPosition + avatarRadius,
        avatarRadius,
        0,
        Math.PI * 2,
        true
      )
      ctx.fillStyle = 'transparent'
      ctx.fill()
      ctx.lineWidth = 3
      ctx.strokeStyle = strokeColor ? strokeColor : '#fff'
      ctx.stroke()
    })
  })

export default drawAvatar
