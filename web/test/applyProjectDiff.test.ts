import { internalApplyProjectDiffToCell } from '../src/migrating/applyProjectDiff'
import { computeProjectDiff, ProjectSnapshot } from '../src/migrating/projectDiff'

// A diff applied via mocked zome API + dispatch, so the orchestration logic
// (create order, reference remapping, update-by-hash, delete order) is verified
// without a running conductor.

const snapshot = (overrides: ProjectSnapshot = {}): ProjectSnapshot => ({
  outcomes: {},
  connections: {},
  tags: {},
  outcomeMembers: {},
  outcomeComments: {},
  entryPoints: {},
  ...overrides,
})

// a mock CRUD api whose create returns a deterministic live hash per entry
function mockApi() {
  const make = (prefix: string) => ({
    create: jest.fn(async (_cellId: any, entry: any) => ({
      actionHash: `live_${prefix}_${entry.content ?? entry.text ?? 'x'}`,
      entry,
    })),
    update: jest.fn(async (_cellId: any, payload: any) => ({
      actionHash: payload.actionHash,
      entry: payload.entry,
    })),
    delete: jest.fn(async () => {}),
  })
  return {
    outcome: make('O'),
    connection: {
      create: jest.fn(async (_cellId: any, entry: any) => ({
        actionHash: 'live_C_new',
        entry,
      })),
      update: jest.fn(async (_cellId: any, payload: any) => ({
        actionHash: payload.actionHash,
        entry: payload.entry,
      })),
      delete: jest.fn(async () => {}),
    },
    tag: make('T'),
    outcomeMember: make('M'),
    outcomeComment: make('K'),
    entryPoint: make('E'),
  } as any
}

describe('applyProjectDiffToCell', () => {
  // prev: outcome liveA exists; current: add outcome (newO), link liveA -> newO,
  // change liveB, remove a connection and outcome.
  const prev = snapshot({
    outcomes: {
      liveA: { actionHash: 'liveA', content: 'A' },
      liveB: { actionHash: 'liveB', content: 'B' },
      liveD: { actionHash: 'liveD', content: 'D' },
    },
    connections: { oldC: { actionHash: 'oldC', parentActionHash: 'liveA', childActionHash: 'liveD' } },
  })
  const current = snapshot({
    outcomes: {
      liveA: { actionHash: 'liveA', content: 'A' },
      liveB: { actionHash: 'liveB', content: 'B changed' },
      newO: { actionHash: 'newO', content: 'New' },
    },
    connections: { newC: { actionHash: 'newC', parentActionHash: 'liveA', childActionHash: 'newO' } },
  })

  let api: any
  let dispatch: jest.Mock
  let result: any

  beforeAll(async () => {
    api = mockApi()
    dispatch = jest.fn()
    const diff = computeProjectDiff(prev, current)
    result = await internalApplyProjectDiffToCell(diff, 'cell', [] as any, dispatch, api)
  })

  test('creates the added outcome with its actionHash stripped', () => {
    expect(api.outcome.create).toHaveBeenCalledTimes(1)
    const [, entry] = api.outcome.create.mock.calls[0]
    expect(entry.content).toBe('New')
    expect(entry.actionHash).toBeUndefined()
  })

  test('creates the added connection AFTER the outcome, remapping child to the live hash', () => {
    expect(api.connection.create).toHaveBeenCalledTimes(1)
    const [, conn] = api.connection.create.mock.calls[0]
    expect(conn.parentActionHash).toBe('liveA') // existing endpoint kept
    expect(conn.childActionHash).toBe('live_O_New') // remapped from placeholder newO
    expect(api.outcome.create.mock.invocationCallOrder[0]).toBeLessThan(
      api.connection.create.mock.invocationCallOrder[0]
    )
  })

  test('updates the changed outcome by its existing live hash', () => {
    expect(api.outcome.update).toHaveBeenCalledTimes(1)
    const [, payload] = api.outcome.update.mock.calls[0]
    expect(payload.actionHash).toBe('liveB')
    expect(payload.entry.content).toBe('B changed')
    expect(payload.entry.actionHash).toBeUndefined()
  })

  test('deletes connections before outcomes (reverse dependency order)', () => {
    expect(api.connection.delete).toHaveBeenCalledWith([], 'oldC')
    expect(api.outcome.delete).toHaveBeenCalledWith([], 'liveD')
    expect(api.connection.delete.mock.invocationCallOrder[0]).toBeLessThan(
      api.outcome.delete.mock.invocationCallOrder[0]
    )
  })

  test('returns the placeholder -> live hash map for created entries', () => {
    expect(result.hashMap).toEqual({ newO: 'live_O_New', newC: 'live_C_new' })
  })

  test('touchedOutcomes are live hashes for the highlight (added + updated outcomes + endpoints)', () => {
    // newO->live_O_New (added), liveB (updated), liveA (endpoint of the new connection)
    expect(result.touchedOutcomes.sort()).toEqual(['liveA', 'liveB', 'live_O_New'])
  })

  test('dispatches a redux action per zome operation', () => {
    // 2 creates + 1 update + 2 deletes = 5
    expect(dispatch).toHaveBeenCalledTimes(5)
  })
})

// Last line of defense before the zome: agent-authored connections are completed
// (randomizer/isImported filled) and the malformed are rejected with a clear error
// rather than an opaque Ribosome Deserialize.
describe('applyProjectDiffToCell — connection hardening', () => {
  const diffWith = (conns: any) => ({
    outcomes: { added: {}, updated: {}, removed: [] },
    connections: { added: conns, updated: {}, removed: [] },
    tags: { added: {}, updated: {}, removed: [] },
    outcomeMembers: { added: {}, updated: {}, removed: [] },
    outcomeComments: { added: {}, updated: {}, removed: [] },
    entryPoints: { added: {}, updated: {}, removed: [] },
  })

  test('an under-specified connection commits with randomizer/isImported defaulted', async () => {
    const api = mockApi()
    const diff = diffWith({
      c1: { parentActionHash: 'liveA', childActionHash: 'liveB', siblingOrder: 0 },
    })
    await internalApplyProjectDiffToCell(diff, 'cell', [] as any, jest.fn(), api)
    expect(api.connection.create).toHaveBeenCalledTimes(1)
    const [, conn] = api.connection.create.mock.calls[0]
    expect(typeof conn.randomizer).toBe('number') // system-supplied, agent can't know it
    expect(conn.isImported).toBe(false)
    expect(conn.parentActionHash).toBe('liveA')
    expect(conn.childActionHash).toBe('liveB')
  })

  test('a malformed connection (no child) is rejected before reaching the zome', async () => {
    const api = mockApi()
    const diff = diffWith({ c1: { parentActionHash: 'liveA', siblingOrder: 0 } })
    await expect(
      internalApplyProjectDiffToCell(diff, 'cell', [] as any, jest.fn(), api)
    ).rejects.toThrow(/child/i)
    expect(api.connection.create).not.toHaveBeenCalled()
  })
})
