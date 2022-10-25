import {
  ComputedAchievementStatus,
  ComputedScope,
  ComputedSimpleAchievementStatus,
} from '../../types'
import draw from '../draw'
import { getOrSetImageForUrl } from '../imageCache'
// @ts-ignore
import checkmarkGreySvg from '../../images/square-check-grey.svg'
// @ts-ignore
import checkmarkGreenSvg from '../../images/square-check-green.svg'
// @ts-ignore
import leafGreenSvg from '../../images/leaf-green.svg'
// @ts-ignore
import uncertainSvg from '../../images/uncertain.svg'

const drawDescendantsAchievementStatus = ({
  skipRender,
  onlyMeasure,
  fontSize,
  fontFamily,
  imageSize,
  defaultTextColor,
  achievedTextColor,
  withChildren,
  xPosition,
  yPosition,
  computedScope,
  computedAchievementStatus,
  ctx,
}: {
  skipRender: boolean
  onlyMeasure: boolean
  fontSize: number
  fontFamily: string
  imageSize: number
  defaultTextColor: string
  achievedTextColor: string
  withChildren: boolean
  xPosition: number
  yPosition: number
  computedScope: ComputedScope
  computedAchievementStatus: ComputedAchievementStatus
  ctx: CanvasRenderingContext2D
}): number => {
  let height: number = 0
  // early exit with no rendering, in the case of skipRender
  if (skipRender) return height
  // onlyMeasure is different than skipRender
  // it means that we want to pretend as if it had been rendered
  // for the sake of getting the height
  if (onlyMeasure) return imageSize

  // okay, we can confidently now actually draw
  draw(ctx, () => {
    ctx.fillStyle = defaultTextColor
    ctx.font = `${fontSize.toString()}rem ${fontFamily}`
    ctx.textBaseline = 'top'

    const spaceBetweenSections = 10
    const spaceBetweenIconAndText = 5

    if (withChildren) {
      let smallsTextWidth: number = 0
      // override font color, if Achieved
      if (
        computedAchievementStatus.simple ===
        ComputedSimpleAchievementStatus.Achieved
      ) {
        ctx.fillStyle = achievedTextColor
      }

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
            ? ` (${Math.round(
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
        ctx.drawImage(
          uncertainsImg,
          xPosition,
          yPosition - 2,
          imageSize,
          imageSize
        )
      }
      ctx.fillText(
        'Uncertain Scope',
        xPosition + imageSize + spaceBetweenIconAndText,
        yPosition
      )
    } else {
      // Small
      const tasksImgGreen = getOrSetImageForUrl(
        checkmarkGreenSvg,
        imageSize,
        imageSize
      )
      const tasksImgGrey = getOrSetImageForUrl(
        checkmarkGreySvg,
        imageSize,
        imageSize
      )
      const tasksCompleted =
        computedAchievementStatus.tasksTotal > 0 &&
        computedAchievementStatus.tasksAchieved ===
          computedAchievementStatus.tasksTotal
      const imgToDraw = tasksCompleted ? tasksImgGreen : tasksImgGrey
      if (imgToDraw) {
        ctx.drawImage(imgToDraw, xPosition, yPosition - 2, imageSize, imageSize)
      }
      const percentageText = ` (${Math.round(
        (computedAchievementStatus.tasksAchieved /
          computedAchievementStatus.tasksTotal) *
          100
      )}%)`
      const tasksText =
        computedAchievementStatus.tasksTotal > 0
          ? `${computedAchievementStatus.tasksAchieved}/${computedAchievementStatus.tasksTotal}${percentageText}`
          : 'No tasks'
      // override font color, if tasksCompleted
      if (tasksCompleted) {
        ctx.fillStyle = achievedTextColor
      }
      ctx.fillText(
        tasksText,
        xPosition + imageSize + spaceBetweenIconAndText,
        yPosition
      )
    }
  })
  return imageSize
}

export default drawDescendantsAchievementStatus
