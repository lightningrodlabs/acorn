import { AgentPubKeyB64, ActionHashB64, Option } from './shared'

export interface ProjectMeta {
  creatorAgentPubKey: AgentPubKeyB64
  createdAt: number // f64
  name: string
  image: Option<string>
  passphrase: string
  isImported: boolean
  priorityMode: PriorityMode
  topPriorityOutcomes: Array<ActionHashB64>
}

export enum PriorityMode {
  Universal = 'Universal',
  Vote = 'Vote',
}
