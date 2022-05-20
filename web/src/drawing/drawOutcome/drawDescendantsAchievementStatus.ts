import {
  ComputedAchievementStatus,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'
import draw from '../draw'
import { getOrSetImageForUrl } from '../imageCache'
// @ts-ignore
import leafGreenSvg from '../../images/leaf-green.svg'
// @ts-ignore
import uncertainSvg from '../../images/uncertain.svg'

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

    const imageSize = 18
    const spaceBetweenSections = 10
    const spaceBetweenIconAndText = 4

    if (withChildren) {
      let smallsTextWidth: number = 0

      // Smalls
      if (computedAchievementStatus.smallsTotal > 0) {
        const smallsImg = getOrSetImageForUrl(
          leafGreenSvg,
          imageSize,
          imageSize
        )
        if (smallsImg) {
          ctx.drawImage(smallsImg, xPosition, yPosition, imageSize, imageSize)
        }
        const percentageText =
          computedAchievementStatus.uncertains === 0
            ? ` (${Math.floor(
                (computedAchievementStatus.smallsAchieved /
                  computedAchievementStatus.smallsTotal) *
                  100
              )}%)`
            : ''
        const smallsText = `${computedAchievementStatus.smallsAchieved}/${computedAchievementStatus.smallsTotal}${percentageText}`
        ctx.fillText(
          smallsText,
          xPosition + imageSize + spaceBetweenIconAndText,
          yPosition
        )
        smallsTextWidth = ctx.measureText(smallsText).width
      }

      // Uncertains
      if (computedAchievementStatus.uncertains > 0) {
        const uncertainsImg = getOrSetImageForUrl(
          uncertainSvg,
          imageSize,
          imageSize
        )
        // account for whether or
        // not there are Smalls to display the count of
        const leftAdjust =
          smallsTextWidth > 0
            ? imageSize +
              spaceBetweenIconAndText +
              smallsTextWidth +
              spaceBetweenSections
            : 0
        if (uncertainsImg) {
          ctx.drawImage(
            uncertainsImg,
            xPosition + leftAdjust,
            yPosition,
            imageSize,
            imageSize
          )
        }
        const uncertainsText = computedAchievementStatus.uncertains.toString()
        ctx.fillText(
          uncertainsText,
          xPosition + leftAdjust + imageSize + spaceBetweenIconAndText,
          yPosition
        )
      }
    } else if (computedScope === ComputedScope.Uncertain) {
      // Uncertain, without children
      const uncertainsImg = getOrSetImageForUrl(
        uncertainSvg,
        imageSize,
        imageSize
      )
      if (uncertainsImg) {
        ctx.drawImage(uncertainsImg, xPosition, yPosition, imageSize, imageSize)
      }
      ctx.fillText(
        'Uncertain Scope',
        xPosition + imageSize + spaceBetweenIconAndText,
        yPosition
      )
    } else if (computedScope === ComputedScope.Big) {
    } else {
      // Small
      // TODO: add icons
      // TODO: task list
    }
  })

export default drawDescendantsAchievementStatus
