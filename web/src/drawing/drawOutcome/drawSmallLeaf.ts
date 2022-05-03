import draw from '../draw'
import { getOrSetImageForUrl } from '../imageCache'
import leafGreen from '../../images/leaf-green.svg'
import leafBronze from '../../images/leaf-bronze.svg'

const drawSmallLeaf = ({
  xPosition,
  yPosition,
  isAchieved,
  isSmall,
  size,
  ctx,
}: {
  xPosition: number
  yPosition: number
  isAchieved: boolean
  isSmall: boolean
  size: number
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    if (isSmall) {
      const leafImg = getOrSetImageForUrl(
        isAchieved ? leafGreen : leafBronze,
        size,
        size
      )
      // url, x coordinate, y coordinate, width, height
      if (leafImg) {
        ctx.drawImage(leafImg, xPosition, yPosition, size, size)
      }
    }
  })

export default drawSmallLeaf
