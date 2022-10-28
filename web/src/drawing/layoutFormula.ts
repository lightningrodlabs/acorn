import * as flextree from 'd3-flextree'
import { getOutcomeWidth, getOutcomeHeight } from './dimensions'
import outcomesAsTrees, {
  TreeData,
} from '../redux/persistent/projects/outcomes/outcomesAsTrees'
import { ComputedOutcome, ComputedScope, Tag } from '../types'
import { ActionHashB64, WithActionHash } from '../types/shared'

const fl = flextree.flextree

const VERTICAL_SPACING = 160

function getBoundingRec(
  outcome: ComputedOutcome,
  allOutcomeCoordinates: {
    [actionHash: ActionHashB64]: { x: number; y: number }
  },
  allOutcomeDimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  }
) {
  const origCoord = allOutcomeCoordinates[outcome.actionHash]
  if (!origCoord) {
    return
  }
  let boundTop = origCoord.y
  let boundRight = origCoord.x
  let boundBottom = origCoord.y
  let boundLeft = origCoord.x

  function updateLimits(outcomeToCheck) {
    const topLeftCoord = allOutcomeCoordinates[outcomeToCheck.actionHash]
    if (!topLeftCoord) {
      return
    }
    const width = allOutcomeDimensions[outcome.actionHash].width
    const height = allOutcomeDimensions[outcome.actionHash].height
    const top = topLeftCoord.y
    const left = topLeftCoord.x
    const right = left + width
    const bottom = top + height
    boundTop = Math.min(top, boundTop)
    boundRight = Math.max(right, boundRight)
    boundBottom = Math.max(bottom, boundBottom)
    boundLeft = Math.min(left, boundLeft)
    outcomeToCheck.children.forEach(updateLimits)
  }
  updateLimits(outcome)

  const padding = 15
  boundTop -= padding
  boundRight += padding
  boundBottom += padding
  boundLeft -= padding

  return [boundTop, boundRight, boundBottom, boundLeft]
}

export { getBoundingRec }

export interface Layout {
  [outcomeActionHash: ActionHashB64]: {
    x: number
    y: number
  }
}

function layoutForTree(
  tree: ComputedOutcome,
  allOutcomeDimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  }
): Layout {
  // create a graph
  const layout = fl()

  const layoutTree = {}
  // use recursion to add each outcome as a node in the graph
  function addOutcome(outcome: ComputedOutcome, node: any, level: number) {
    const width = allOutcomeDimensions[outcome.actionHash].width
    const height = allOutcomeDimensions[outcome.actionHash].height // + VERTICAL_SPACING
    node.actionHash = outcome.actionHash
    node.size = [width, height + VERTICAL_SPACING]
    node.children = []
    outcome.children.forEach((childOutcome) => {
      const childNode = {}
      addOutcome(childOutcome, childNode, level + 1)
      node.children.push(childNode)
    })
  }
  // kick off the recursion
  addOutcome(tree, layoutTree, 1)

  const flTree = layout.hierarchy(layoutTree)
  // run the layout algorithm, which will set an x and y property onto
  // each node
  layout(flTree)
  console.log(flTree)
  // create a coordinates object
  const coordinates = {}
  // update the coordinates object
  flTree.each((node) => {
    // coordinates will represent the top left,
    // but as-is they represent the center, so re-adjust them for that
    coordinates[node.data.actionHash] = {
      x: node.x - (node.size[0] / 2),
      y: node.y - (node.size[1] / 2),
    }
  })
  return coordinates
}

export default function layoutFormula(
  data: TreeData,
  zoomLevel: number,
  projectTags: WithActionHash<Tag>[]
): Layout {
  const trees = outcomesAsTrees(data, { withMembers: true })

  let coordinates = {}
  // just do this for efficiency, it's not going to
  // get displayed or rendered anywhere
  const ctx = document.createElement('canvas').getContext('2d')

  // determine what the dimensions of each outcome will be
  let allOutcomeDimensions: {
    [actionHash: ActionHashB64]: { width: number; height: number }
  } = {}
  Object.keys(trees.computedOutcomesKeyed).forEach((outcomeActionHash) => {
    const outcome = trees.computedOutcomesKeyed[outcomeActionHash]
    const width = getOutcomeWidth({ outcome, zoomLevel })
    const height = getOutcomeHeight({
      ctx,
      outcome,
      zoomLevel,
      width,
      projectTags,
    })
    allOutcomeDimensions[outcomeActionHash] = {
      width,
      height,
    }
  })

  // based on the dimensions, determine what the layout of each
  // distinct tree will be
  const layouts = trees.computedOutcomesAsTree.map((tree) => ({
    outcome: tree,
    layout: layoutForTree(tree, allOutcomeDimensions),
  }))
  const HORIZONTAL_TREE_SPACING = 15
  // coordinates will be adjusted each time through this iteration
  layouts.forEach((tree, index) => {
    // in the case of the first one, let it stay where it is
    if (index === 0) {
      const adjusted: Layout = {}
      const offsetFromZero = tree.layout[tree.outcome.actionHash].y
      Object.keys(tree.layout).forEach((coordKey) => {
        adjusted[coordKey] = {
          x: tree.layout[coordKey].x,
          y: tree.layout[coordKey].y - offsetFromZero,
        }
      })
      coordinates = {
        ...adjusted,
      }
    } else {
      // in the case of all the rest, push it right, according to wherever the last one was positioned + spacing
      const lastTree = layouts[index - 1].outcome
      const [top, right, bottom, left] = getBoundingRec(
        lastTree,
        coordinates,
        allOutcomeDimensions
      )
      const adjusted: Layout = {}
      const offsetFromZero = tree.layout[tree.outcome.actionHash].y
      Object.keys(tree.layout).forEach((coordKey) => {
        adjusted[coordKey] = {
          x: tree.layout[coordKey].x + right + HORIZONTAL_TREE_SPACING,
          y: tree.layout[coordKey].y - offsetFromZero,
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
