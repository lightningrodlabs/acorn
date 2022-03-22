import { outcomeWidth, getOutcomeHeight, outcomeHeight } from './dimensions'
import layoutFormula from './layoutFormula'
import { coordsPageToCanvas } from './coordinateSystems'
import linePoint from 'intersects/line-point'
import { calculateConnectionCoordsByOutcomeCoords } from './drawConnection'

export function checkForConnectionAtCoordinates(
  ctx,
  translate,
  scale,
  outcomeCoordinates,
  state,
  mouseX,
  mouseY
) {
  // get coordinates of all outcomes

  const {
    ui: { activeProject },
  } = state
  const connections = state.projects.connections[activeProject] || {}
  const outcomes = state.projects.outcomes[activeProject] || {}
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
  let overConnectionAddress
  Object.keys(connections)
    .map(headerHash => connections[headerHash])
    .forEach(connection => {
      const parentOutcomeCoords = outcomeCoordinates[connection.parentAddress]
      const childOutcomeCoords = outcomeCoordinates[connection.childAddress]
      const parentOutcomeText = outcomes[connection.parentAddress]
        ? outcomes[connection.parentAddress].content
        : ''

      // do not proceed if we don't have coordinates
      // for the outcomes of this connection (yet)
      if (!parentOutcomeCoords || !childOutcomeCoords) {
        return
      }

      // get the coordinates for the connection end points
      const [
        childConnectionCoords,
        parentConnectionCoords,
      ] = calculateConnectionCoordsByOutcomeCoords(
        childOutcomeCoords,
        parentOutcomeCoords,
        parentOutcomeText,
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
  ctx,
  translate,
  scale,
  outcomeCoordinates,
  state,
  clickX,
  clickY
) {
  const {
    ui: { activeProject },
  } = state
  const outcomes = state.projects.outcomes[activeProject] || {}
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
  let clickedAddress
  Object.keys(outcomes)
    .map(headerHash => outcomes[headerHash])
    .forEach(outcome => {
      // convert the topLeft and bottomRight points of the outcome to canvas
      const coords = outcomeCoordinates[outcome.headerHash]

      // do not proceed if we don't have coordinates
      // for the outcome (yet)
      if (!coords) return

      const bottomRight = {
        x: coords.x + outcomeWidth,
        y: coords.y + getOutcomeHeight(ctx, outcome.content),
      }

      // if click occurred within the box of a Outcome
      if (
        convertedClick.x >= coords.x &&
        (convertedClick.x <= bottomRight.x) && (convertedClick.y >= coords.y) &&
        convertedClick.y <= bottomRight.y
      ) {
        clickedAddress = outcome.headerHash
      }
    })
  return clickedAddress
}

export function checkForOutcomeAtCoordinatesInBox(
  outcomeCoordinates,
  state,
  convertedClick,
  convertedIni
) {
  const {
    ui: { activeProject },
  } = state
  const outcomes = state.projects.outcomes[activeProject] || {}
  // convert the coordinates of the click to canvas space
  // keep track of whether a outcome was selected
  let clickedAddresses = {}
  Object.keys(outcomes)
    .map(headerHash => outcomes[headerHash])
    .forEach(outcome => {
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
