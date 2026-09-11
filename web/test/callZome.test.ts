import callZome from '../src/api/callZome'

type Deferred = { resolve: (v?: any) => void; reject: (e: any) => void }

/** An app client whose calls stay pending until the test settles them. */
function controllableClient() {
  const started: string[] = []
  const pending: Record<string, Deferred> = {}
  const client: any = {
    callZome: jest.fn(
      ({ fn_name }: { fn_name: string }) =>
        new Promise((resolve, reject) => {
          started.push(fn_name)
          pending[fn_name] = { resolve, reject }
        })
    ),
  }
  return { client, started, pending }
}

// write queues are per cell and module-wide, so each test gets its own cells
let nextDna = 0
const newCell = (): any => [new Uint8Array([++nextDna]), new Uint8Array([9])]
let CELL_A: any
let CELL_B: any
beforeEach(() => {
  CELL_A = newCell()
  CELL_B = newCell()
})
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('callZome()', () => {
  it('runs writes to the same cell one after another', async () => {
    const { client, started, pending } = controllableClient()
    const update = callZome(client, CELL_A, 'projects', 'update_outcome', {})
    const create = callZome(client, CELL_A, 'projects', 'create_entry_point', {})
    await flush()
    expect(started).toEqual(['update_outcome'])

    pending['update_outcome'].resolve('updated')
    await expect(update).resolves.toBe('updated')
    await flush()
    expect(started).toEqual(['update_outcome', 'create_entry_point'])

    pending['create_entry_point'].resolve('created')
    await expect(create).resolves.toBe('created')
  })

  it('runs the next write even when the previous one fails', async () => {
    const { client, started, pending } = controllableClient()
    const failing = callZome(client, CELL_A, 'projects', 'delete_entry_point', {})
    const next = callZome(client, CELL_A, 'projects', 'create_entry_point', {})
    await flush()
    pending['delete_entry_point'].reject(new Error('source chain error'))
    await expect(failing).rejects.toThrow('source chain error')
    await flush()
    expect(started).toEqual(['delete_entry_point', 'create_entry_point'])
    pending['create_entry_point'].resolve('created')
    await expect(next).resolves.toBe('created')
  })

  it('does not hold reads or signals behind a pending write', async () => {
    const { client, started, pending } = controllableClient()
    callZome(client, CELL_A, 'projects', 'simple_create_project_meta', {})
    callZome(client, CELL_A, 'projects', 'fetch_outcomes', {})
    callZome(client, CELL_A, 'projects', 'emit_realtime_info_signal', {})
    await flush()
    expect(started).toEqual([
      'simple_create_project_meta',
      'fetch_outcomes',
      'emit_realtime_info_signal',
    ])
    pending['simple_create_project_meta'].resolve()
  })

  it('does not hold writes to one cell behind writes to another', async () => {
    const { client, started, pending } = controllableClient()
    callZome(client, CELL_A, 'projects', 'create_outcome', {})
    callZome(client, CELL_B, 'projects', 'create_tag', {})
    await flush()
    expect(started).toEqual(['create_outcome', 'create_tag'])
    pending['create_outcome'].resolve()
    pending['create_tag'].resolve()
  })
})
