import draw from '../draw'
import { getOrSetImageForUrl } from '../imageCache'

const IMAGE_SIZE = 30

const drawSmallLeaf = ({
  xPosition,
  yPosition,
  isAchieved,
  isSmall,
  ctx,
}: {
  xPosition: number
  yPosition: number
  isAchieved: boolean
  isSmall: boolean
  ctx: CanvasRenderingContext2D
}) =>
  draw(ctx, () => {
    if (isSmall) {
      const leafImg = getOrSetImageForUrl(
        // TODO: make sure these images exist and are available
        `img/leaf_${isAchieved ? 'Achieved' : 'NotAchieved'}.svg`,
        IMAGE_SIZE,
        IMAGE_SIZE
      )
      // url, x coordinate, y coordinate, width, height
      if (leafImg) {
        ctx.drawImage(leafImg, xPosition, yPosition, IMAGE_SIZE, IMAGE_SIZE)
      }
    }
  })

export default drawSmallLeaf
