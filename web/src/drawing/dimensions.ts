import { ComputedOutcome, ComputedScope, Tag } from '../types'
import { WithActionHash } from '../types/shared'
import {
  argsForDrawProgressBar,
  argsForDrawTags,
  argsForDrawTimeAndAssignees,
} from './drawOutcome/computeArguments'
import drawProgressBar from './drawOutcome/drawProgressBar'
import drawTags from './drawOutcome/drawTags'
import drawTimeAndAssignees from './drawOutcome/drawTimeAndAssignees'

export const outcomeMetaPadding = 12

export const CONNECTOR_VERTICAL_SPACING = 20

// DELETE THESE
export const avatarSpace = -4
export const avatarWidth = 26
export const avatarHeight = 26
export const avatarRadius = 13

export const outcomeWidth = 400
export const outcomeHeight = 228
export const cornerRadius = 16 // for outcome, main card
export const cornerRadiusBorder = 20 // for the border
export const borderWidth = 7
export const dashedBorderWidth = 5

export const outcomePaddingHorizontal = 40
// affects not only the top and bottom padding,
// but also the space in between items in the vertical layout
export const OUTCOME_VERTICAL_SPACE_BETWEEN = 32

export const selectedOutlineMargin = 4
export const selectedOutlineWidth = 3

// these two values need to match with each other
// as the system is dumb about the font height
export const DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT = 16
export const DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM = 1
export const DESCENDANTS_ACHIEVEMENT_STATUS_FONT_FAMILY =
  'PlusJakartaSans-medium'

export const TAGS_SPACE_BETWEEN = 10
export const TAGS_TAG_CORNER_RADIUS = 6
export const TAGS_TAG_HORIZONTAL_PADDING = 8.5
export const TAGS_TAG_VERTICAL_PADDING = 5
export const TAGS_TAG_FONT_SIZE_REM = 0.75
export const TAGS_TAG_FONT_FAMILY = 'PlusJakartaSans-bold'

export const AVATAR_SPACE = -4
export const AVATAR_SIZE = 26
export const TIME_FONT_SIZE_REM = 0.875
export const TIME_FONT_FAMILY = 'PlusJakartaSans-bold'

export const PROGRESS_BAR_HEIGHT = 10

export const firstZoomThreshold = 0.6
export const secondZoomThreshold = 0.4

export const lineHeightMultiplier = 1.2
// this is the regular font size, for
// a regular level of zoom
// and this is for the Outcome Titles
// on the canvas
// these two values fontSize and fontSizeInt should match
export const fontSize = '20px'
export const fontSizeInt = 20
export const lineSpacing = 6
export const letterSpacing = 0.1

// this is the "zoomed out" font size
// for creating still readable text
export const fontSizeLarge = '30px'
export const fontSizeLargeInt = 30
export const lineSpacingLarge = 2

// this is the "extra zoomed out" font size
// for creating still readable text
export const fontSizeExtraLarge = '40px'
export const fontSizeExtraLargeInt = 40
export const lineSpacingExtraLarge = 2

export const fontFamily = 'PlusJakartaSans-bold'

// line wrapping code from https://stackoverflow.com/questions/2936112/
function getLines({
  ctx,
  statement,
  maxWidth,
}: {
  ctx: CanvasRenderingContext2D
  statement: string
  maxWidth: number
}) {
  const words = statement.split(' ')
  let lines = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    let word = words[i]
    let width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}

export function getLinesForParagraphs({
  ctx,
  statement,
  zoomLevel,
  maxWidth,
}: {
  ctx: CanvasRenderingContext2D
  statement: string
  zoomLevel: number
  maxWidth: number
}) {
  // for space reasons
  // we limit the number of visible lines of the Outcome statement to 2 or 3,
  // and provide an ellipsis if there are more lines than that
  let lineLimit = 4
  // for extra large text, reduce to only two lines
  if (zoomLevel < secondZoomThreshold) {
    lineLimit = 3
  }

  // set so that measurements are proper
  // adjust font size based on zoom level
  if (zoomLevel >= firstZoomThreshold) {
    ctx.font = fontSize + ' ' + fontFamily
  } else if (
    zoomLevel > secondZoomThreshold &&
    zoomLevel < firstZoomThreshold
  ) {
    ctx.font = fontSizeLarge + ' ' + fontFamily
  } else {
    ctx.font = fontSizeExtraLarge + ' ' + fontFamily
  }
  ctx.textBaseline = 'top'

  const lines = statement
    .split('\n')
    .map((para) => getLines({ ctx, statement: para, maxWidth }))
    .reduce((a, b) => a.concat(b))

  // limited line counts
  // replace overflow of last line with an ellipsis
  const linesToRender = lines.slice(0, lineLimit)
  if (lines.length > lineLimit) {
    const line = linesToRender[linesToRender.length - 1]
    linesToRender[linesToRender.length - 1] = `${line.slice(
      0,
      line.length - 3
    )}...`
  }
  return linesToRender
}

export function getOutcomeHeight({
  ctx,
  outcome,
  projectTags,
  zoomLevel,
  width,
}: {
  ctx?: CanvasRenderingContext2D
  outcome: ComputedOutcome
  projectTags: WithActionHash<Tag>[]
  zoomLevel: number
  width: number
}) {
  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  // get lines after font and font size are set up, since ctx.measureText()
  // takes font and font size into account
  const lines = getLinesForParagraphs({
    ctx,
    statement: outcome.content,
    zoomLevel,
    maxWidth: width - 2 * outcomePaddingHorizontal,
  })

  // adjust font size based on scale (zoom factor)
  let fontSizeToUse = fontSizeInt // default
  if (zoomLevel < secondZoomThreshold) {
    fontSizeToUse = fontSizeExtraLargeInt
  } else if (zoomLevel < firstZoomThreshold) {
    fontSizeToUse = fontSizeLargeInt
  }
  const outcomeStatementHeight =
    lines.length * (fontSizeToUse * lineHeightMultiplier)

  const outcomeTagsHeight = drawTags(
    argsForDrawTags({
      onlyMeasure: true,
      outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      outcomeWidth: width,
      heightOfStatement: outcomeStatementHeight,
      projectTags,
      ctx,
    })
  )
  const outcomeTimeAndAssigneesHeight = drawTimeAndAssignees(
    argsForDrawTimeAndAssignees({
      onlyMeasure: true, // we don't want it actually drawn on the canvas
      outcome: outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      outcomeWidth: width,
      outcomeStatementHeight,
      outcomeTagsHeight: 0,
      ctx,
    })
  )
  // if its not a Big, we don't render a progress bar
  const progress =
    outcome.computedScope === ComputedScope.Big
      ? (outcome.computedAchievementStatus.smallsAchieved /
          outcome.computedAchievementStatus.smallsTotal) *
        100
      : 0
  const progressBarHeight =
    progress === 0 || progress === 100 ? 0 : PROGRESS_BAR_HEIGHT
  // calculate the outcomeHeight
  // from the top and bottom margins + the height
  // of the lines of text
  const verticalSpacing =
    OUTCOME_VERTICAL_SPACE_BETWEEN * 3 +
    // if tags existed, then we need another spacer
    (outcomeTagsHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN : 0) +
    // if time or assignees existed, then we need another spacer
    (outcomeTimeAndAssigneesHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN : 0) +
    // if progress bar existed, then we need another spacer
    (progressBarHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN : 0)

  const detectedOutcomeHeight =
    DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT +
    outcomeStatementHeight +
    outcomeTagsHeight +
    outcomeTimeAndAssigneesHeight +
    verticalSpacing

  // create a minimum height equal to the outcomeHeight
  return Math.max(detectedOutcomeHeight, outcomeHeight)
}
