import { coordsPageToCanvas } from './coordinateSystems'
import {
  calculateConnectionCoordsByOutcomeCoords,
  pathForConnection,
} from './drawConnection'
import { ActionHashB64 } from '../types/shared'
import { ComputedOutcome, RelationInput } from '../types'
import { ProjectConnectionsState } from '../redux/persistent/projects/connections/reducer'
import {
  CoordinatesState,
  DimensionsState,
} from '../redux/ephemeral/layout/state-type'

export function checkForConnectionAtCoordinates(
  translate: { x: number; y: number },
  scale: number,
  outcomeCoordinates: CoordinatesState,
  outcomeDimensions: DimensionsState,
  connections: ProjectConnectionsState,
  mouseX: number,
  mouseY: number,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome }
) {
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
      const parentOutcomeDimensions =
        outcomeDimensions[connection.parentActionHash]
      const childOutcomeDimensions =
        outcomeDimensions[connection.childActionHash]
      const childOutcome = outcomes[connection.childActionHash]
      const parentOutcome = outcomes[connection.parentActionHash]

      // do not proceed if we don't have coordinates
      // for the outcomes of this connection (yet)
      if (
        !parentOutcomeCoords ||
        !childOutcomeCoords ||
        !childOutcome ||
        !parentOutcome
      ) {
        return
      }

      // get the coordinates for the connection end points
      const [
        childConnectionCoords,
        parentConnectionCoords,
      ] = calculateConnectionCoordsByOutcomeCoords(
        childOutcomeCoords,
        childOutcomeDimensions,
        parentOutcomeCoords,
        parentOutcomeDimensions,
        RelationInput.ExistingOutcomeAsChild
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
  translate: { x: number; y: number },
  scale: number,
  outcomesCoordinates: CoordinatesState,
  outcomesDimensions: DimensionsState,
  mouseX: number,
  mouseY: number,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  extraVerticalPadding: number = 0 // used to make detecting 'hovering' more generous/forgiving
) {
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
    const outcomeCoordinate = outcomesCoordinates[outcome.actionHash]
    const outcomeDimensions = outcomesDimensions[outcome.actionHash]
    // do not proceed if we don't have coordinates or dimensions
    // for the outcome (yet)
    if (!(outcomeCoordinate && outcomeDimensions)) return false

    const topLeft = {
      x: outcomeCoordinate.x,
      y: outcomeCoordinate.y - extraVerticalPadding,
    }

    const bottomRight = {
      x: topLeft.x + outcomeDimensions.width,
      y: outcomeCoordinate.y + outcomeDimensions.height + extraVerticalPadding,
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
  outcomesCoordinates: CoordinatesState,
  outcomesDimensions: DimensionsState,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  corner: { x: number; y: number },
  oppositeCorner: { x: number; y: number }
) {
  // keep track of whether an Outcome was selected
  let clickedAddresses = {}
  Object.keys(outcomes).forEach((actionHash) => {
    const outcome = outcomes[actionHash]
    const outcomeCoordinate = outcomesCoordinates[outcome.actionHash]
    const outcomeDimensions = outcomesDimensions[outcome.actionHash]
    // do not proceed if we don't have coordinates
    // for the outcome (yet)
    if (!(outcomeCoordinate && outcomeDimensions)) return false

    const bottomRight = {
      x: outcomeCoordinate.x + outcomeDimensions.width,
      y: outcomeCoordinate.y + outcomeDimensions.height,
    }

    // if box fully encapsulates an Outcome
    if (
      (oppositeCorner.x < outcomeCoordinate.x &&
        bottomRight.x < corner.x &&
        oppositeCorner.y < outcomeCoordinate.y &&
        bottomRight.y < corner.y) ||
      (oppositeCorner.x > bottomRight.x &&
        outcomeCoordinate.x > corner.x &&
        oppositeCorner.y > bottomRight.y &&
        outcomeCoordinate.y > corner.y) ||
      (oppositeCorner.x > bottomRight.x &&
        outcomeCoordinate.x > corner.x &&
        oppositeCorner.y < outcomeCoordinate.y &&
        bottomRight.y < corner.y) ||
      (oppositeCorner.x < outcomeCoordinate.x &&
        bottomRight.x < corner.x &&
        oppositeCorner.y > bottomRight.y &&
        outcomeCoordinate.y > corner.y)
    ) {
      clickedAddresses[actionHash] = 1
    }
  })
  return Object.keys(clickedAddresses)
}
