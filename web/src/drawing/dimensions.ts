export const outcomeMetaPadding = 12

export const CONNECTOR_VERTICAL_SPACING = 20


// DELETE THESE
export const avatarSpace = -4
export const avatarWidth = 26
export const avatarHeight = 26
export const avatarRadius = 13

export const outcomeWidth = 360
export const outcomeHeight = 160
export const cornerRadius = 15 // for outcome, main card
export const borderWidth = 4

export const outcomePaddingHorizontal = 20
// affects not only the top and bottom padding,
// but also the space in between items in the vertical layout
export const OUTCOME_VERTICAL_SPACE_BETWEEN = 32

export const selectedOutlineMargin = 1
export const selectedOutlineWidth = 4

// these two values need to match with each other
// as the system is dumb about the font height
export const DESCENDANTS_ACHIEVEMENT_STATUS_HEIGHT = 16
export const DESCENDANTS_ACHIEVEMENT_STATUS_FONT_SIZE_REM = 1
export const DESCENDANTS_ACHIEVEMENT_STATUS_FONT_FAMILY =
  'PlusJakartaSans-medium'

export const TAGS_SPACE_BETWEEN = 10
export const TAGS_TAG_CORNER_RADIUS = 4
export const TAGS_TAG_HORIZONTAL_PADDING = 8
export const TAGS_TAG_VERTICAL_PADDING = 4
export const TAGS_TAG_FONT_SIZE_REM = 0.8
export const TAGS_TAG_FONT_FAMILY = 'PlusJakartaSans-medium'

export const AVATAR_SPACE = -4
export const AVATAR_SIZE = 26
export const TIME_FONT_SIZE_REM = 1
export const TIME_FONT_FAMILY = 'PlusJakartaSans-medium'

export const PROGRESS_BAR_HEIGHT = 20

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

export const fontFamily = 'PlusJakartaSans-medium'

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

  return statement
    .split('\n')
    .map((para) => getLines({ ctx, statement: para, maxWidth }))
    .reduce((a, b) => a.concat(b))
}

export function getOutcomeHeight({
  ctx,
  statement,
  zoomLevel,
  width,
}: {
  ctx?: CanvasRenderingContext2D
  statement: string
  zoomLevel: number
  width: number
}) {
  // if this outcome is being edited then
  // its height is a variable that we need to
  // measure because we are rendering an unknown number of
  // lines of text

  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  // get lines after font and font size are set up, since ctx.measureText()
  // takes font and font size into account
  const lines = getLinesForParagraphs({
    ctx,
    statement,
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
  const totalTextHeight = lines.length * (fontSizeToUse * lineHeightMultiplier)

  // calculate the outcomeHeight
  // from the top and bottom margins + the height
  // of the lines of text
  const detectedOutcomeHeight =
    OUTCOME_VERTICAL_SPACE_BETWEEN * 2 +
    totalTextHeight +
    avatarHeight +
    avatarSpace * 2

  // create a minimum height equal to the outcomeHeight
  return Math.max(detectedOutcomeHeight, outcomeHeight)
}
