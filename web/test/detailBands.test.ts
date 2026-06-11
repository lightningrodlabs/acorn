import computeDetailBands, {
  bandCanvasScale,
  bandEffectiveZoom,
  collapsedByDetailBands,
  DetailBand,
} from '../src/drawing/detailBands'
import { ComputedOutcome } from '../src/types'
import { Graph } from '../src/redux/persistent/projects/outcomes/outcomesAsGraph'

// build a minimal ComputedOutcome tree node, just what
// computeDetailBands reads: actionHash and children
function outcome(actionHash: string, children: ComputedOutcome[] = []) {
  return ({
    actionHash,
    content: actionHash,
    children,
  } as unknown) as ComputedOutcome
}

function graphFor(trees: ComputedOutcome[]): Graph {
  const keyed: { [actionHash: string]: ComputedOutcome } = {}
  function walk(node: ComputedOutcome) {
    keyed[node.actionHash] = node
    node.children.forEach(walk)
  }
  trees.forEach(walk)
  return ({
    outcomes: {
      computedOutcomesAsTree: trees,
      computedOutcomesKeyed: keyed,
    },
    connections: {},
  } as unknown) as Graph
}

describe('computeDetailBands', () => {
  /*
    tree under test, with focus on A1:

    R ─ A ─ A1 (focus) ─ A1a ─ A1ai ─ A1aix ─ A1aixDeep
      │   └ A2 ─ A2a ─ A2ai
      └ B ─ B1 ─ B1a
    S ─ S1 ─ S1a      (a separate, unrelated tree)
  */
  const a1aixDeep = outcome('A1aixDeep')
  const a1aix = outcome('A1aix', [a1aixDeep])
  const a1ai = outcome('A1ai', [a1aix])
  const a1a = outcome('A1a', [a1ai])
  const a1 = outcome('A1', [a1a])
  const a2ai = outcome('A2ai')
  const a2a = outcome('A2a', [a2ai])
  const a2 = outcome('A2', [a2a])
  const a = outcome('A', [a1, a2])
  const b1a = outcome('B1a')
  const b1 = outcome('B1', [b1a])
  const b = outcome('B', [b1])
  const r = outcome('R', [a, b])
  const s1a = outcome('S1a')
  const s1 = outcome('S1', [s1a])
  const s = outcome('S', [s1])
  const graph = graphFor([r, s])

  it('returns null when the focus Outcome is not in the graph', () => {
    expect(computeDetailBands(graph, 'not-a-real-hash')).toBeNull()
  })

  it('gives full detail to the focus and its chain of ancestors', () => {
    const bands = computeDetailBands(graph, 'A1')
    expect(bands['A1']).toBe(DetailBand.Full)
    expect(bands['A']).toBe(DetailBand.Full)
    expect(bands['R']).toBe(DetailBand.Full)
  })

  it('steps down detail through the descendants of the focus', () => {
    const bands = computeDetailBands(graph, 'A1')
    expect(bands['A1a']).toBe(DetailBand.Full)
    expect(bands['A1ai']).toBe(DetailBand.Summary)
    expect(bands['A1aix']).toBe(DetailBand.Chip)
    expect(bands['A1aixDeep']).toBe(DetailBand.Hidden)
  })

  it('steps down detail through branches hanging off the spine', () => {
    const bands = computeDetailBands(graph, 'A1')
    // sibling of the focus
    expect(bands['A2']).toBe(DetailBand.Summary)
    expect(bands['A2a']).toBe(DetailBand.Chip)
    expect(bands['A2ai']).toBe(DetailBand.Hidden)
    // uncle branch off the root
    expect(bands['B']).toBe(DetailBand.Summary)
    expect(bands['B1']).toBe(DetailBand.Chip)
    expect(bands['B1a']).toBe(DetailBand.Hidden)
  })

  it('guarantees visibility of the top two levels of unrelated trees', () => {
    const bands = computeDetailBands(graph, 'A1')
    expect(bands['S']).toBe(DetailBand.Summary)
    expect(bands['S1']).toBe(DetailBand.Summary)
    expect(bands['S1a']).toBe(DetailBand.Hidden)
  })

  it('marks Outcomes whose children are all Hidden as collapsed', () => {
    const bands = computeDetailBands(graph, 'A1')
    const collapsed = collapsedByDetailBands(graph, bands)
    expect(collapsed).toEqual({
      A1aix: true,
      A2a: true,
      B1: true,
      S1: true,
    })
  })
})

describe('bandEffectiveZoom', () => {
  it('always renders full detail at the focus, even when zoomed out', () => {
    expect(bandEffectiveZoom(DetailBand.Full, 0.1)).toBe(1)
    expect(bandEffectiveZoom(DetailBand.Full, 1.5)).toBe(1.5)
  })

  it('renders fixed reduced-detail zoom levels for Summary and Chip', () => {
    expect(bandEffectiveZoom(DetailBand.Summary, 0.1)).toBe(0.45)
    expect(bandEffectiveZoom(DetailBand.Summary, 2)).toBe(0.45)
    expect(bandEffectiveZoom(DetailBand.Chip, 0.1)).toBe(0.25)
    expect(bandEffectiveZoom(DetailBand.Chip, 2)).toBe(0.25)
  })

  it('defers to the real zoom level when there is no band', () => {
    expect(bandEffectiveZoom(undefined, 0.33)).toBe(0.33)
  })

  it('keeps Small scope Outcomes at Summary detail even in the Chip band', () => {
    expect(bandEffectiveZoom(DetailBand.Chip, 0.1, true)).toBe(0.45)
  })
})

describe('bandCanvasScale', () => {
  it('does not scale cards at readable zoom levels', () => {
    expect(bandCanvasScale(DetailBand.Full, 1)).toBe(1)
    expect(bandCanvasScale(DetailBand.Full, 0.75)).toBe(1)
    expect(bandCanvasScale(DetailBand.Summary, 0.5)).toBe(1)
    expect(bandCanvasScale(DetailBand.Chip, 0.3)).toBe(1)
  })

  it('scales cards up as the user zooms out, the focus most of all', () => {
    expect(bandCanvasScale(DetailBand.Full, 0.1)).toBeCloseTo(7.5)
    expect(bandCanvasScale(DetailBand.Summary, 0.1)).toBeCloseTo(4)
    expect(bandCanvasScale(DetailBand.Chip, 0.1)).toBeCloseTo(2.5)
  })

  it('caps the scale at the most extreme zoom-outs', () => {
    expect(bandCanvasScale(DetailBand.Full, 0.02)).toBe(20)
  })

  it('does not scale Hidden or band-less cards', () => {
    expect(bandCanvasScale(DetailBand.Hidden, 0.1)).toBe(1)
    expect(bandCanvasScale(undefined, 0.1)).toBe(1)
  })
})
