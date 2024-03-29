import { HoloHash, CellId } from '@holochain/client'
import BufferAll from 'buffer/'
const Buffer = BufferAll.Buffer

export function hashToString(hash: HoloHash) {
  const bytes = Array.from(hash)
  return bytes.join(',')
}

export function hashFromString(str: string): HoloHash {
  const bytes = str.split(',').map(Number)
  return Buffer.from(bytes)
}

const CELL_ID_DIVIDER = '[:cell_id_divider:]'
export function cellIdToString(cellId: CellId) {
  // [DnaHash, AgentPubKey]
  return hashToString(cellId[0]) + CELL_ID_DIVIDER + hashToString(cellId[1])
}

export function cellIdFromString(str: string): CellId {
  // [DnaHash, AgentPubKey]
  const [dnahashstring, agentpubkeyhashstring] = str.split(CELL_ID_DIVIDER)
  return [hashFromString(dnahashstring), hashFromString(agentpubkeyhashstring)]
}

export function getCurrentDateFormatted() {
  const now = new Date()

  const year = now.getFullYear()
  // getMonth() returns a zero-based month, so +1 to get the correct month number
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}
