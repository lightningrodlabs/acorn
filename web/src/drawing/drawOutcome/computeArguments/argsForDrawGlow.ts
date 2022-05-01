import { TOP_PRIORITY_GLOW_COLOR } from '../../../styles'
import { borderWidth, cornerRadius } from '../../dimensions'
import drawGlow from '../drawGlow'

/*
  Draw Glow
*/
export const argsForDrawGlow = ({
  useGlow,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  outcomeHeight,
  ctx,
}: {
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  outcomeHeight: number
  useGlow: boolean
  ctx: CanvasRenderingContext2D
}): Parameters<typeof drawGlow>[0] => {
  const twiceBorder = borderWidth * 2
  const xPosition = outcomeLeftX + borderWidth
  const yPosition = outcomeTopY + borderWidth
  const width = outcomeWidth - twiceBorder
  const height = outcomeHeight - twiceBorder
  const glowCornerRadius = cornerRadius - 1
  const args: Parameters<typeof drawGlow>[0] = {
    xPosition,
    yPosition,
    width,
    height,
    cornerRadius: glowCornerRadius,
    useGlow,
    glowColor: TOP_PRIORITY_GLOW_COLOR,
    ctx,
  }
  return args
}
