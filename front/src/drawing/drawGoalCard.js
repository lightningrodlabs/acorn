import {
  avatarHeight,
  avatarWidth,
  avatarRadius,
  avatarSpace,
  goalWidth,
  cornerRadius,
  borderWidth,
  textBoxMarginLeft,
  textBoxMarginTop,
  fontSizeInt,
  lineSpacing,
  getGoalHeight,
  getLinesForParagraphs
} from './dimensions'

import { selectedColor, colors, pickColorForString } from '../styles'
import { getOrSetImageForUrl } from './imageCache'
import moment from 'moment'

import roundRect from './drawRoundRect'

// render a goal card
export default function render (
  goal,
  members,
  { x, y },
  isEditing,
  editText,
  isSelected,
  isHovered,
  ctx
) {
  // use the editText for measuring,
  // even though it's not getting drawn on the canvas
  const text = isEditing ? editText : goal.content
  const goalHeight = getGoalHeight(ctx, text)

  // set up border color
  let borderColor = colors[goal.status]

  let backgroundColor = '#FFFFFF'
  if (isHovered) {
    backgroundColor = '#f2f1ef'
  }

  const halfBorder = borderWidth / 2 // for use with 'stroke' of the border
  const twiceBorder = borderWidth * 2

  const selectedOutlineMargin = 1
  const selectedOutlineWidth = '4'

  // display leaf icon for small goal
  // const leafHierarchyIcon = iconForHierarchy(goal.hierarchy)
  if (goal.hierarchy === 'Leaf') {
    const leafImg = getOrSetImageForUrl(
      `img/leaf_${goal.status.toLowerCase()}.svg`,
      30,
      30
    )
    // url, x coordinate, y coordinate, width, height
    if (leafImg) {
      ctx.drawImage(leafImg, x - 24, y - 24, 30, 30)
    }
  }

  // background
  roundRect(
    ctx,
    x + borderWidth,
    y + borderWidth,
    goalWidth - twiceBorder,
    goalHeight - twiceBorder,
    cornerRadius - 1,
    backgroundColor,
    false
  )
  // card border
  roundRect(
    ctx,
    x + halfBorder,
    y + halfBorder,
    goalWidth - borderWidth,
    goalHeight - borderWidth,
    cornerRadius,
    borderColor,
    true,
    '3'
  )

  // selection outline
  if (isSelected) {
    let xStart =
      x - selectedOutlineMargin + 1 - halfBorder - selectedOutlineWidth / 2
    let yStart =
      y - selectedOutlineMargin + 1 - halfBorder - selectedOutlineWidth / 2
    let w =
      goalWidth +
      2 * (selectedOutlineMargin - 1) +
      borderWidth +
      Number(selectedOutlineWidth)
    let h =
      goalHeight +
      2 * (selectedOutlineMargin - 1) +
      borderWidth +
      Number(selectedOutlineWidth)
    let cr = cornerRadius + selectedOutlineMargin * 2 + 2
    roundRect(
      ctx,
      xStart,
      yStart,
      w,
      h,
      cr,
      selectedColor,
      true,
      selectedOutlineWidth
    )
  }

  // render text, if not in edit mode
  // in which case the text is being rendered in the textarea
  // html element being overlaid on top of this Goal
  if (!isEditing) {
    const textBoxLeft = x + textBoxMarginLeft
    const textBoxTop = y + textBoxMarginTop
    const lines = getLinesForParagraphs(ctx, text)
    lines.forEach((line, index) => {
      let linePosition = index * (fontSizeInt + lineSpacing)
      ctx.fillText(line, textBoxLeft, textBoxTop + linePosition)
    })
  }

  if (goal.time_frame) {
    const calendarWidth = 13,
      calendarHeight = 13
    const img = getOrSetImageForUrl(
      'img/calendar.svg',
      calendarWidth,
      calendarHeight
    )
    if (!img) return
    const xImgDraw = x + goalWidth / 2 - calendarWidth - 140
    const yImgDraw = y + goalHeight / 2 - calendarHeight + 46
    const textBoxLeft = xImgDraw + textBoxMarginLeft - 8
    const textBoxTop = yImgDraw + textBoxMarginTop / 4 - 6
    let text = goal.time_frame.from_date
      ? String(moment.unix(goal.time_frame.from_date).format('MMM D, YYYY - '))
      : ''
    text += goal.time_frame.to_date
      ? String(moment.unix(goal.time_frame.to_date).format('MMM D, YYYY'))
      : ''
    ctx.drawImage(img, xImgDraw, yImgDraw, calendarWidth, calendarHeight)
    ctx.save()
    ctx.fillStyle = '#898989'
    ctx.font = '13px hk-grotesk-medium'
    ctx.fillText(text, textBoxLeft, textBoxTop)
    ctx.restore()
  }

  // draw members avatars
  members.forEach((member, index) => {
    // adjust the x position according to the index of this member
    // since there can be many
    const xAvatarDraw =
      x + goalWidth - (index + 1) * (avatarWidth + avatarSpace)
    const yAvatarDraw = y + goalHeight - avatarHeight - avatarSpace

    // first of all, render the initials
    // if there's no image set
    if (!member.avatar_url) {
      const backgroundInitialsAvatar = pickColorForString(member.first_name)
      const initials = `${member.first_name[0].toUpperCase()}${member.last_name[0].toUpperCase()}`
      ctx.save()
      ctx.fillStyle = backgroundInitialsAvatar
      ctx.beginPath()
      ctx.arc(
        xAvatarDraw + avatarWidth / 2, // x
        yAvatarDraw + avatarHeight / 2, // y
        avatarRadius, // radius
        0,
        Math.PI * 2,
        true
      )
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      ctx.save()
      ctx.fillStyle = '#FFF'
      ctx.font = '11px hk-grotesk-medium'
      ctx.fillText(initials, xAvatarDraw + 5, yAvatarDraw + 7)
      ctx.restore()
      return
    }

    const img = getOrSetImageForUrl(
      member.avatar_url,
      avatarWidth,
      avatarHeight
    )
    // assume that it will be drawn the next time 'render' is called
    // if it isn't already set
    if (!img) return

    // help from https://stackoverflow.com/questions/4276048/html5-canvas-fill-circle-with-image
    ctx.save()
    ctx.beginPath()
    ctx.arc(
      xAvatarDraw + avatarWidth / 2, // x
      yAvatarDraw + avatarHeight / 2, // y
      avatarRadius, // radius
      0,
      Math.PI * 2,
      true
    )
    ctx.closePath()
    ctx.clip()

    // url, x coordinate, y coordinate, width, height
    ctx.drawImage(img, xAvatarDraw, yAvatarDraw, avatarWidth, avatarHeight)

    ctx.beginPath()
    ctx.arc(xAvatarDraw, yAvatarDraw, avatarRadius, 0, Math.PI * 2, true)
    ctx.clip()
    ctx.closePath()
    ctx.restore()
  })
}
