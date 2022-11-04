import { HoloHash, CellId } from '@holochain/client'
import BufferAll from 'buffer/'
const Buffer = BufferAll.Buffer
import { Base64 } from "js-base64"

export function hashToString(hash: HoloHash) {
  // nodejs
  if (typeof window === 'undefined') {
    // @ts-ignore
    return hash.toString('hex')
  }
  // browser
  else {
    return hash.toString()
  }
}

export function hashFromString(str: string): HoloHash {
  // nodejs
  if (typeof window === 'undefined') {
    return Buffer.from(str, 'hex')
  }
  // browser
  else {
    return Buffer.from(str.split(','))
  }
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
export function serializeHash(hash: Uint8Array): string {
  return `u${Base64.fromUint8Array(hash, true)}`
}
