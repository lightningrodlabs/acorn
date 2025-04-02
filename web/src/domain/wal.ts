import {
  ActionHash,
  ActionHashB64,
  DnaHash,
  encodeHashToBase64,
  EntryHash,
  EntryHashB64,
} from '@holochain/client'
import { Hrl, HrlB64, WAL } from '@theweave/api'

export class WalWrapper {
  private hrl: Hrl
  private context?: any

  private constructor(wal: WAL) {
    this.hrl = wal.hrl
    this.context = wal.context
  }
  static fromWal(wal: WAL) {
    return new WalWrapper(wal)
  }
  getHrl(): Hrl {
    return this.hrl
  }
  getContext(): any {
    return this.context
  }
  hasContext(): boolean {
    return this.context !== undefined
  }
  getHrlDnaHash(): DnaHash {
    return this.hrl[0]
  }
  getHrlRecordHash(): ActionHash | EntryHash {
    return this.hrl[1]
  }
  getHrlRecordHashB64(): ActionHashB64 | EntryHashB64 {
    return encodeHashToBase64(this.hrl[1])
  }
  getHrlB64(): HrlB64 {
    return [encodeHashToBase64(this.hrl[0]), encodeHashToBase64(this.hrl[1])]
  }
}
