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
