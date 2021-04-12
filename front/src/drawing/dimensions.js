export const CONNECTOR_VERTICAL_SPACING = 20
export const avatarSpace = 4
export const avatarWidth = 24
export const avatarHeight = 24
export const avatarRadius = 12
export const goalWidth = 360
export const goalHeight = 130
export const cornerRadius = 15
export const borderWidth = 2
export const textBoxMarginLeft = 29
export const textBoxMarginTop = 32
export const textBoxWidth = 310
// these two values fontSize and fontSizeInt should match
export const fontSize = '20px'
export const fontSizeInt = 20
export const lineHeight = 28
export const lineSpacing = 8 // slice off px from font size to get font height as number
export const fontFamily = 'hk-grotesk-medium'

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

export function getLinesForParagraphs(ctx, textWithParagraphs) {
  // set so that measurements are proper
  ctx.fillStyle = '#4D4D4D'
  ctx.font = fontSize + ' ' + fontFamily
  ctx.textBaseline = 'top'

  return textWithParagraphs
    .split('\n')
    .map(para => getLines(ctx, para, textBoxWidth))
    .reduce((a, b) => a.concat(b))
}

export function getGoalHeight(ctx, goalText) {
  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  // get lines after font and font size are set up, since ctx.measureText()
  // takes font and font size into account
  const lines = getLinesForParagraphs(ctx, goalText)

  const totalTextHeight = lines.length * (fontSizeInt + lineSpacing)

  // calculate the goalHeight
  // from the top and bottom margins + the height
  // of the lines of text
  const detectedGoalHeight =
    textBoxMarginTop * 2 + totalTextHeight + avatarHeight + avatarSpace * 2

  return Math.max(detectedGoalHeight, goalHeight)
}
