import { outcomeWidth, getOutcomeHeight, outcomeHeight } from './dimensions'
import { coordsPageToCanvas } from './coordinateSystems'
import {
  calculateConnectionCoordsByOutcomeCoords,
  pathForConnection,
} from './drawConnection'
import { ActionHashB64 } from '../types/shared'
import { ComputedOutcome } from '../types'
import { RootState } from '../redux/reducer'

export function checkForConnectionAtCoordinates(
  ctx: CanvasRenderingContext2D,
  translate: { x: number; y: number },
  scale: number,
  outcomeCoordinates: { [actionHash: ActionHashB64]: { x: number; y: number } },
  state: RootState,
  mouseX: number,
  mouseY: number,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome }
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
    .map((actionHash) => connections[actionHash])
    .forEach((connection) => {
      const parentOutcomeCoords =
        outcomeCoordinates[connection.parentActionHash]
      const childOutcomeCoords = outcomeCoordinates[connection.childActionHash]
      const parentOutcome = outcomes[connection.parentActionHash]

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
        newCtx.isPointInStroke(
          connectionPath,
          convertedMouse.x,
          convertedMouse.y
        )
      ) {
        // set the overConnectionAddress to this connection actionHash
        overConnectionAddress = connection.actionHash
      }
    })
  return overConnectionAddress
}

export function checkForOutcomeAtCoordinates(
  ctx: CanvasRenderingContext2D,
  translate: { x: number; y: number },
  scale: number,
  outcomeCoordinates: { [actionHash: ActionHashB64]: { x: number; y: number } },
  state: RootState,
  mouseX: number,
  mouseY: number,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  extraVerticalPadding: number = 0 // used to make detecting 'hovering' more generous/forgiving
) {
  const {
    ui: { activeProject },
  } = state
  const projectTags = Object.values(state.projects.tags[activeProject] || {})
  // convert the coordinates of the mouse to canvas space
  const convertedMouse = coordsPageToCanvas(
    {
      x: mouseX,
      y: mouseY,
    },
    translate,
    scale
  )

  // keep track of whether an Outcome was selected
  return Object.keys(outcomes).find((actionHash) => {
    const outcome = outcomes[actionHash]
    // convert the topLeft and bottomRight points of the outcome to canvas
    const outcomeCoordinate = outcomeCoordinates[outcome.actionHash]
    // do not proceed if we don't have coordinates
    // for the outcome (yet)
    if (!outcomeCoordinate) return false

    const topLeft = {
      x: outcomeCoordinate.x,
      y: outcomeCoordinate.y - extraVerticalPadding,
    }


    const bottomRight = {
      x: topLeft.x + outcomeWidth,
      y:
        outcomeCoordinates[outcome.actionHash].y +
        getOutcomeHeight({
          ctx,
          outcome,
          projectTags,
          width: outcomeWidth,
          zoomLevel: scale,
        }) +
        extraVerticalPadding,
    }

    // is mouse within the box of an Outcome
    return (
      convertedMouse.x >= topLeft.x &&
      convertedMouse.x <= bottomRight.x &&
      convertedMouse.y >= topLeft.y &&
      convertedMouse.y <= bottomRight.y
    )
  })
}

export function checkForOutcomeAtCoordinatesInBox(
  outcomeCoordinates: { [actionHash: ActionHashB64]: { x: number; y: number } },
  corner: { x: number; y: number },
  oppositeCorner: { x: number; y: number }
) {
  // convert the coordinates of the click to canvas space
  // keep track of whether an Outcome was selected
  let clickedAddresses = {}
  Object.keys(outcomeCoordinates)
    // .map((actionHash) => outcomes[actionHash])
    .forEach((actionHash) => {
      // convert the topLeft and bottomRight points of the outcome to canvas
      const coords = outcomeCoordinates[actionHash]
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
        clickedAddresses[actionHash] = 1
      }
    })
  return Object.keys(clickedAddresses)
}
