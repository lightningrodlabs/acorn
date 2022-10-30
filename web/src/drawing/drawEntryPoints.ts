import { ComputedOutcome, Connection, EntryPoint } from '../types'
import { ActionHashB64, WithActionHash } from '../types/shared'
import draw from './draw'
import drawRoundCornerRectangle from './drawRoundCornerRectangle'
import { getBoundingRec } from './layoutFormula'

export default function drawEntryPoints(
  ctx: CanvasRenderingContext2D,
  activeEntryPoints: WithActionHash<EntryPoint>[],
  outcomes: {
    [outcomeActionHash: string]: ComputedOutcome
  },
  connectionsAsArray: WithActionHash<Connection>[],
  allOutcomeCoordinates: {
    [actionHash: ActionHashB64]: { x: number; y: number }
  },
  allOutcomeDimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  },
  zoomLevel: number
) {
  // recursively calls itself
  // so that it constructs the full sub-tree for each root Outcome
  function getOutcome(outcomeActionHash: ActionHashB64) {
    return {
      ...outcomes[outcomeActionHash],
      children: connectionsAsArray
        // find the connections indicating the children of this outcome
        .filter(
          (connection) => connection.parentActionHash === outcomeActionHash
        )
        // actually nest the children Outcomes, recurse
        .map((connection) => getOutcome(connection.childActionHash)),
    }
  }

  draw(ctx, () => {
    // start with the entry point Outcomes, and recurse down to their children
    activeEntryPoints.forEach((entryPoint) => {
      const outcome = getOutcome(entryPoint.outcomeActionHash)
      // for each outcomeTree
      // calculate its bounding rectangle
      // by checking the coordinates recursively for it and all its children
      const boundingRec = getBoundingRec(
        outcome,
        allOutcomeCoordinates,
        allOutcomeDimensions
      )
      if (!boundingRec) {
        return
      }
      const [top, right, bottom, left] = boundingRec

      const width = right - left
      const height = bottom - top
      drawRoundCornerRectangle({
        ctx,
        xPosition: left,
        yPosition: top,
        width: width,
        height: height,
        radius: 15,
        color: entryPoint.color,
        useStroke: true,
        strokeWidth: 5,
        useBoxShadow: false,
        useGlow: false,
        useDashedStroke: true,
      })
      ctx.fillStyle = entryPoint.color
      let fontSize = 25
      if (zoomLevel < 0.15) {
        fontSize = 140
      } else if (zoomLevel < 0.3) {
        fontSize = 100
      } else if (zoomLevel < 0.5) {
        fontSize = 60
      }
      ctx.font = `${fontSize}px PlusJakartaSans-bold`

      // recurse if necessary to find the amount of text that would
      // fit within the available width
      function adjustCutoff(cutoff: number) {
        const textToCheck = outcome.content.slice(0, cutoff) + '...'
        if (ctx.measureText(textToCheck).width < width) {
          return cutoff
        } else {
          return adjustCutoff(cutoff - 1)
        }
      }
      const textCutoff = adjustCutoff(outcome.content.length)
      let content =
        outcome.content.length <= textCutoff
          ? outcome.content
          : outcome.content.slice(0, textCutoff) + '...'
      ctx.textBaseline = 'bottom'
      // distance of entry point title from dotted rectangle is 20
      ctx.fillText(content, left, top - 20)
    })
  })
}
