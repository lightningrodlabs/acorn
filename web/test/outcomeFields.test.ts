import {
  parseFields,
  serializeFields,
  getOutcomeStatement,
  setOutcomeStatement,
  setField,
  addField,
  removeField,
  orderedFieldKeys,
  fieldWidgetRegistry,
  WIDGET_REGISTRY_KEY,
  validateHandle,
  getHandle,
  setHandle,
  criterionMet,
  getCompletionCriteria,
  setCriterionVerdict,
  hasUnconfirmedHumanCriterion,
  allCriteriaMet,
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

  describe('add/remove section (132188 — choose a render-widget)', () => {
    test('addField adds a known section with its empty value, no widget recorded', () => {
      const desc = serializeFields({ outcome: 'o' })
      const next = parseFields(addField(desc, 'spec', ''))
      expect(next.spec).toBe('')
      expect(next[WIDGET_REGISTRY_KEY]).toBeUndefined()
    })

    test('addField records the chosen widget for a custom (free-form) section', () => {
      const desc = serializeFields({ outcome: 'o' })
      const next = parseFields(addField(desc, 'reviewNotes', '', 'markdown'))
      expect(next.reviewNotes).toBe('')
      expect(fieldWidgetRegistry(next)).toEqual({ reviewNotes: 'markdown' })
    })

    test('the widget registry is hidden from rendered section keys', () => {
      const desc = addField(serializeFields({ outcome: 'o' }), 'links', [], 'artifacts')
      expect(orderedFieldKeys(parseFields(desc))).toEqual(['outcome', 'links'])
    })

    test('addField never clobbers an existing section value', () => {
      const desc = serializeFields({ outcome: 'o', spec: 'already here' })
      expect(parseFields(addField(desc, 'spec', '')).spec).toBe('already here')
    })

    test('removeField drops the section and its widget-registry entry', () => {
      let desc = addField(serializeFields({ outcome: 'o' }), 'links', [], 'artifacts')
      desc = removeField(desc, 'links')
      const f = parseFields(desc)
      expect(f.links).toBeUndefined()
      expect(f[WIDGET_REGISTRY_KEY]).toBeUndefined() // last custom widget cleared
    })

    test('removeField keeps other custom widgets when one is removed', () => {
      let desc = addField(serializeFields({ outcome: 'o' }), 'a', '', 'markdown')
      desc = addField(desc, 'b', {}, 'rawjson')
      desc = removeField(desc, 'a')
      expect(fieldWidgetRegistry(parseFields(desc))).toEqual({ b: 'rawjson' })
    })
  })

  describe('handle (stable human-usable reference)', () => {
    test('validateHandle accepts a lowercase slug', () => {
      expect(validateHandle('read-tree')).toEqual({ valid: true })
      expect(validateHandle('draft-glow-9')).toEqual({ valid: true })
    })

    test('validateHandle treats empty / undefined as valid (no handle)', () => {
      expect(validateHandle('')).toEqual({ valid: true })
      expect(validateHandle(undefined)).toEqual({ valid: true })
      expect(validateHandle(null)).toEqual({ valid: true })
    })

    test('validateHandle rejects uppercase, spaces, and punctuation with a message', () => {
      for (const bad of ['ReadTree', 'read tree', 'read_tree', 'café', 'a/b']) {
        const v = validateHandle(bad)
        expect(v.valid).toBe(false)
        expect(typeof v.message).toBe('string')
      }
    })

    test('setHandle stores a handle that round-trips through getHandle', () => {
      const desc = setHandle(serializeFields({ outcome: 'o' }), 'read-tree')
      expect(getHandle(desc)).toBe('read-tree')
      // and it survives a parse/serialize round-trip
      expect(getHandle(serializeFields(parseFields(desc)))).toBe('read-tree')
    })

    test('setHandle preserves other fields', () => {
      const desc = setHandle(
        serializeFields({ outcome: 'o', spec: 'keep me' }),
        'h1'
      )
      const f = parseFields(desc)
      expect(f.outcome).toBe('o')
      expect(f.spec).toBe('keep me')
      expect(f.handle).toBe('h1')
    })

    test('clearing the handle removes the key (falls back to id)', () => {
      let desc = setHandle(serializeFields({ outcome: 'o' }), 'h1')
      desc = setHandle(desc, undefined)
      expect(getHandle(desc)).toBeUndefined()
      expect(parseFields(desc).handle).toBeUndefined()
    })

    test('the handle is NOT rendered as its own content section', () => {
      const desc = setHandle(
        serializeFields({ outcome: 'o', spec: 's' }),
        'h1'
      )
      // handle round-trips in the fields but never appears among rendered sections
      expect(parseFields(desc).handle).toBe('h1')
      expect(orderedFieldKeys(parseFields(desc))).toEqual(['outcome', 'spec'])
    })

    test('getHandle returns undefined for a legacy / blank description', () => {
      expect(getHandle('')).toBeUndefined()
      expect(getHandle('some legacy prose')).toBeUndefined()
    })
  })

  describe('completion-criterion verdicts (loop-eval-signal)', () => {
    const desc = (criteria: OutcomeFields['completionCriteria']) =>
      serializeFields({ outcome: 'o', completionCriteria: criteria })

    test('a per-criterion verdict {met, evaluator, by, at} round-trips', () => {
      const stored = desc([
        { statement: 's', evaluator: 'human', met: true, by: 'agent1', at: 123 },
      ])
      const back = parseFields(stored).completionCriteria
      expect(back).toEqual([
        { statement: 's', evaluator: 'human', met: true, by: 'agent1', at: 123 },
      ])
    })

    test('criterionMet reads the verdict', () => {
      expect(criterionMet({ statement: 's', evaluator: 'human', met: true })).toBe(true)
      expect(criterionMet({ statement: 's', evaluator: 'human' })).toBe(false)
      expect(criterionMet({ statement: 's', evaluator: 'human', met: false })).toBe(false)
    })

    test('setCriterionVerdict stamps met:true with by/at and round-trips', () => {
      const stored = desc([
        { statement: 'a', evaluator: 'human' },
        { statement: 'b', evaluator: 'executable' },
      ])
      const updated = setCriterionVerdict(stored, 0, true, 'me', 999)
      const cc = getCompletionCriteria(updated)
      expect(cc[0]).toEqual({ statement: 'a', evaluator: 'human', met: true, by: 'me', at: 999 })
      // the sibling criterion is untouched
      expect(cc[1]).toEqual({ statement: 'b', evaluator: 'executable' })
    })

    test('un-confirming a criterion clears its by/at stamp', () => {
      let stored = desc([{ statement: 'a', evaluator: 'human' }])
      stored = setCriterionVerdict(stored, 0, true, 'me', 1)
      stored = setCriterionVerdict(stored, 0, false)
      expect(getCompletionCriteria(stored)[0]).toEqual({
        statement: 'a',
        evaluator: 'human',
        met: false,
      })
    })

    test('setCriterionVerdict ignores an out-of-range index', () => {
      const stored = desc([{ statement: 'a', evaluator: 'human' }])
      expect(setCriterionVerdict(stored, 5, true)).toBe(stored)
    })

    test('hasUnconfirmedHumanCriterion: true only when a human criterion is unmet', () => {
      expect(
        hasUnconfirmedHumanCriterion({
          outcome: 'o',
          completionCriteria: [{ statement: 's', evaluator: 'human' }],
        })
      ).toBe(true)
      // a met human criterion does not count
      expect(
        hasUnconfirmedHumanCriterion({
          outcome: 'o',
          completionCriteria: [{ statement: 's', evaluator: 'human', met: true }],
        })
      ).toBe(false)
      // unmet but non-human criteria do not count
      expect(
        hasUnconfirmedHumanCriterion({
          outcome: 'o',
          completionCriteria: [
            { statement: 's', evaluator: 'executable' },
            { statement: 't', evaluator: 'llm' },
          ],
        })
      ).toBe(false)
      // no criteria at all
      expect(hasUnconfirmedHumanCriterion({ outcome: 'o' })).toBe(false)
    })

    test('allCriteriaMet: true only when every criterion is met and there is ≥1', () => {
      // every criterion met (mixed evaluators)
      expect(
        allCriteriaMet({
          outcome: 'o',
          completionCriteria: [
            { statement: 'a', evaluator: 'human', met: true },
            { statement: 'b', evaluator: 'executable', met: true },
          ],
        })
      ).toBe(true)
      // one still unmet
      expect(
        allCriteriaMet({
          outcome: 'o',
          completionCriteria: [
            { statement: 'a', evaluator: 'human', met: true },
            { statement: 'b', evaluator: 'executable' },
          ],
        })
      ).toBe(false)
      // empty / absent counts as NOT all-met (there is nothing satisfied)
      expect(allCriteriaMet({ outcome: 'o', completionCriteria: [] })).toBe(false)
      expect(allCriteriaMet({ outcome: 'o' })).toBe(false)
    })
  })
})
