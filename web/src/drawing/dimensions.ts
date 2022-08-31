import { ComputedOutcome, ComputedScope, Tag } from '../types'
import { WithActionHash } from '../types/shared'
import {
  argsForDrawProgressBar,
  argsForDrawStatement,
  argsForDrawTags,
  argsForDrawTimeAndAssignees,
} from './drawOutcome/computeArguments'
import drawProgressBar from './drawOutcome/drawProgressBar'
import drawStatement from './drawOutcome/drawStatement'
import drawTags from './drawOutcome/drawTags'
import drawTimeAndAssignees from './drawOutcome/drawTimeAndAssignees'

export const outcomeMetaPadding = 12

export const CONNECTOR_VERTICAL_SPACING = 20

export const OUTCOME_VERTICAL_HOVER_ALLOWANCE = 60

// outcome width = outcome statement width + ( 2 * width padding)
export const outcomeWidth = 520 // 520 = 392 + ( 2 * 64 )
export const outcomePaddingHorizontal = 64

export const outcomeHeight = 250
export const cornerRadius = 18 // for outcome, main card background color
export const cornerRadiusBorder = 18 // for the border
export const borderWidth = 8
export const dashedBorderWidth = 5

export const outcomeStatementMinHeightWithoutMeta = 130
// affects not only the top and bottom padding,
// but also the space in between items in the vertical layout
export const OUTCOME_VERTICAL_SPACE_BETWEEN = 32

export const selectedOutlineMargin = 4
export const selectedOutlineWidth = 3

// DESCENDANTS ACHIVEMENT STATUS
// these two values need to match with each other
// as the system is dumb about the font height
export const DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT = 16
export const DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM = 1
export const DESCENDANTS_ACHIEVEMENT_STATUS_FONT_FAMILY =
  'PlusJakartaSans-semibold'

// TAGS
export const TAGS_SPACE_BETWEEN = 6
export const TAGS_TAG_CORNER_RADIUS = 6
export const TAGS_TAG_HORIZONTAL_PADDING = 8.5
export const TAGS_TAG_VERTICAL_PADDING = 5
export const TAGS_TAG_FONT_SIZE_REM = 0.75
export const TAGS_TAG_FONT_FAMILY = 'PlusJakartaSans-bold'

// ASSIGNEES (AVATARS)
export const AVATAR_SPACE = -4
export const AVATAR_SIZE = 28
export const AVATAR_FONT_SIZE_REM = 1
export const AVATAR_FONT_FAMILY = 'PlusJakartaSans-bold'


// TIME
export const TIME_FONT_SIZE_REM = 0.875
export const TIME_FONT_FAMILY = 'PlusJakartaSans-bold'

// PROGRESS BAR
export const PROGRESS_BAR_HEIGHT = 10

export const firstZoomThreshold = 0.6
export const secondZoomThreshold = 0.4

// OUTCOME STATEMENT
export const fontFamily = 'PlusJakartaSans-bold'
export const lineHeightMultiplier = 1.2
// this is the regular font size, for
// a regular level of zoom
// and this is for the Outcome Titles
// on the canvas
// these two values fontSize and fontSizeInt should match
export const fontSize = '24px'
export const fontSizeInt = 24
export const lineSpacing = 10
export const letterSpacing = 0.1

// this is the "zoomed out" font size
// for creating still readable text
export const fontSizeLarge = '30px'
export const fontSizeLargeInt = 30
export const lineSpacingLarge = 6

// this is the "extra zoomed out" font size
// for creating still readable text
export const fontSizeExtraLarge = '40px'
export const fontSizeExtraLargeInt = 40
export const lineSpacingExtraLarge = 4

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
  useLineLimit = true,
}: {
  ctx: CanvasRenderingContext2D
  statement: string
  zoomLevel: number
  maxWidth: number
  useLineLimit: boolean
}) {
  // for space reasons
  // we limit the number of visible lines of the Outcome statement to 4 or 3,
  // and provide an ellipsis if there are more lines than that
  let lineLimit: number
  if (useLineLimit) {
    // for extra large text, reduce to only 3 lines
    if (zoomLevel < secondZoomThreshold) {
      lineLimit = 3
    } else {
      lineLimit = 4
    }
  } else {
    lineLimit = Infinity
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
  const linesToRender =
    lineLimit === Infinity ? lines : lines.slice(0, lineLimit)
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
  useLineLimit = true,
}: {
  ctx?: CanvasRenderingContext2D
  outcome: ComputedOutcome
  projectTags: WithActionHash<Tag>[]
  zoomLevel: number
  width: number
  useLineLimit?: boolean
}) {
  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  const outcomeStatementHeight = drawStatement(
    argsForDrawStatement({
      onlyMeasure: true, // we don't want it actually drawn on the canvas
      outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      outcomeWidth,
      zoomLevel,
      ctx,
    })
  )

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
    // if progress bar existed, but no assignee, then we need another spacer
    (outcomeTimeAndAssigneesHeight > 0 && progressBarHeight == 0
      ? 12
      : 0) +
    // if progress bar existed, then we need another spacer
    (progressBarHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN + 12 : 0)

  const detectedOutcomeHeight =
    DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT +
    outcomeStatementHeight +
    outcomeTagsHeight +
    outcomeTimeAndAssigneesHeight +
    verticalSpacing
  console.log(
    'DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT',
    DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT
  )
  console.log('outcomeStatementHeight', outcomeStatementHeight)
  console.log('outcomeTagsHeight', outcomeTagsHeight)
  console.log('outcomeTimeAndAssigneesHeight', outcomeTimeAndAssigneesHeight)
  console.log('verticalSpacing', verticalSpacing)

  return detectedOutcomeHeight
  // create a minimum height equal to the outcomeHeight
  // return Math.max(detectedOutcomeHeight, outcomeHeight)
}
