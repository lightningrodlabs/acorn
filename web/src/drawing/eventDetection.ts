import { outcomeWidth, getOutcomeHeight, outcomeHeight } from './dimensions'
import { coordsPageToCanvas } from './coordinateSystems'
import linePoint from 'intersects/line-point'
import { calculateConnectionCoordsByOutcomeCoords } from './drawConnection'
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
      // if mouse intersects with the line
      if (
        linePoint(
          childConnectionCoords.x,
          childConnectionCoords.y,
          parentConnectionCoords.x,
          parentConnectionCoords.y,
          convertedMouse.x,
          convertedMouse.y
        )
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

  // keep track of whether a outcome was selected
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

      // if click occurred within the box of a Outcome
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
  convertedClick,
  convertedIni,
  outcomes: { [headerHash: HeaderHashB64]: ComputedOutcome }
) {
  // convert the coordinates of the click to canvas space
  // keep track of whether a outcome was selected
  let clickedAddresses = {}
  Object.keys(outcomes)
    .map((headerHash) => outcomes[headerHash])
    .forEach((outcome) => {
      // convert the topLeft and bottomRight points of the outcome to canvas
      const coords = outcomeCoordinates[outcome.headerHash]
      const bottomRight = {
        x: coords.x + outcomeWidth,
        y: coords.y + outcomeHeight,
      }

      // if click occurred within the box of a Outcome
      if (
        (convertedIni.x < coords.x &&
          bottomRight.x < convertedClick.x &&
          convertedIni.y < coords.y &&
          bottomRight.y < convertedClick.y) ||
        (convertedIni.x > bottomRight.x &&
          coords.x > convertedClick.x &&
          convertedIni.y > bottomRight.y &&
          coords.y > convertedClick.y) ||
        (convertedIni.x > bottomRight.x &&
          coords.x > convertedClick.x &&
          convertedIni.y < coords.y &&
          bottomRight.y < convertedClick.y) ||
        (convertedIni.x < coords.x &&
          bottomRight.x < convertedClick.x &&
          convertedIni.y > bottomRight.y &&
          coords.y > convertedClick.y)
      ) {
        clickedAddresses[outcome.headerHash] = 1
      }
    })
  return Object.keys(clickedAddresses)
}
