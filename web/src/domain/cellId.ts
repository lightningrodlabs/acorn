import {
  AgentPubKey,
  AgentPubKeyB64,
  CellId,
  DnaHash,
  DnaHashB64,
  encodeHashToBase64,
} from '@holochain/client'
import { cellIdFromString, cellIdToString } from '../utils'

export class CellIdWrapper {
  private cellId: CellId
  private constructor(cellId: CellId) {
    this.cellId = cellId
  }
  static fromCellId(cellId: CellId) {
    return new CellIdWrapper(cellId)
  }
  static fromCellIdString(cellIdString: string) {
    const cellId = cellIdFromString(cellIdString)
    return new CellIdWrapper(cellId)
  }
  getCellId(): CellId {
    return this.cellId
  }
  getCellIdString(): string {
    return cellIdToString(this.cellId)
  }
  getDnaHash(): DnaHash {
    return this.cellId[0]
  }
  getAgentPubKey(): AgentPubKey {
    return this.cellId[1]
  }
  getDnaHashB64(): DnaHashB64 {
    return encodeHashToBase64(this.getDnaHash())
  }
  getAgentPubKeyB64(): AgentPubKeyB64 {
    return encodeHashToBase64(this.getAgentPubKey())
  }
}
