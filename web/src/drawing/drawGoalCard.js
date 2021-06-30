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
  fontSizeLargeInt,
  fontSizeExtraLargeInt,
  lineSpacing,
  getGoalHeight,
  getLinesForParagraphs,
  firstZoomThreshold,
  secondZoomThreshold,
  lineSpacingExtraLarge,
  lineSpacingLarge,
} from './dimensions'

import { selectedColor, colors, pickColorForString } from '../styles'
import { getOrSetImageForUrl } from './imageCache'
import moment from 'moment'

import drawRoundCornerRectangle from './drawRoundCornerRectangle'

// render a goal card
export default function render(
  scale,
  goal,
  members,
  coordinates,
  isEditing,
  editText,
  isSelected,
  isHovered,
  ctx,
  isBeingEdited = true
) {
  let x, y
  if (coordinates) {
    x = coordinates.x
    y = coordinates.y
  } else {
    // do not render if we don't have coordinates
    // this can happen if we've just became aware of the goal
    // and the layout has not been re-calculated using layoutFormula
    return
  }

  // use the editText for measuring,
  // even though it's not getting drawn on the canvas
  const text = isEditing ? editText : goal.content

  const goalHeight = getGoalHeight(ctx, text, scale, isEditing)

  // set up border color
  let borderColor = colors[goal.status]

  let backgroundColor = '#FFFFFF'
  if (isHovered) {
    backgroundColor = '#f2f1ef'
  }
  else if (isBeingEdited) {
    backgroundColor = '#EAEAEA'
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
    boxShadow: true,
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
    boxShadow: false,
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
      boxShadow: false,
    })
  }
  /*
  TITLE
  */
  // render text, if not in edit mode
  // in which case the text is being rendered in the textarea
  // html element being overlaid on top of this Goal
  if (!isEditing) {
    const textBoxLeft = x + textBoxMarginLeft
    const textBoxTop = y + textBoxMarginTop
    const lines = getLinesForParagraphs(ctx, text, scale)
    // for space reasons
    // we limit the number of visible lines of the Goal Title to 2 or 3, 
    // and provide an ellipsis if there are more lines than that
    let lineLimit = 3
    // for extra large text, reduce to only two lines
    if (scale < secondZoomThreshold) {
      lineLimit = 2
    }
    let lineSpacingToUse = lineSpacing // the default
    let fontSizeToUse = fontSizeInt
    if (scale < secondZoomThreshold) {
      lineSpacingToUse = lineSpacingExtraLarge
      fontSizeToUse = fontSizeExtraLargeInt
    } else if (scale < firstZoomThreshold) {
      lineSpacingToUse = lineSpacingLarge
      fontSizeToUse = fontSizeLargeInt
    }
    let titleTextColor = '#4D4D4D'
    if (isBeingEdited) {
      titleTextColor = '#888888'
    }
    ctx.fillStyle = titleTextColor
    lines.slice(0, lineLimit).forEach((line, index) => {
      let linePosition = index * (fontSizeToUse + lineSpacingToUse)
      let lineText = line
      // if we're on the last line and there's more than the visible number of lines
      if (lines.length > lineLimit && index === lineLimit - 1) {
        // then replace the last characters with an ellipsis
        // to indicate that there's more that's hidden
        lineText = `${line.slice(0, line.length - 3)}...`
      }
      ctx.fillText(lineText, textBoxLeft, textBoxTop + linePosition)
    })
  }

  const goalMetaPadding = 12
  /*
  TIMEFRAME
  */
  if (goal.time_frame) {
    const calendarWidth = 12,
      calendarHeight = 12
    const img = getOrSetImageForUrl('', calendarWidth, calendarHeight)
    // wait for the image to load before
    // trying to draw
    if (!img) return
    // image will draw, so calculate where to put it
    // and the text
    const xImgDraw = x + goalMetaPadding + 4
    const yImgDraw = y + goalHeight - calendarHeight - goalMetaPadding - 6
    const textBoxLeft = xImgDraw + textBoxMarginLeft - 12
    const textBoxTop = yImgDraw + textBoxMarginTop / 4 - 6
    let timeframeTextColor = '#898989'
    if (isBeingEdited) {
      timeframeTextColor = '#888888'
    }
    let text = goal.time_frame.from_date
      ? String(moment.unix(goal.time_frame.from_date).format('MMM D, YYYY - '))
      : ''
    text += goal.time_frame.to_date
      ? String(moment.unix(goal.time_frame.to_date).format('MMM D, YYYY'))
      : ''
    ctx.drawImage(img, xImgDraw, yImgDraw, calendarWidth, calendarHeight)
    ctx.save()
    ctx.fillStyle = timeframeTextColor
    ctx.font = '13px hk-grotesk-semibold'
    ctx.fillText(text, textBoxLeft, textBoxTop)
    ctx.restore()
  }
  /*
  MEMBERS
  */
  // draw members avatars
  members.forEach((member, index) => {
    // defensive coding
    if (!member) return
    // adjust the x position according to the index of this member
    // since there can be many
    const xAvatarDraw =
      x +
      goalWidth -
      goalMetaPadding -
      (index + 1) * avatarWidth -
      index * avatarSpace
    const yAvatarDraw = y + goalHeight - goalMetaPadding - avatarHeight

    // first of all, render the initials
    // if there's no image set
    if (!member.avatar_url) {
      const backgroundInitialsAvatar = pickColorForString(member.first_name)
      const initials = `${member.first_name[0].toUpperCase()}${member.last_name[0].toUpperCase()}`
      // the background for the initial avatar:
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
      // to be consistent with Avatar component
      // if avatar belongs to an imported project and not connected an active memeber
      if (member.is_imported) {
        // set an opacity
        ctx.globalAlpha = 0.5
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      // the text for the initials avatar:
      ctx.save()
      // to be consistent with Avatar component
      // if avatar belongs to an imported project and not connected an active memeber
      if (member.is_imported) {
        // set an opacity
        ctx.globalAlpha = 0.5
      }
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
    let imgHeightToDraw = avatarHeight,
      imgWidthToDraw = avatarWidth
    let imgXToDraw = xAvatarDraw,
      imgYToDraw = yAvatarDraw
    // make sure avatar image doesn't stretch on canvas
    // if image width is more that image height (landscape)
    if (img.width / img.height > 1) {
      imgHeightToDraw = avatarHeight
      imgWidthToDraw = (img.width / img.height) * avatarWidth
      // move to the left by the amount that would center the image
      imgXToDraw = xAvatarDraw - (imgWidthToDraw - avatarWidth) / 2
    }
    // if image height is more that image width (portrait)
    else if (img.width / img.height < 1) {
      imgWidthToDraw = avatarWidth
      imgHeightToDraw = (img.height / img.width) * avatarHeight
      // move upwards by the amount that would center the image
      imgYToDraw = yAvatarDraw - (imgHeightToDraw - avatarHeight) / 2
    }

    // to be consistent with Avatar component
    // if avatar belongs to an imported project and not connected an active memeber
    if (member.is_imported) {
      // set an opacity
      ctx.globalAlpha = 0.5
    }

    ctx.drawImage(img, imgXToDraw, imgYToDraw, imgWidthToDraw, imgHeightToDraw)

    ctx.beginPath()
    ctx.arc(xAvatarDraw, yAvatarDraw, avatarRadius, 0, Math.PI * 2, true)
    ctx.clip()
    ctx.closePath()
    ctx.restore()
  })

  /*
  BEING EDITED INDICATOR 
  */
  if (isBeingEdited) {
    drawRoundCornerRectangle({
      context: ctx,
      width: 140,
      height: 25,
      color: '#717171',
      boxShadow: false,
      xPosition: x + goalWidth / 2 - 70,
      yPosition: y + goalHeight - 12.5,
      radius: 6,
    })
  }
  if (isBeingEdited) {
    let isBeingEditedText = 'Being edited by Eric'
    ctx.fillStyle = '#fff'
    ctx.font = '14px hk-grotesk-bold'
    ctx.fillText(isBeingEditedText, x + goalWidth / 2 - 60, y + goalHeight - 8)
  }
}
