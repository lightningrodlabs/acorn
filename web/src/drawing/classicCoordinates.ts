import { ActionHashB64 } from '@holochain/client'
import {
  DimensionsState,
  CoordinatesState,
} from '../redux/ephemeral/layout/state-type'
import { Graph } from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import { ComputedOutcome, Connection } from '../types'
import { getBoundingRec } from './layoutFormula'
import checkOutcomeAgainstViewingFilters from './checkOutcomeAgainstViewingFilters'
import * as flextree from 'd3-flextree'
import { WithActionHash } from '../types/shared'

const fl = flextree.flextree

type ContentAndConnection = { content: string, connection: WithActionHash<Connection> }

function layoutForTree(
  tree: ComputedOutcome,
  allOutcomeDimensions: DimensionsState,
  projectCollapsedOutcomes: {
    [outcomeActionHash: ActionHashB64]: boolean
  },
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): CoordinatesState {
  const layout = fl().spacing((nodeA, nodeB) => {
    return nodeA.path(nodeB).length * 40
  })

  const layoutTree = {}
  // use recursion to add each outcome as a node in the graph
  function addOutcome(outcome: ComputedOutcome, node: any, level: number) {
    let numDescendants = 0
    node.children = []
    // Skip over the Outcome if it is included in the list
    // of collapsed Outcomes
    if (!projectCollapsedOutcomes[outcome.actionHash]) {
      outcome.children.forEach((childOutcome) => {
        const childNode = {}
        // filter out children who don't match the viewing filter criteria
        if (
          checkOutcomeAgainstViewingFilters(
            childOutcome,
            hiddenSmalls,
            hiddenAchieved
          )
        ) {
          const descendantCount = addOutcome(childOutcome, childNode, level + 1)
          node.children.push(childNode)
          numDescendants += descendantCount + 1
        }
      })
      // important: sort the children by
      // Connection 'siblingOrder' number
      node.children.sort((a: ContentAndConnection, b: ContentAndConnection) => {
        // if same siblingOrder, sort by content
        if (a.connection.siblingOrder === b.connection.siblingOrder) {
          return a.content < b.content ? -1 : 1
        } else {
          // this sorts them from higher values on the
          // left to lower values on the right
          return a.connection.siblingOrder < b.connection.siblingOrder ? 1 : -1
        }
      })
    }

    const width = allOutcomeDimensions[outcome.actionHash].width
    // to create the dynamic vertical height, we apply
    // a power law to the number of descendants, with a heightened baseline
    // because the number of descendants is a good measure of how wide this tree
    // might be
    const VERTICAL_SPACING = 100
    const height =
      allOutcomeDimensions[outcome.actionHash].height +
      (numDescendants > 0 ? Math.pow(numDescendants + 25, 1.5) : 60) +
      VERTICAL_SPACING

    node.actionHash = outcome.actionHash
    node.connection = outcome.connection
    node.content = outcome.content
    node.size = [width, height]

    return numDescendants
  }
  // kick off the recursion
  addOutcome(tree, layoutTree, 1)

  const flTree = layout.hierarchy(layoutTree)
  // run the layout algorithm, which will set an x and y property onto
  // each node
  layout(flTree)
  // create a coordinates object
  const coordinates = {}
  // update the coordinates object
  flTree.each((node) => {
    // coordinates will represent the top left,
    // but as-is they represent the center, so re-adjust them by half
    // the width of the outcome
    coordinates[node.data.actionHash] = {
      x: node.x - node.size[0] / 2,
      y: node.y,
    }
  })
  return coordinates
}

export default function calculateCoordinatesForClassic(
  graph: Graph,
  allOutcomeDimensions: DimensionsState,
  collapsedOutcomes: {
    [outcomeActionHash: string]: boolean
  },
  hiddenSmalls: boolean,
  hiddenAchieved: boolean
): CoordinatesState {
  // based on the dimensions, determine what the layout of each
  // distinct tree will be
  const layouts = graph.outcomes.computedOutcomesAsTree
    .filter((computedOutcome) => {
      // filter out trees which have been hidden
      return checkOutcomeAgainstViewingFilters(
        computedOutcome,
        hiddenSmalls,
        hiddenAchieved
      )
    })
    .map((tree) => ({
      outcome: tree,
      layout: layoutForTree(
        tree,
        allOutcomeDimensions,
        collapsedOutcomes,
        hiddenSmalls,
        hiddenAchieved
      ),
    }))
  const HORIZONTAL_TREE_SPACING = 100
  let coordinates: CoordinatesState = {}
  // coordinates will be adjusted each time through this iteration
  layouts.forEach((tree, index) => {
    // in the case of the first one, let it stay where it is
    if (index === 0) {
      const adjusted: CoordinatesState = {}
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
      const [_ltop, lastTreeRight, _lbottom, _lleft] = getBoundingRec(
        layouts[index - 1].outcome,
        coordinates,
        allOutcomeDimensions
      )
      const [_ttop, _tright, _tbottom, thisTreeLeft] = getBoundingRec(
        tree.outcome,
        tree.layout,
        allOutcomeDimensions
      )
      const adjusted: CoordinatesState = {}
      const yOffset = -1 * tree.layout[tree.outcome.actionHash].y
      const xOffset = lastTreeRight - thisTreeLeft + HORIZONTAL_TREE_SPACING
      Object.keys(tree.layout).forEach((coordKey) => {
        // adjust the coordinate by the xOffset and the yOffset
        adjusted[coordKey] = {
          x: xOffset + tree.layout[coordKey].x,
          y: yOffset + tree.layout[coordKey].y,
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
