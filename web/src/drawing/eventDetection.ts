import { outcomeWidth, getOutcomeHeight, outcomeHeight } from './dimensions'
import { coordsPageToCanvas } from './coordinateSystems'
import {
  calculateConnectionCoordsByOutcomeCoords,
  pathForConnection,
} from './drawConnection'
import { HeaderHashB64 } from '../types/shared'
import { ComputedOutcome } from '../types'
import { RootState } from '../redux/reducer'

export function checkForConnectionAtCoordinates(
  ctx: CanvasRenderingContext2D,
  translate: { x: number; y: number },
  scale: number,
  outcomeCoordinates: { [headerHash: HeaderHashB64]: { x: number; y: number } },
  state: RootState,
  mouseX: number,
  mouseY: number,
  outcomes: { [headerHash: HeaderHashB64]: ComputedOutcome }
) {
  const {
    ui: { activeProject },
  } = state
  const connections = state.projects.connections[activeProject] || {}
  const projectTags = Object.values(state.projects.tags[activeProject] || {})
  // convert the coordinates of the click to canvas space
  const convertedMouse = coordsPageToCanvas(
    {
      x: mouseX,
      y: mouseY,
    },
    translate,
    scale
  )

  // keep track of whether an connection intersects the mouse
  let overConnectionAddress: string
  Object.keys(connections)
    .map((headerHash) => connections[headerHash])
    .forEach((connection) => {
      const parentOutcomeCoords =
        outcomeCoordinates[connection.parentHeaderHash]
      const childOutcomeCoords = outcomeCoordinates[connection.childHeaderHash]
      const parentOutcome = outcomes[connection.parentHeaderHash]

      // do not proceed if we don't have coordinates
      // for the outcomes of this connection (yet)
      if (!parentOutcomeCoords || !childOutcomeCoords || !parentOutcome) {
        return
      }

      // get the coordinates for the connection end points
      const [
        childConnectionCoords,
        parentConnectionCoords,
      ] = calculateConnectionCoordsByOutcomeCoords(
        childOutcomeCoords,
        parentOutcomeCoords,
        parentOutcome,
        projectTags,
        scale,
        ctx
      )
      const connectionPath = pathForConnection({
        fromPoint: childConnectionCoords,
        toPoint: parentConnectionCoords,
      })
      // if mouse intersects with the bezier curve
      const canvas = document.createElement('canvas')
      const newCtx = canvas.getContext('2d')
      // use the built-in `isPointInStroke` function
      // very useful. Be 'forgiving'
      // and allow buffer on both sides
      newCtx.lineWidth = 30
      if (
        newCtx.isPointInStroke(connectionPath, convertedMouse.x, convertedMouse.y)
      ) {
        // set the overConnectionAddress to this connection headerHash
        overConnectionAddress = connection.headerHash
      }
    })
  return overConnectionAddress
}

export function checkForOutcomeAtCoordinates(
  ctx: CanvasRenderingContext2D,
  translate: { x: number; y: number },
  scale: number,
  outcomeCoordinates: { [headerHash: HeaderHashB64]: { x: number; y: number } },
  state: RootState,
  clickX: number,
  clickY: number,
  outcomes: { [headerHash: HeaderHashB64]: ComputedOutcome }
) {
  const {
    ui: { activeProject },
  } = state
  const projectTags = Object.values(state.projects.tags[activeProject] || {})
  // convert the coordinates of the click to canvas space
  const convertedClick = coordsPageToCanvas(
    {
      x: clickX,
      y: clickY,
    },
    translate,
    scale
  )

  // keep track of whether an Outcome was selected
  let clickedAddress: string
  Object.keys(outcomes)
    .map((headerHash) => outcomes[headerHash])
    .forEach((outcome) => {
      // convert the topLeft and bottomRight points of the outcome to canvas
      const coords = outcomeCoordinates[outcome.headerHash]

      // do not proceed if we don't have coordinates
      // for the outcome (yet)
      if (!coords) return

      const bottomRight = {
        x: coords.x + outcomeWidth,
        y:
          coords.y +
          getOutcomeHeight({
            ctx,
            outcome,
            projectTags,
            width: outcomeWidth,
            zoomLevel: scale,
          }),
      }

      // if click occurred within the box of an Outcome
      if (
        convertedClick.x >= coords.x &&
        convertedClick.x <= bottomRight.x &&
        convertedClick.y >= coords.y &&
        convertedClick.y <= bottomRight.y
      ) {
        clickedAddress = outcome.headerHash
      }
    })
  return clickedAddress
}

export function checkForOutcomeAtCoordinatesInBox(
  outcomeCoordinates: { [headerHash: HeaderHashB64]: { x: number; y: number } },
  corner: { x: number; y: number },
  oppositeCorner: { x: number; y: number }
) {
  // convert the coordinates of the click to canvas space
  // keep track of whether an Outcome was selected
  let clickedAddresses = {}
  Object.keys(outcomeCoordinates)
    // .map((headerHash) => outcomes[headerHash])
    .forEach((headerHash) => {
      // convert the topLeft and bottomRight points of the outcome to canvas
      const coords = outcomeCoordinates[headerHash]
      // do not proceed if we don't have coordinates
      // for the outcome (yet)
      if (!coords) return

      const bottomRight = {
        x: coords.x + outcomeWidth,
        y: coords.y + outcomeHeight,
      }

      // if click occurred within the box of an Outcome
      if (
        (oppositeCorner.x < coords.x &&
          bottomRight.x < corner.x &&
          oppositeCorner.y < coords.y &&
          bottomRight.y < corner.y) ||
        (oppositeCorner.x > bottomRight.x &&
          coords.x > corner.x &&
          oppositeCorner.y > bottomRight.y &&
          coords.y > corner.y) ||
        (oppositeCorner.x > bottomRight.x &&
          coords.x > corner.x &&
          oppositeCorner.y < coords.y &&
          bottomRight.y < corner.y) ||
        (oppositeCorner.x < coords.x &&
          bottomRight.x < corner.x &&
          oppositeCorner.y > bottomRight.y &&
          coords.y > corner.y)
      ) {
        clickedAddresses[headerHash] = 1
      }
    })
  return Object.keys(clickedAddresses)
}
