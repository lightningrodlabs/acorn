import moment from 'moment'
import { Profile } from '../../types'
import draw from '../draw'
import drawAvatar from './drawAvatar'

/*
  Assignees
*/

const drawAssignees = ({
  onlyMeasure,
  members,
  xRightPosition,
  yPosition,
  avatarInitialsTextColor,
  avatarStrokeColor,
  avatarSize,
  avatarSpace,
  avatarFontFamily,
  avatarFontSizeRem,
  ctx,
  assigneesPlaceholder,
  placeholderWidth,
  placeholderColor,
}: {
  onlyMeasure: boolean
  members: Profile[]
  xRightPosition: number
  yPosition: number
  avatarInitialsTextColor: string
  avatarStrokeColor: string
  avatarSize: number
  avatarSpace: number
  avatarFontSizeRem: number
  avatarFontFamily: string
  assigneesPlaceholder: boolean
  placeholderWidth: number
  placeholderColor: string
  ctx: CanvasRenderingContext2D
}) => {
  if (members.length === 0) {
    return 0 // height
  }

  // don't draw in cases where we're just trying to determine
  // what the height of this will be
  if (!assigneesPlaceholder && !onlyMeasure) {
    draw(ctx, () => {
      // draw members avatars
      members.forEach((member, index) => {
        // defensive coding
        if (!member) return

        // adjust the x position according to the index of this member
        // since there can be many
        const xPosition =
          xRightPosition - (index + 1) * avatarSize - index * avatarSpace

        // TODO: pass these values IN to drawAvatar
        // ctx.font = `${avatarFontSizeRem}rem ${avatarFontFamily}`
        drawAvatar({
          width: avatarSize,
          height: avatarSize,
          member,
          ctx,
          xPosition,
          yPosition,
          textColor: avatarInitialsTextColor,
          strokeColor: avatarStrokeColor,
        })
      })
    })
  } else if (assigneesPlaceholder && !onlyMeasure) {
    ctx.fillStyle = placeholderColor
    ctx.fillRect(
      xRightPosition - placeholderWidth,
      yPosition,
      placeholderWidth,
      avatarSize
    )
  }
  return avatarSize
}

/*
  Time
*/

const drawTime = ({
  onlyMeasure,
  xPosition,
  yPosition,
  timeEstimate,
  fromDate,
  toDate,
  color,
  fontSizeRem,
  fontFamily,
  timePlaceholder,
  placeholderColor,
  ctx,
}: {
  onlyMeasure: boolean
  xPosition: number
  yPosition: number
  timeEstimate?: number
  fromDate?: number // f64
  toDate: number // f64
  color: string
  fontSizeRem: number
  fontFamily: string
  timePlaceholder: boolean
  placeholderColor: string
  ctx: CanvasRenderingContext2D
}) => {
  let height: number = 0
  if (toDate) {
    draw(ctx, () => {
      // const img = getOrSetImageForUrl('', CALENDAR_WIDTH, CALENDAR_HEIGHT)
      // wait for the image to load before
      // trying to draw
      // if (!img) return
      // image will draw, so calculate where to put it
      // and the text
      // TODO: de-hardcode these values
      let text = fromDate
        ? String(moment.unix(fromDate).format('MMM D, YYYY - '))
        : ''
      text += toDate ? String(moment.unix(toDate).format('MMM D, YYYY')) : ''
      // ctx.drawImage(img, xPosition, yPosition, CALENDAR_WIDTH, CALENDAR_HEIGHT)
      ctx.fillStyle = color
      ctx.font = `${fontSizeRem}rem ${fontFamily}`
      ctx.textBaseline = 'top'

      let measurements = ctx.measureText(
        'the text doesnt matter here to measure height'
      )
      // help from https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
      height =
        measurements.actualBoundingBoxAscent +
        measurements.actualBoundingBoxDescent

      // margin top for date line to center
      // with avatars list
      const drawAtY = yPosition + 6
      // don't draw in cases where we're just trying to determine
      // what the height of this will be
      if (!timePlaceholder && !onlyMeasure) {
        ctx.fillText(text, xPosition, drawAtY)
      } else if (timePlaceholder && !onlyMeasure) {
        ctx.fillStyle = placeholderColor
        ctx.fillRect(xPosition, drawAtY, 100, 12)
      }
    })
  }
  return height
}

/*
  Time and Assignees, rendered
  in a row with each other
*/

const drawTimeAndAssignees = ({
  onlyMeasure,
  skipRender,
  // assignees
  members,
  assigneesXRightPosition,
  yPosition,
  avatarSize,
  avatarSpace,
  avatarInitialsTextColor,
  avatarStrokeColor,
  avatarFontSizeRem,
  avatarFontFamily,
  // time
  timeXLeftPosition,
  timeEstimate,
  fromDate,
  toDate,
  timeTextColor,
  timeFontSizeRem,
  timeFontFamily,
  timeAndAssigneesPlaceholder,
  timeAndAssigneesPlaceholderColor,
  maxWidth,
  ctx,
}: {
  onlyMeasure: boolean
  skipRender: boolean
  // assignees
  members: Profile[]
  assigneesXRightPosition: number
  yPosition: number
  avatarSize: number
  avatarSpace: number
  avatarInitialsTextColor: string
  avatarStrokeColor: string
  avatarFontSizeRem: number
  avatarFontFamily: string
  // time
  timeXLeftPosition: number
  timeEstimate?: number
  fromDate?: number // f64 date value
  toDate: number // f64 date value
  timeTextColor: string
  timeFontSizeRem: number
  timeFontFamily: string
  timeAndAssigneesPlaceholder: boolean
  timeAndAssigneesPlaceholderColor: string
  maxWidth: number
  ctx: CanvasRenderingContext2D
}): number => {
  // early exit with no rendering, in the case of skipRender
  if (skipRender) return 0

  let assigneesHeight: number = 0
  let timeHeight: number = 0
  draw(ctx, () => {
    assigneesHeight = drawAssignees({
      onlyMeasure,
      ctx,
      members,
      xRightPosition: assigneesXRightPosition,
      yPosition,
      avatarSize,
      avatarSpace,
      avatarFontSizeRem,
      avatarFontFamily,
      avatarInitialsTextColor,
      avatarStrokeColor,
      assigneesPlaceholder: timeAndAssigneesPlaceholder,
      placeholderWidth: maxWidth / 4,
      placeholderColor: timeAndAssigneesPlaceholderColor,
    })
    timeHeight = drawTime({
      onlyMeasure,
      ctx,
      xPosition: timeXLeftPosition,
      yPosition,
      fromDate,
      toDate,
      fontFamily: timeFontFamily,
      fontSizeRem: timeFontSizeRem,
      color: timeTextColor,
      timePlaceholder: timeAndAssigneesPlaceholder,
      placeholderColor: timeAndAssigneesPlaceholderColor,
    })
  })
  // take whichever height is greater
  return Math.max(assigneesHeight, timeHeight)
}
export default drawTimeAndAssignees
