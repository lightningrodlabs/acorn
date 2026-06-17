import { internalApplyProjectDiffToCell } from '../src/migrating/applyProjectDiff'
import {
  activeEffectiveDiff,
  isEmptyEffective,
  changeKey,
} from '../src/redux/ephemeral/draft/changes'
import draftReducer from '../src/redux/ephemeral/draft/reducer'
import { openDraft, clearDraft } from '../src/redux/ephemeral/draft/actions'
import { ProjectDiff } from '../src/migrating/projectDiff'

// L4 (executable) — Confirm commits exactly the accepted + edited subset; Discard
// writes nothing. We drive the SAME effective-diff derivation confirmDraft uses
// (activeEffectiveDiff), then run it through internalApplyProjectDiffToCell with a
// mocked zome API so the committed create/update/delete calls are observable
// without a conductor.

const mockApi = () => {
  const make = (prefix: string) => ({
    create: jest.fn(async (_c: any, entry: any) => ({
      actionHash: `live_${prefix}_${entry.content ?? 'x'}`,
      entry,
    })),
    update: jest.fn(async (_c: any, p: any) => ({
      actionHash: p.actionHash,
      entry: p.entry,
    })),
    delete: jest.fn(async () => {}),
  })
  return {
    outcome: make('O'),
    connection: {
      create: jest.fn(async (_c: any, entry: any) => ({
        actionHash: 'live_C',
        entry,
      })),
      update: jest.fn(async (_c: any, p: any) => ({
        actionHash: p.actionHash,
        entry: p.entry,
      })),
      delete: jest.fn(async () => {}),
    },
    tag: make('T'),
    outcomeMember: make('M'),
    outcomeComment: make('K'),
    entryPoint: make('E'),
  } as any
}

const diff = (): ProjectDiff => ({
  outcomes: {
    added: {
      'draft:keep': { actionHash: 'draft:keep', content: 'Keep me' },
      'draft:drop': { actionHash: 'draft:drop', content: 'Reject me' },
    },
    updated: { liveX: { actionHash: 'liveX', content: 'X edited' } },
    removed: ['liveGone'],
  },
  connections: { added: {}, updated: {}, removed: [] },
  tags: { added: {}, updated: {}, removed: [] },
  outcomeMembers: { added: {}, updated: {}, removed: [] },
  outcomeComments: { added: {}, updated: {}, removed: [] },
  entryPoints: { added: {}, updated: {}, removed: [] },
})

describe('Confirm commits the accepted subset', () => {
  let api: any
  let dispatch: jest.Mock

  beforeAll(async () => {
    // open the draft, then reject the "draft:drop" add and the removal
    let state = draftReducer(undefined, openDraft(diff(), 'cell-1'))
    state.decisions = {
      [changeKey('outcomes', 'added', 'draft:drop')]: false,
      [changeKey('outcomes', 'removed', 'liveGone')]: false,
    }
    const effective = activeEffectiveDiff(state, 'cell-1')!
    api = mockApi()
    dispatch = jest.fn()
    await internalApplyProjectDiffToCell(effective, 'cell-1', [] as any, dispatch, api)
  })

  test('creates only the accepted added outcome', () => {
    expect(api.outcome.create).toHaveBeenCalledTimes(1)
    const [, entry] = api.outcome.create.mock.calls[0]
    expect(entry.content).toBe('Keep me')
  })

  test('still applies the accepted update', () => {
    expect(api.outcome.update).toHaveBeenCalledTimes(1)
    expect(api.outcome.update.mock.calls[0][1].actionHash).toBe('liveX')
  })

  test('does NOT delete the rejected removal', () => {
    expect(api.outcome.delete).not.toHaveBeenCalled()
  })
})

describe('Discard writes nothing', () => {
  test('a cleared draft yields no effective diff to apply (zero zome calls)', async () => {
    const opened = draftReducer(undefined, openDraft(diff(), 'cell-1'))
    const discarded = draftReducer(opened, clearDraft())
    const effective = activeEffectiveDiff(discarded, 'cell-1')
    expect(effective).toBeNull()

    // confirmDraft's guard: with no effective diff, applyProjectDiffToCell is
    // never reached — prove the apply path issues zero calls when handed nothing
    const api = mockApi()
    const dispatch = jest.fn()
    if (effective && !isEmptyEffective(effective)) {
      await internalApplyProjectDiffToCell(effective, 'cell-1', [] as any, dispatch, api)
    }
    expect(api.outcome.create).not.toHaveBeenCalled()
    expect(api.outcome.update).not.toHaveBeenCalled()
    expect(api.outcome.delete).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('rejecting every change makes the effective diff empty (Confirm becomes a no-op)', () => {
    let state = draftReducer(undefined, openDraft(diff(), 'cell-1'))
    state.decisions = {
      [changeKey('outcomes', 'added', 'draft:keep')]: false,
      [changeKey('outcomes', 'added', 'draft:drop')]: false,
      [changeKey('outcomes', 'updated', 'liveX')]: false,
      [changeKey('outcomes', 'removed', 'liveGone')]: false,
    }
    const effective = activeEffectiveDiff(state, 'cell-1')!
    expect(isEmptyEffective(effective)).toBe(true)
  })
})
