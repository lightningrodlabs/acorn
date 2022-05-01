import {
  ComputedAchievementStatus,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'
import draw from '../draw'

const drawDescendantsAchievementStatus = ({
  fontSize,
  fontFamily,
  defaultTextColor,
  achievedTextColor,
  withChildren,
  xPosition,
  yPosition,
  computedScope,
  computedAchievementStatus,
  ctx,
}: {
  fontSize: number
  fontFamily: string
  defaultTextColor: string
  achievedTextColor: string
  withChildren: boolean
  xPosition: number
  yPosition: number
  computedScope: ComputedScope
  computedAchievementStatus: ComputedAchievementStatus
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    ctx.fillStyle =
      computedAchievementStatus.simple ===
      ComputedSimpleAchievementStatus.Achieved
        ? achievedTextColor
        : defaultTextColor

    ctx.font = `${fontSize.toString()}rem ${fontFamily}`
    ctx.textBaseline = 'top'

    if (withChildren) {
      // TODO: add icons
      let text = ''
      if (computedAchievementStatus.smallsTotal > 0) {
        text += `${computedAchievementStatus.smallsAchieved}/${computedAchievementStatus.smallsTotal}`
      }
      if (computedAchievementStatus.uncertains > 0) {
        text += ` ${computedAchievementStatus.uncertains}`
      }
      ctx.fillText(text, xPosition, yPosition)
    } else if (computedScope === ComputedScope.Uncertain) {
      // TODO: add icons
      ctx.fillText('Uncertain Scope', xPosition, yPosition)
    } else if (computedScope === ComputedScope.Big) {
    } else {
      // Small
      // TODO: add icons
      // TODO: task list
    }
  })

export default drawDescendantsAchievementStatus
