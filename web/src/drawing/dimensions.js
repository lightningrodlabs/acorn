export const CONNECTOR_VERTICAL_SPACING = 20
export const avatarSpace = -4
export const avatarWidth = 24
export const avatarHeight = 24
export const avatarRadius = 12
export const goalWidth = 360
export const goalHeight = 160
export const cornerRadius = 15
export const borderWidth = 2
export const textBoxMarginLeft = 29
export const textBoxMarginTop = 32
export const textBoxWidth = 310


export const firstZoomThreshold = 0.6
export const secondZoomThreshold = 0.4

export const lineHeightMultiplier = 1.2
// this is the regular font size, for
// a regular level of zoom
// and this is for the Goal Titles
// on the canvas
// these two values fontSize and fontSizeInt should match
export const fontSize = '20px'
export const fontSizeInt = 20
export const lineSpacing = 6

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
function getLines(ctx, text, maxWidth) {
  const words = text.split(' ')
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

export function getLinesForParagraphs(ctx, textWithParagraphs, scale) {
  // set so that measurements are proper
  ctx.fillStyle = '#4D4D4D'
  // adjust font size based on scale (zoom factor)
  if (scale >= firstZoomThreshold) {
    ctx.font = fontSize + ' ' + fontFamily
  } else if (scale > secondZoomThreshold && scale < firstZoomThreshold) {
    ctx.font = fontSizeLarge + ' ' + fontFamily
  } else {
    ctx.font = fontSizeExtraLarge + ' ' + fontFamily
  }
  ctx.textBaseline = 'top'

  return textWithParagraphs
    .split('\n')
    .map(para => getLines(ctx, para, textBoxWidth))
    .reduce((a, b) => a.concat(b))
}

export function getGoalHeight(ctx, goalText, scale, isEditing) {

  // if this goal is not being edited
  // then its height is a known/constant
  // because the title text is being limited 
  // to a fixed number of lines of text
  if (!isEditing) {
    return goalHeight
  }

  // if this goal is being edited then
  // its height is a variable that we need to
  // measure because we are rendering an unknown number of 
  // lines of text

  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  // get lines after font and font size are set up, since ctx.measureText()
  // takes font and font size into account
  const lines = getLinesForParagraphs(ctx, goalText, scale)

  // adjust font size based on scale (zoom factor)
  let fontSizeToUse = fontSizeInt // default
  if (scale < secondZoomThreshold) {
    fontSizeToUse = fontSizeExtraLargeInt
  } else if (scale < firstZoomThreshold) {
    fontSizeToUse = fontSizeLargeInt
  }
  const totalTextHeight = lines.length * (fontSizeToUse * lineHeightMultiplier)

  // calculate the goalHeight
  // from the top and bottom margins + the height
  // of the lines of text
  const detectedGoalHeight =
    textBoxMarginTop * 2 + totalTextHeight + avatarHeight + avatarSpace * 2

  // create a minimum height equal to the goalHeight
  return Math.max(detectedGoalHeight, goalHeight)
}
