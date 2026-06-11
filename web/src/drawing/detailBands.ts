import { ActionHashB64 } from '../types/shared'
import { Graph } from '../redux/persistent/projects/outcomes/outcomesAsGraph'
import { ComputedOutcome } from '../types'

/*
  Degree-of-Interest (DOI) based focus+context rendering, after
  Card & Nation's "Degree-of-Interest Trees" (AVI 2002).

  When a focus Outcome is set, every Outcome in the project is assigned
  a discrete "detail band" based on its tree-relationship to the focus:
  full detail at and around the focus, progressively less detail
  (but still readable content, never just scaled-down cards) further
  away, and full elision of deep, distant branches, whose existence is
  still communicated by the descendants achievement status (e.g. 3/17)
  on their closest visible ancestor.

  The bands also guarantee visibility of the highest level Outcomes
  (roots and their direct children) since, like the path of ancestors
  of the focus, they are the most important context to retain at any
  distance from the focus.
*/

export enum DetailBand {
  // render the card with all of its content
  Full = 'Full',
  // render the card with statement (large font), progress and counts,
  // but without lower level detail like tags, assignees and time
  Summary = 'Summary',
  // render the card with just an abbreviated statement at a large font
  // plus the descendants achievement status counts
  Chip = 'Chip',
  // don't render the card at all. its closest visible ancestor will be
  // treated as collapsed, and so will summarize this card via its
  // descendant counts
  Hidden = 'Hidden',
}

export interface DetailBandsState {
  [outcomeActionHash: ActionHashB64]: DetailBand
}

// effective zoom levels, which plug into the existing zoom-threshold
// based level-of-detail rendering logic (fonts, element visibility)
// in drawOutcome and dimensions
const SUMMARY_EFFECTIVE_ZOOM = 0.45
const CHIP_EFFECTIVE_ZOOM = 0.25

// Given a band, produce the zoom level that the card should be
// measured and rendered AS IF the canvas were at, regardless of the
// real zoom level. Full detail cards always render their complete
// content; Summary and Chip cards always render their reduced
// content, with the larger "readable when zoomed out" fonts.
//
// Small scope Outcomes get narrower cards at low zoom levels, which
// can't fit the extra large Chip font, so they bottom out at the
// Summary level of detail.
export function bandEffectiveZoom(
  band: DetailBand | undefined,
  zoomLevel: number,
  isSmallScope: boolean = false
): number {
  switch (band) {
    case DetailBand.Full:
      return Math.max(zoomLevel, 1)
    case DetailBand.Summary:
      return SUMMARY_EFFECTIVE_ZOOM
    case DetailBand.Chip:
      return isSmallScope ? SUMMARY_EFFECTIVE_ZOOM : CHIP_EFFECTIVE_ZOOM
    default:
      // no band computed for this Outcome (or Hidden, which is
      // never drawn anyway): defer to the real zoom level
      return zoomLevel
  }
}

// the lowest on-screen zoom equivalent each band is allowed to be
// seen at. when the real zoom drops below this, the card is scaled UP
// in canvas space to compensate (see bandCanvasScale), so that the
// focus and its context remain readable at any zoom level, like a
// magnifying glass held over the focus point
const FULL_MIN_SCREEN_ZOOM = 0.75
const SUMMARY_MIN_SCREEN_ZOOM = 0.4
const CHIP_MIN_SCREEN_ZOOM = 0.25
// don't blow cards up endlessly at the most extreme zoom-outs
const MAX_CANVAS_SCALE = 20

// Given a band, produce a multiplier for the canvas-space size of the
// card. 1 at readable zoom levels. as the user zooms out, cards grow
// in canvas space to hold a minimum on-screen size, with the focus
// (Full) staying the largest and most readable, Summary and Chip
// falling away progressively
export function bandCanvasScale(
  band: DetailBand | undefined,
  zoomLevel: number
): number {
  let minScreenZoom: number
  switch (band) {
    case DetailBand.Full:
      minScreenZoom = FULL_MIN_SCREEN_ZOOM
      break
    case DetailBand.Summary:
      minScreenZoom = SUMMARY_MIN_SCREEN_ZOOM
      break
    case DetailBand.Chip:
      minScreenZoom = CHIP_MIN_SCREEN_ZOOM
      break
    default:
      return 1
  }
  if (zoomLevel >= minScreenZoom) {
    return 1
  }
  return Math.min(minScreenZoom / zoomLevel, MAX_CANVAS_SCALE)
}

function bandAtLeast(band: DetailBand, atLeast: DetailBand): DetailBand {
  const order = [
    DetailBand.Hidden,
    DetailBand.Chip,
    DetailBand.Summary,
    DetailBand.Full,
  ]
  return order.indexOf(band) >= order.indexOf(atLeast) ? band : atLeast
}

// Compute the detail band for every Outcome in the graph, relative to
// the focus Outcome. Returns null if the focus Outcome isn't part of
// this graph (e.g. it was deleted, or belongs to another project), in
// which case the caller should render without focus+context.
//
// The rules, where the "spine" is the focus plus its chain of
// ancestors up to its root:
// - spine: Full
// - descendants of the focus: Full at depth 1 below it, Summary at
//   depth 2, Chip at depth 3, Hidden below that
// - branches off the spine (siblings of the focus, aunts/uncles at
//   every level): Summary, their children Chip, Hidden below that
// - guaranteed visibility: roots and their direct children are always
//   at least Summary, even in trees unrelated to the focus
// - everything else: Hidden
export default function computeDetailBands(
  graph: Graph,
  focusOutcomeActionHash: ActionHashB64
): DetailBandsState | null {
  const { computedOutcomesKeyed, computedOutcomesAsTree } = graph.outcomes
  if (!computedOutcomesKeyed[focusOutcomeActionHash]) {
    return null
  }

  // walk the trees once to learn each node's parent and depth
  const parents: { [actionHash: ActionHashB64]: ActionHashB64 } = {}
  const depths: { [actionHash: ActionHashB64]: number } = {}
  function walk(outcome: ComputedOutcome, depth: number) {
    // only record the first occurrence, in case an Outcome
    // appears in more than one place (multiple parents)
    if (depths[outcome.actionHash] === undefined) {
      depths[outcome.actionHash] = depth
      outcome.children.forEach((child) => {
        parents[child.actionHash] = outcome.actionHash
        walk(child, depth + 1)
      })
    }
  }
  computedOutcomesAsTree.forEach((tree) => walk(tree, 0))

  // index the spine: the focus and each of its ancestors
  const spineIndex: { [actionHash: ActionHashB64]: number } = {}
  let spineWalker: ActionHashB64 | undefined = focusOutcomeActionHash
  let spinePosition = 0
  while (spineWalker !== undefined) {
    spineIndex[spineWalker] = spinePosition
    spineWalker = parents[spineWalker]
    spinePosition++
  }

  const bands: DetailBandsState = {}
  Object.keys(computedOutcomesKeyed).forEach((actionHash) => {
    // find the closest ancestor (or self) that is on the spine,
    // counting the steps up to it
    let stepsBelowSpine = 0
    let walker: ActionHashB64 | undefined = actionHash
    while (walker !== undefined && spineIndex[walker] === undefined) {
      walker = parents[walker]
      stepsBelowSpine++
    }

    let band: DetailBand
    if (walker === undefined) {
      // no relationship to the focus: a different tree
      band = DetailBand.Hidden
    } else if (stepsBelowSpine === 0) {
      // the focus itself, or one of its ancestors
      band = DetailBand.Full
    } else if (spineIndex[walker] === 0) {
      // a descendant of the focus
      band =
        stepsBelowSpine === 1
          ? DetailBand.Full
          : stepsBelowSpine === 2
          ? DetailBand.Summary
          : stepsBelowSpine === 3
          ? DetailBand.Chip
          : DetailBand.Hidden
    } else {
      // hangs off the spine above the focus: a sibling of the focus,
      // or an aunt/uncle branch at some level
      band =
        stepsBelowSpine === 1
          ? DetailBand.Summary
          : stepsBelowSpine === 2
          ? DetailBand.Chip
          : DetailBand.Hidden
    }

    // guaranteed visibility for the highest level Outcomes:
    // the further away you are, the more important it is to still be
    // able to fully read the highest level goals
    if (depths[actionHash] !== undefined && depths[actionHash] <= 1) {
      band = bandAtLeast(band, DetailBand.Summary)
    }

    bands[actionHash] = band
  })

  return bands
}

// Outcomes all of whose children are Hidden should be laid out and
// rendered as if collapsed: their children get no coordinates, and the
// card itself summarizes the elided subtree via its descendants
// achievement status counts. Returns an object merge-able into the
// user-chosen collapsedOutcomes.
export function collapsedByDetailBands(
  graph: Graph,
  bands: DetailBandsState
): { [outcomeActionHash: ActionHashB64]: boolean } {
  const collapsed: { [outcomeActionHash: ActionHashB64]: boolean } = {}
  Object.keys(graph.outcomes.computedOutcomesKeyed).forEach((actionHash) => {
    const outcome = graph.outcomes.computedOutcomesKeyed[actionHash]
    if (
      bands[actionHash] !== DetailBand.Hidden &&
      outcome.children.length > 0 &&
      outcome.children.every(
        (child) => bands[child.actionHash] === DetailBand.Hidden
      )
    ) {
      collapsed[actionHash] = true
    }
  })
  return collapsed
}
