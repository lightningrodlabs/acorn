import { OutcomeChangeStats } from '../../migrating/projectDiff'
import draw from '../draw'
import drawRoundCornerRectangle from '../drawRoundCornerRectangle'

// i3b — per-node +/~/− badge: what the applied diff did to THIS node, drawn as
// chips overlapping the card's top-right corner while diff-review mode (the
// changed-node glow) is active. A brand-new node gets a single "new" chip.

const CHIP_HEIGHT = 40
const CHIP_RADIUS = 10
const CHIP_PADDING_X = 12
const CHIP_GAP = 8
const RIGHT_INSET = 24
const FONT = `bold 26px PlusJakartaSans-bold`

const COLORS = {
  added: '#2EB648',
  updated: '#FF9500', // matches the changed-node glow
  removed: '#E94E3C',
}

const drawChangeBadge = ({
  changeStats,
  outcomeLeftX,
  outcomeTopY,
  outcomeWidth,
  ctx,
}: {
  changeStats: OutcomeChangeStats
  outcomeLeftX: number
  outcomeTopY: number
  outcomeWidth: number
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    const chips: { label: string; color: string }[] = changeStats.isNew
      ? [{ label: 'new', color: COLORS.added }]
      : [
          changeStats.added && {
            label: `+${changeStats.added}`,
            color: COLORS.added,
          },
          changeStats.updated && {
            label: `~${changeStats.updated}`,
            color: COLORS.updated,
          },
          changeStats.removed && {
            label: `−${changeStats.removed}`,
            color: COLORS.removed,
          },
        ].filter(Boolean) as { label: string; color: string }[]
    if (!chips.length) return

    ctx.font = FONT
    const chipY = outcomeTopY - CHIP_HEIGHT / 2 // straddle the card's top edge
    // lay out right-to-left from the card's top-right corner
    let rightEdge = outcomeLeftX + outcomeWidth - RIGHT_INSET
    for (let i = chips.length - 1; i >= 0; i--) {
      const { label, color } = chips[i]
      const textWidth = ctx.measureText(label).width
      const chipWidth = textWidth + 2 * CHIP_PADDING_X
      const chipX = rightEdge - chipWidth
      drawRoundCornerRectangle({
        ctx,
        xPosition: chipX,
        yPosition: chipY,
        width: chipWidth,
        height: CHIP_HEIGHT,
        radius: CHIP_RADIUS,
        color,
        useStroke: false,
        useDashedStroke: false,
        useBoxShadow: false,
        useGlow: false,
      })
      ctx.font = FONT
      ctx.fillStyle = '#FFFFFF'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, chipX + CHIP_PADDING_X, chipY + CHIP_HEIGHT / 2)
      rightEdge = chipX - CHIP_GAP
    }
  })

export default drawChangeBadge
