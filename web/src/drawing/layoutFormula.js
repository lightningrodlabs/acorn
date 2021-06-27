import dagre from 'dagre'
import { goalWidth, getGoalHeight } from './dimensions'
import goalsAsTrees from '../projects/goals/goalsAsTrees'

const VERTICAL_SPACING = 50

function getBoundingRec(goal, allGoalCoordinates) {
  const origCoord = allGoalCoordinates[goal.address]
  let boundTop = origCoord.y
  let boundRight = origCoord.x
  let boundBottom = origCoord.y
  let boundLeft = origCoord.x

  function updateLimits(goalToCheck) {
    const topLeftCoord = allGoalCoordinates[goalToCheck.address]
    const width = goalWidth
    const height = getGoalHeight(null, goalToCheck.content)
    const top = topLeftCoord.y
    const left = topLeftCoord.x
    const right = left + width
    const bottom = top + height
    boundTop = Math.min(top, boundTop)
    boundRight = Math.max(right, boundRight)
    boundBottom = Math.max(bottom, boundBottom)
    boundLeft = Math.min(left, boundLeft)
    goalToCheck.children.forEach(updateLimits)
  }
  updateLimits(goal)

  const padding = 15
  boundTop -= padding
  boundRight += padding
  boundBottom += padding
  boundLeft -= padding

  return [boundTop, boundRight, boundBottom, boundLeft]
}

export { getBoundingRec }

function layoutForTree(tree) {
  // create a graph
  const graph = new dagre.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function () {
      return {}
    })

  // use recursion to add each goal as a node in the graph
  function addGoal(goal) {
    graph.setNode(goal.address, {
      width: goalWidth,
      height: getGoalHeight(null, goal.content) + VERTICAL_SPACING,
    })
    goal.children.forEach(childGoal => {
      addGoal(childGoal)
      // add each edge as an edge in the graph
      graph.setEdge(goal.address, childGoal.address)
    })
  }
  // kick off the recursion
  addGoal(tree)

  // run the layout algorithm, which will set an x and y property onto
  // each node
  dagre.layout(graph)
  // create a coordinates object
  const coordinates = {}
  // update the coordinates object
  graph.nodes().forEach(address => {
    coordinates[address] = {
      x: graph.node(address).x,
      y: graph.node(address).y,
    }
  })
  return coordinates
}

export default function layoutFormula(data) {
  const trees = goalsAsTrees(data)

  let coordinates = {}
  const layouts = trees.map(tree => ({
    goal: tree,
    layout: layoutForTree(tree),
  }))
  const HORIZONTAL_TREE_SPACING = 15
  // coordinates will be adjusted each time through this iteration
  layouts.forEach((tree, index) => {
    // in the case of the first one, let it stay where it is
    if (index === 0) {
      coordinates = tree.layout
    } else {
      // in the case of all the rest, push it right, according to wherever the last one was positioned + spacing
      const lastTree = layouts[index - 1].goal
      const [top, right, bottom, left] = getBoundingRec(lastTree, coordinates)
      const adjusted = {}
      Object.keys(tree.layout).forEach(coordKey => {
        adjusted[coordKey] = {
          x: tree.layout[coordKey].x + right + HORIZONTAL_TREE_SPACING,
          y: tree.layout[coordKey].y,
        }
      })
      coordinates = {
        ...coordinates,
        ...adjusted,
      }
    }
  })

  return coordinates
}
