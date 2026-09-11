import { AppClient, CellId } from '@holochain/client'

/**
 * Zome functions that commit to our own source chain. A chain takes one write
 * bundle at a time: when two of our calls overlap, the later one either fails
 * with "the source chain head has moved" (if its bundle holds a strictly
 * ordered action, such as the first Path.ensure() of a new path) or is rebased
 * onto the new head, which changes its action hashes -- and the hash the call
 * returned, which Acorn keeps as the record's id, then points at nothing.
 * Only this UI writes to our chain, so running its writes to a cell one after
 * another avoids both.
 */
const WRITE_FN = /^(create|update|delete|simple_create)_/

// the tail of each cell's write queue; settled (never rejected) promises
const writeQueues = new Map<string, Promise<void>>()

function cellKey(cellId: CellId): string {
  return `${cellId[0]}|${cellId[1]}`
}

export default async function callZome<InputType, OutputType>(
  appWebsocket: AppClient,
  cellId: CellId,
  zomeName: string,
  fnName: string,
  payload: InputType
): Promise<OutputType> {
  const request = () =>
    appWebsocket.callZome({
      cell_id: cellId,
      zome_name: zomeName,
      fn_name: fnName,
      payload: payload,
      cap_secret: null,
    }) as Promise<OutputType>
  if (!WRITE_FN.test(fnName)) return request()

  const key = cellKey(cellId)
  const previous = writeQueues.get(key)
  const result = previous ? previous.then(request) : request()
  const tail = result.then(
    () => undefined,
    () => undefined
  )
  writeQueues.set(key, tail)
  tail.then(() => {
    if (writeQueues.get(key) === tail) writeQueues.delete(key)
  })
  return result
}
