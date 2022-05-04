import draw from '../draw'

const drawBeingEdited = ({ ctx }: { ctx: CanvasRenderingContext2D }) =>
  draw(ctx, () => {
    // if (isBeingEdited) {
    // drawRoundCornerRectangle({
    //   context: ctx,
    //   width: 140,
    //   height: 25,
    //   color: '#717171',
    //   boxShadow: false,
    //   xPosition: outcomeLeftX + outcomeWidth / 2 - 70,
    //   yPosition: outcomeTopY + outcomeHeight - 12.5,
    //   radius: 6,
    // })
    // }
    // if (isBeingEdited) {
    //   let isBeingEditedText = `Being edited by ${isBeingEditedBy}`
    //   ctx.fillStyle = '#fff'
    //   ctx.font = '14px PlusJakartaSans-bold'
    //   ctx.fillText(isBeingEditedText, outcomeLeftX + outcomeWidth / 2 - 60, outcomeTopY + outcomeHeight - 8)
    // }
  })

export default drawBeingEdited
