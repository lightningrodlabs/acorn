import { computeProgress } from '../redux/persistent/projects/outcomes/computedState'
import { ComputedOutcome, Tag } from '../types'
import { WithActionHash } from '../types/shared'
import {
  argsForDrawStatement,
  argsForDrawTags,
  argsForDrawTimeAndAssignees,
} from './drawOutcome/computeArguments'
import drawStatement from './drawOutcome/drawStatement'
import drawTags from './drawOutcome/drawTags'
import drawTimeAndAssignees from './drawOutcome/drawTimeAndAssignees'

export const outcomeMetaPadding = 12

export const CONNECTOR_VERTICAL_SPACING = 20

export const OUTCOME_VERTICAL_HOVER_ALLOWANCE = 60

export const outcomePaddingHorizontal = 64

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
export const lineHeightMultiplier = 1.4
// this is the regular font size, for
// a regular level of zoom
// and this is for the Outcome Titles
// on the canvas
// these two values fontSize and fontSizeInt should match
export const fontSize = '24px'
export const fontSizeInt = 24
export const lineSpacing = fontSizeInt * lineHeightMultiplier - fontSizeInt
export const letterSpacing = 0.1

// this is the "zoomed out" font size
// for creating still readable text
export const fontSizeLarge = '30px'
export const fontSizeLargeInt = 30
export const lineSpacingLarge =
  fontSizeLargeInt * lineHeightMultiplier - fontSizeLargeInt

// this is the "extra zoomed out" font size
// for creating still readable text
export const fontSizeExtraLarge = '40px'
export const fontSizeExtraLargeInt = 40
export const lineSpacingExtraLarge =
  fontSizeExtraLargeInt * lineHeightMultiplier - fontSizeExtraLargeInt

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
  let currentLine = ''

  function splitWordFit(word: string) {
    const currentLineWithLeadingSpace =
      currentLine + (currentLine.length ? ' ' : '')
    let foundThreshold = false
    let wordMustBeBrokenAtIndex: number
    for (let v = 1; v <= word.length && !foundThreshold; v++) {
      let sliceOfWord = word.slice(0, v)
      let width = ctx.measureText(currentLineWithLeadingSpace + sliceOfWord)
        .width
      if (width > maxWidth) {
        foundThreshold = true
        wordMustBeBrokenAtIndex = v - 1
      }
    }
    lines.push(
      currentLineWithLeadingSpace + word.slice(0, wordMustBeBrokenAtIndex)
    )
    const endofSplitWord = word.slice(wordMustBeBrokenAtIndex)
    // if its still too big, recurse, split again
    if (ctx.measureText(endofSplitWord).width > maxWidth) {
      currentLine = ''
      splitWordFit(endofSplitWord)
    } else {
      currentLine = endofSplitWord
    }
  }

  for (let i = 0; i < words.length; i++) {
    let word = words[i]
    const currentLineWithLeadingSpace =
      currentLine + (currentLine.length ? ' ' : '')
    // the single word exceeds the available space
    // then break the word
    if (ctx.measureText(word).width > maxWidth) {
      if (currentLine.length) {
        lines.push(currentLine)
        currentLine = ''
      }
      splitWordFit(word)
    }
    // if adding this word fits, put it on this line
    else if (
      ctx.measureText(currentLineWithLeadingSpace + word).width < maxWidth
    ) {
      currentLine = currentLineWithLeadingSpace + word
    } else {
      // if adding this word doesn't fit, but the word
      // overall will fit on one line, then just start the new line with
      // that word
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

export interface OutcomeDimensions {
  width: number
  height: number
}

export function getOutcomeDimensions({
  ctx,
  outcome,
  projectTags,
  zoomLevel,
  useLineLimit,
}: {
  ctx?: CanvasRenderingContext2D
  outcome: ComputedOutcome
  projectTags: WithActionHash<Tag>[]
  zoomLevel: number
  useLineLimit?: boolean
}): OutcomeDimensions {
  const width = getOutcomeWidth({
    ctx,
    outcome,
    zoomLevel,
  })
  const height = getOutcomeHeight({
    ctx,
    outcome,
    zoomLevel,
    projectTags,
    width,
    useLineLimit,
  })
  return {
    width,
    height,
  }
}

// outcome width = outcome statement width + ( 2 * width padding)
export function getOutcomeWidth({
  ctx,
  outcome,
  zoomLevel,
}: {
  ctx?: CanvasRenderingContext2D
  outcome?: ComputedOutcome
  zoomLevel?: number
} = {}) {
  // TODO: next, make this dynamic
  return 520 // 520 = 392 + ( 2 * 64 )
}

// height is a function of width
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
      useLineLimit,
      onlyMeasure: true, // we don't want it actually drawn on the canvas
      outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      outcomeWidth: width,
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

  const progress = computeProgress(outcome)
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
    (outcomeTimeAndAssigneesHeight > 0 && progressBarHeight == 0 ? 12 : 0) +
    // if progress bar existed, then we need another spacer
    (progressBarHeight > 0 ? OUTCOME_VERTICAL_SPACE_BETWEEN + 12 : 0)

  const detectedOutcomeHeight =
    DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT +
    outcomeStatementHeight +
    outcomeTagsHeight +
    outcomeTimeAndAssigneesHeight +
    // TODO: should progressBarHeight be here?
    verticalSpacing

  return detectedOutcomeHeight
}
