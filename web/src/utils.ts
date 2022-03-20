import { HoloHash, CellId } from '@holochain/client'

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
    // @ts-ignore
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
