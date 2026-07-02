import { OutcomeArtifact } from '../src/outcomeFields'
import {
  artifactGroup,
  groupArtifacts,
  OUTPUT_ARTIFACT_TYPES,
} from '../src/artifactGroups'

const a = (type: string, label = 'x', uri = 'x'): OutcomeArtifact => ({ type, label, uri })

describe('artifactGroup', () => {
  it('classifies workproduct/output types as output', () => {
    expect(artifactGroup(a('workproduct'))).toBe('output')
    expect(artifactGroup(a('output'))).toBe('output')
  })

  it('is case-insensitive and trims the type', () => {
    expect(artifactGroup(a('  WorkProduct '))).toBe('output')
    expect(OUTPUT_ARTIFACT_TYPES.has('workproduct')).toBe(true)
  })

  it('classifies clarity-input types (design, doc, reference, conversation) as input', () => {
    expect(artifactGroup(a('design'))).toBe('input')
    expect(artifactGroup(a('doc'))).toBe('input')
    expect(artifactGroup(a('reference'))).toBe('input')
    expect(artifactGroup(a('conversation'))).toBe('input')
    expect(artifactGroup(a('conversation-ref'))).toBe('input')
  })

  it('treats an empty/unknown type as an input (safe default)', () => {
    expect(artifactGroup(a(''))).toBe('input')
    expect(artifactGroup(a('something-new'))).toBe('input')
  })
})

describe('groupArtifacts', () => {
  it('partitions into input/output preserving original indices and order', () => {
    const items = [
      a('design'), // 0 input
      a('workproduct'), // 1 output
      a('reference'), // 2 input
      a('output'), // 3 output
    ]
    const { input, output } = groupArtifacts(items)
    expect(input.map((g) => g.index)).toEqual([0, 2])
    expect(output.map((g) => g.index)).toEqual([1, 3])
    // the paired artifact is the one at that original index
    expect(input[0].artifact).toBe(items[0])
    expect(output[1].artifact).toBe(items[3])
  })

  it('handles all-input, all-output, and empty lists', () => {
    expect(groupArtifacts([a('design'), a('doc')]).output).toEqual([])
    expect(groupArtifacts([a('workproduct')]).input).toEqual([])
    expect(groupArtifacts([])).toEqual({ input: [], output: [] })
    expect(groupArtifacts(undefined as unknown as OutcomeArtifact[])).toEqual({
      input: [],
      output: [],
    })
  })
})
