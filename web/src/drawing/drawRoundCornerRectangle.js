export default function drawRoundCornerRectangle({
  context,
  xPosition,
  yPosition,
  width,
  height,
  radius,
  color,
  stroke,
  strokeWidth,
  boxShadow,
  topPriorityOutcomeGlow
}) {
  const rightConnection = xPosition + width
  const bottomConnection = yPosition + height

  context.save()

  context.beginPath()

  if (stroke) context.strokeStyle = color
  else context.fillStyle = color


  // outcome card box shadow
  if (boxShadow) {
    context.shadowColor = '#00000030'
    context.shadowBlur = 30
    context.shadowOffsetX = 0
    context.shadowOffsetY = 0
    if (topPriorityOutcomeGlow) {
      context.shadowColor = topPriorityOutcomeGlow
      context.shadowBlur = 60
      context.shadowOffsetX = 0
      context.shadowOffsetY = 0
    }
  }
  context.lineWidth = stroke ? strokeWidth : '1'
  context.moveTo(xPosition + radius, yPosition)
  context.lineTo(rightConnection - radius, yPosition)
  context.quadraticCurveTo(rightConnection, yPosition, rightConnection, yPosition + radius)
  context.lineTo(rightConnection, yPosition + height - radius)
  context.quadraticCurveTo(
    rightConnection,
    bottomConnection,
    rightConnection - radius,
    bottomConnection
  )
  context.lineTo(xPosition + radius, bottomConnection)
  context.quadraticCurveTo(
    xPosition,
    bottomConnection,
    xPosition,
    bottomConnection - radius
  )
  context.lineTo(xPosition, yPosition + radius)
  context.quadraticCurveTo(xPosition, yPosition, xPosition + radius, yPosition)

  if (stroke) context.stroke()
  else context.fill()

  context.restore()
}
