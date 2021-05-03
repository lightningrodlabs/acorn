import { goalWidth, getGoalHeight, goalHeight } from './dimensions'
import layoutFormula from './layoutFormula'
import { coordsPageToCanvas } from './coordinateSystems'
import linePoint from 'intersects/line-point'
import { calculateEdgeCoordsByGoalCoords } from './drawEdge'

export function checkForEdgeAtCoordinates(
  ctx,
  translate,
  scale,
  goalCoordinates,
  state,
  mouseX,
  mouseY
) {
  // get coordinates of all goals

  const {
    ui: { activeProject },
  } = state
  const edges = state.projects.edges[activeProject] || {}
  const goals = state.projects.goals[activeProject] || {}
  // convert the coordinates of the click to canvas space
  const convertedMouse = coordsPageToCanvas(
    {
      x: mouseX,
      y: mouseY,
    },
    translate,
    scale
  )

  // keep track of whether an edge intersects the mouse
  let overEdgeAddress
  Object.keys(edges)
    .map(address => edges[address])
    .forEach(edge => {
      const parentGoalCoords = goalCoordinates[edge.parent_address]
      const childGoalCoords = goalCoordinates[edge.child_address]
      const parentGoalText = goals[edge.parent_address]
        ? goals[edge.parent_address].content
        : ''

      // get the coordinates for the edge end points
      const [
        childEdgeCoords,
        parentEdgeCoords,
      ] = calculateEdgeCoordsByGoalCoords(
        childGoalCoords,
        parentGoalCoords,
        parentGoalText,
        ctx
      )
      // if mouse intersects with the line
      if (
        linePoint(
          childEdgeCoords.x,
          childEdgeCoords.y,
          parentEdgeCoords.x,
          parentEdgeCoords.y,
          convertedMouse.x,
          convertedMouse.y
        )
      ) {
        // set the overEdgeAddress to this edge address
        overEdgeAddress = edge.address
      }
    })
  return overEdgeAddress
}

export function checkForGoalAtCoordinates(
  ctx,
  translate,
  scale,
  goalCoordinates,
  state,
  clickX,
  clickY
) {
  const {
    ui: { activeProject },
  } = state
  const goals = state.projects.goals[activeProject] || {}
  // convert the coordinates of the click to canvas space
  const convertedClick = coordsPageToCanvas(
    {
      x: clickX,
      y: clickY,
    },
    translate,
    scale
  )

  // keep track of whether a goal was selected
  let clickedAddress
  Object.keys(goals)
    .map(address => goals[address])
    .forEach(goal => {
      // convert the topLeft and bottomRight points of the goal to canvas
      const coords = goalCoordinates[goal.address]
      const bottomRight = {
        x: coords.x + goalWidth,
        y: coords.y + getGoalHeight(ctx, goal.content),
      }

      // if click occurred within the box of a Goal
      if (
        convertedClick.x >= coords.x &&
        (convertedClick.x <= bottomRight.x) & (convertedClick.y >= coords.y) &&
        convertedClick.y <= bottomRight.y
      ) {
        clickedAddress = goal.address
      }
    })
  return clickedAddress
}

export function checkForGoalAtCoordinatesInBox(
  goalCoordinates,
  state,
  convertedClick,
  convertedIni
) {
  const {
    ui: { activeProject },
  } = state
  const goals = state.projects.goals[activeProject] || {}
  // convert the coordinates of the click to canvas space
  // keep track of whether a goal was selected
  let clickedAddresses = {}
  Object.keys(goals)
    .map(address => goals[address])
    .forEach(goal => {
      // convert the topLeft and bottomRight points of the goal to canvas
      const coords = goalCoordinates[goal.address]
      const bottomRight = {
        x: coords.x + goalWidth,
        y: coords.y + goalHeight,
      }

      // if click occurred within the box of a Goal
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
        clickedAddresses[goal.address] = 1
      }
    })
  return Object.keys(clickedAddresses)
}
