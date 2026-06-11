import {
  parseFields,
  serializeFields,
  getOutcomeStatement,
  setOutcomeStatement,
  setField,
  orderedFieldKeys,
  OutcomeFields,
} from '../src/outcomeFields'

describe('outcomeFields representation', () => {
  test('legacy plain-text description becomes fields.outcome', () => {
    const legacy = 'A fuller statement of what should become true.'
    expect(parseFields(legacy)).toEqual({ outcome: legacy })
  })

  test('empty description yields an empty outcome', () => {
    expect(parseFields('')).toEqual({ outcome: '' })
  })

  test('a stored fields JSON parses back to the same fields object', () => {
    const fields: OutcomeFields = {
      outcome: 'Every node stores typed fields.',
      spec: 'Introduce an extensible fields object.',
      completionCriteria: [{ statement: 'round-trips', evaluator: 'executable' }],
    }
    expect(parseFields(serializeFields(fields))).toEqual(fields)
  })

  test('round-trip is a stable fixpoint (serialize ∘ parse ∘ serialize)', () => {
    const fields: OutcomeFields = {
      outcome: 'x',
      signalType: 'gradient',
      artifacts: [{ type: 'doc', label: 'spec', uri: '' }],
    }
    const once = serializeFields(fields)
    expect(serializeFields(parseFields(once))).toBe(once)
  })

  test('serialize emits known keys in canonical order regardless of input order', () => {
    const stored = serializeFields({ artifacts: [], spec: 's', outcome: 'o' } as OutcomeFields)
    expect(Object.keys(JSON.parse(stored))).toEqual(['outcome', 'spec', 'artifacts'])
  })

  test('unknown future field types are preserved verbatim (extensibility)', () => {
    const withFuture = { outcome: 'o', reviewChecklist: ['a', 'b'] } as OutcomeFields
    const back = parseFields(serializeFields(withFuture))
    expect(back.reviewChecklist).toEqual(['a', 'b'])
  })

  test('a JSON object WITHOUT an outcome key is conservatively treated as legacy text', () => {
    const weird = '{"foo":1}'
    expect(parseFields(weird)).toEqual({ outcome: weird })
  })

  test('getOutcomeStatement returns the human statement from stored fields', () => {
    expect(getOutcomeStatement(serializeFields({ outcome: 'hello', spec: 'x' }))).toBe('hello')
  })

  test('setOutcomeStatement replaces only the outcome, preserving other fields', () => {
    const stored = serializeFields({
      outcome: 'old',
      spec: 'keep me',
      artifacts: [{ type: 'doc', label: 'd', uri: '' }],
    })
    const updated = parseFields(setOutcomeStatement(stored, 'new'))
    expect(updated.outcome).toBe('new')
    expect(updated.spec).toBe('keep me')
    expect(updated.artifacts).toEqual([{ type: 'doc', label: 'd', uri: '' }])
  })

  test('setOutcomeStatement on a legacy plain-text description yields a fields object', () => {
    // editing the statement of a not-yet-migrated node migrates it in place
    const updated = parseFields(setOutcomeStatement('legacy prose', 'edited'))
    expect(updated).toEqual({ outcome: 'edited' })
  })

  test('setField updates one field and preserves the others', () => {
    const stored = serializeFields({ outcome: 'o', spec: 'old spec' })
    const updated = parseFields(setField(stored, 'spec', 'new spec'))
    expect(updated.outcome).toBe('o')
    expect(updated.spec).toBe('new spec')
  })

  test('setField can write a structured field (artifacts)', () => {
    const stored = serializeFields({ outcome: 'o' })
    const arts = [{ type: 'doc', label: 'd', uri: 'u' }]
    expect(parseFields(setField(stored, 'artifacts', arts)).artifacts).toEqual(arts)
  })

  test('orderedFieldKeys returns present known keys in canonical order, extras last', () => {
    const fields = {
      artifacts: [],
      reviewChecklist: ['x'], // unknown/future
      spec: 's',
      outcome: 'o',
    } as OutcomeFields
    expect(orderedFieldKeys(fields)).toEqual(['outcome', 'spec', 'artifacts', 'reviewChecklist'])
  })

  test('editing round-trips: the a2 completion criterion holds', () => {
    // parseFields(description).outcome returns exactly what was typed
    let description = serializeFields({ outcome: 'first', spec: 's' })
    description = setOutcomeStatement(description, 'a freshly typed statement')
    expect(parseFields(description).outcome).toBe('a freshly typed statement')
  })

  test('a description authored by genClarityTree.ts parses correctly', () => {
    // mirrors exactly what the generator writes into description
    const desc = JSON.stringify(
      { outcome: 'o', completionCriteria: [{ statement: 's', evaluator: 'human' }] },
      null,
      2
    )
    const f = parseFields(desc)
    expect(f.outcome).toBe('o')
    expect(f.completionCriteria?.[0].evaluator).toBe('human')
  })
})
