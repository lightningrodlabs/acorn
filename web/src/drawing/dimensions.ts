import { ComputedOutcome, ComputedScope, Tag } from '../types'
import { WithActionHash } from '../types/shared'
import {
  argsForDrawDescendantsAchievementStatus,
  argsForDrawProgressBar,
  argsForDrawStatement,
  argsForDrawTags,
  argsForDrawTimeAndAssignees,
} from './drawOutcome/computeArguments'
import { computeHeightsWithSpacing } from './drawOutcome/computeArguments/computeHeightsWithSpacing'
import drawDescendantsAchievementStatus from './drawOutcome/drawDescendantsAchievementStatus'
import drawProgressBar from './drawOutcome/drawProgressBar'
import drawStatement from './drawOutcome/drawStatement'
import drawTags from './drawOutcome/drawTags'
import drawTimeAndAssignees from './drawOutcome/drawTimeAndAssignees'

export const DEFAULT_OUTCOME_ASPECT_WIDTH_TO_HEIGHT_RATIO = 0.75 // 4:3 width:height

export const outcomeMetaPadding = 12

export const CONNECTOR_VERTICAL_SPACING = 20

export const OUTCOME_VERTICAL_HOVER_ALLOWANCE = 60

export const outcomePaddingHorizontal = 64

export const cornerRadius = 18 // for outcome, main card background color
export const cornerRadiusBorder = 18 // for the border
export const borderWidth = 8
export const dashedBorderWidth = 5

// canvas outcome statement
export const outcomeStatementMinHeightWithoutMeta = 130

// statement placeholder for small outcomes
export const OUTCOME_STATEMENT_PLACEHOLDER_LINE_HEIGHT_SMALL = 12
export const OUTCOME_STATEMENT_PLACEHOLDER_LINE_SPACE_SMALL = 8

// statement placeholder for not small outcomes
export const OUTCOME_STATEMENT_PLACEHOLDER_LINE_HEIGHT_NOT_SMALL = 20
export const OUTCOME_STATEMENT_PLACEHOLDER_LINE_SPACE_NOT_SMALL = 14

// affects not only the top and bottom padding,
// but also the space in between items in the vertical layout
export const OUTCOME_VERTICAL_SPACE_BETWEEN = 32

export const selectedOutlineMargin = 4
export const SELECTED_OUTLINE_WIDTH = 3.5

// DESCENDANTS ACHIVEMENT STATUS
// these two values need to match with each other
// as the system is dumb about the font height
export const DESCENDANTS_ACHIEVEMENT_STATUS_IMAGE_SIZE = 16
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

  const RECURSE_MAX = 8
  function splitWordFit(word: string, recursions: number) {
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
    // as long as its not recursing too deep
    if (
      ctx.measureText(endofSplitWord).width > maxWidth &&
      recursions < RECURSE_MAX
    ) {
      currentLine = ''
      splitWordFit(endofSplitWord, recursions + 1)
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
      splitWordFit(word, 0)
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
    } else if (zoomLevel < 0.7) {
      lineLimit = 4
    } else {
      lineLimit = 10
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

export function getOutcomeWidth({
  outcome,
  zoomLevel,
}: {
  outcome: ComputedOutcome
  zoomLevel: number
}) {
  // outcome width = outcome statement width + ( 2 * width padding)
  const defaultWidth = 520 // 520 = 392 + ( 2 * 64 )

  if (outcome.computedScope === ComputedScope.Small) {
    // 0.02 < zoomLevel < 2.5
    if (zoomLevel < 1) {
      // 0.02 < zoomLevel < 1
      return defaultWidth * Math.min(zoomLevel * 1.4, 1)
    } else return defaultWidth
  } else {
    return defaultWidth
  }
}

// height is a function of width
export function getOutcomeHeight({
  ctx,
  outcome,
  projectTags,
  zoomLevel,
  width,
  noStatementPlaceholder,
  useLineLimit = true,
}: {
  ctx?: CanvasRenderingContext2D
  outcome: ComputedOutcome
  projectTags: WithActionHash<Tag>[]
  zoomLevel: number
  width: number
  noStatementPlaceholder?: boolean
  useLineLimit?: boolean
}) {
  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  const heightOfDescendantsAchievementStatus = drawDescendantsAchievementStatus(
    argsForDrawDescendantsAchievementStatus({
      onlyMeasure: true, // we don't want it actually drawn on the canvas
      outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      topOffsetY: computeHeightsWithSpacing([]), // no prior elements
      zoomLevel,
      ctx,
    })
  )

  const heightOfStatement = drawStatement(
    argsForDrawStatement({
      useLineLimit,
      noStatementPlaceholder,
      onlyMeasure: true, // we don't want it actually drawn on the canvas
      outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      topOffsetY: computeHeightsWithSpacing([
        heightOfDescendantsAchievementStatus,
      ]),
      outcomeWidth: width,
      zoomLevel,
      ctx,
    })
  )

  const heightOfTags = drawTags(
    argsForDrawTags({
      onlyMeasure: true,
      outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      outcomeWidth: width,
      topOffsetY: computeHeightsWithSpacing([
        heightOfDescendantsAchievementStatus,
        heightOfStatement,
      ]),
      projectTags,
      ctx,
      zoomLevel,
    })
  )
  const heightOfTimeAndAssignees = drawTimeAndAssignees(
    argsForDrawTimeAndAssignees({
      onlyMeasure: true, // we don't want it actually drawn on the canvas
      outcome: outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      outcomeWidth: width,
      topOffsetY: computeHeightsWithSpacing([
        heightOfDescendantsAchievementStatus,
        heightOfStatement,
        heightOfTags,
      ]),
      zoomLevel,
      ctx,
    })
  )

  const heightOfProgressBar = drawProgressBar(
    argsForDrawProgressBar({
      onlyMeasure: true, // we don't want it actually drawn on the canvas
      outcome,
      outcomeLeftX: 0, // this number doesn't matter for measuring
      outcomeTopY: 0, // this number doesn't matter for measuring
      outcomeWidth: width,
      topOffsetY: computeHeightsWithSpacing([
        heightOfDescendantsAchievementStatus,
        heightOfStatement,
        heightOfTags,
        heightOfTimeAndAssignees,
      ]),
      zoomLevel,
      ctx,
    })
  )

  const detectedOutcomeHeight = computeHeightsWithSpacing([
    heightOfDescendantsAchievementStatus,
    heightOfStatement,
    heightOfTags,
    heightOfTimeAndAssignees,
    heightOfProgressBar,
  ])

  if (outcome && outcome.computedScope === ComputedScope.Small) {
    // for a Small, use a minimum height which is even to default
    // aspect ratio for Outcome cards width:height
    return Math.max(
      detectedOutcomeHeight,
      width * DEFAULT_OUTCOME_ASPECT_WIDTH_TO_HEIGHT_RATIO
    )
  } else {
    return detectedOutcomeHeight
  }
}
