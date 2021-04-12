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

import drawRoundCornerRectangle from './drawRoundCornerRectangle'

// render a goal card
export default function render(
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
  // card background
  drawRoundCornerRectangle({
    context: ctx,
    xPosition: x + borderWidth,
    yPosition: y + borderWidth,
    width: goalWidth - twiceBorder,
    height: goalHeight - twiceBorder,
    radius: cornerRadius - 1,
    color: backgroundColor,
    stroke: false,
    strokeWidth: '0',
    boxShadow: true
  })
  // card border
  drawRoundCornerRectangle({
    context: ctx,
    xPosition: x + halfBorder,
    yPosition: y + halfBorder,
    width: goalWidth - borderWidth,
    height: goalHeight - borderWidth,
    radius: cornerRadius,
    color: borderColor,
    stroke: true,
    strokeWidth: '3',
    boxShadow: false
  })

  // selection outline (purple)
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

    drawRoundCornerRectangle({
      context: ctx,
      xPosition: xStart,
      yPosition: yStart,
      width: w,
      height: h,
      radius: cr,
      color: selectedColor,
      stroke: true,
      strokeWidth: selectedOutlineWidth,
      boxShadow: false
    })
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

  const goalMetaPadding = 8

  if (goal.time_frame) {
    const calendarWidth = 12,
      calendarHeight = 12
    const img = getOrSetImageForUrl(
      '',
      calendarWidth,
      calendarHeight
    )
    // wait for the image to load before
    // trying to draw
    if (!img) return
    // image will draw, so calculate where to put it
    // and the text
    const xImgDraw = x + goalMetaPadding + 4
    const yImgDraw = y + goalHeight - calendarHeight - goalMetaPadding - 6
    const textBoxLeft = xImgDraw + textBoxMarginLeft - 12
    const textBoxTop = yImgDraw + textBoxMarginTop / 4 - 8
    let text = goal.time_frame.from_date
      ? String(moment.unix(goal.time_frame.from_date).format('MMM D, YYYY - '))
      : ''
    text += goal.time_frame.to_date
      ? String(moment.unix(goal.time_frame.to_date).format('MMM D, YYYY'))
      : ''
    ctx.drawImage(img, xImgDraw, yImgDraw, calendarWidth, calendarHeight)
    ctx.save()
    ctx.fillStyle = '#898989'
    ctx.font = '13px hk-grotesk-semibold'
    ctx.fillText(text, textBoxLeft, textBoxTop)
    ctx.restore()
  }

  // draw members avatars
  members.forEach((member, index) => {
    // adjust the x position according to the index of this member
    // since there can be many
    const xAvatarDraw =
      x + goalWidth - goalMetaPadding - (index + 1) * (avatarWidth) - (index * avatarSpace)
    const yAvatarDraw = y + goalHeight - goalMetaPadding - avatarHeight

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
      ctx.font = '11px hk-grotesk-bold'
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
    let imgHeightToDraw = avatarHeight, imgWidthToDraw = avatarWidth
    let imgXToDraw = xAvatarDraw, imgYToDraw = yAvatarDraw
    // make sure avatar image doesn't stretch on canvas
    // if image width is more that image height (landscape)
    if (img.width / img.height > 1) {
      imgHeightToDraw = avatarHeight
      imgWidthToDraw = img.width / img.height * avatarWidth
      // move to the left by the amount that would center the image
      imgXToDraw = xAvatarDraw - (imgWidthToDraw - avatarWidth) / 2
    }
    // if image height is more that image width (portrait)
    else if (img.width / img.height < 1) {
      imgWidthToDraw = avatarWidth
      imgHeightToDraw = img.height / img.width * avatarHeight
      // move upwards by the amount that would center the image
      imgYToDraw = yAvatarDraw - (imgHeightToDraw - avatarHeight) / 2
    }

    ctx.drawImage(img, imgXToDraw, imgYToDraw, imgWidthToDraw, imgHeightToDraw)

    ctx.beginPath()
    ctx.arc(xAvatarDraw, yAvatarDraw, avatarRadius, 0, Math.PI * 2, true)
    ctx.clip()
    ctx.closePath()
    ctx.restore()
  })
}
