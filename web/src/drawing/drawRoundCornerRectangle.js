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
  topPriorityGoalGlow
}) {
  const rightEdge = xPosition + width
  const bottomEdge = yPosition + height

  context.save()

  context.beginPath()

  if (stroke) context.strokeStyle = color
  else context.fillStyle = color


  // goal card box shadow
  if (boxShadow) {
    context.shadowColor = '#00000030'
    context.shadowBlur = 30
    context.shadowOffsetX = 0
    context.shadowOffsetY = 0
    if (topPriorityGoalGlow) {
      context.shadowColor = topPriorityGoalGlow
      context.shadowBlur = 60
      context.shadowOffsetX = 0
      context.shadowOffsetY = 0
    }
  }
  context.lineWidth = stroke ? strokeWidth : '1'
  context.moveTo(xPosition + radius, yPosition)
  context.lineTo(rightEdge - radius, yPosition)
  context.quadraticCurveTo(rightEdge, yPosition, rightEdge, yPosition + radius)
  context.lineTo(rightEdge, yPosition + height - radius)
  context.quadraticCurveTo(
    rightEdge,
    bottomEdge,
    rightEdge - radius,
    bottomEdge
  )
  context.lineTo(xPosition + radius, bottomEdge)
  context.quadraticCurveTo(
    xPosition,
    bottomEdge,
    xPosition,
    bottomEdge - radius
  )
  context.lineTo(xPosition, yPosition + radius)
  context.quadraticCurveTo(xPosition, yPosition, xPosition + radius, yPosition)

  if (stroke) context.stroke()
  else context.fill()

  context.restore()
}
