import { EntryPoint } from './entryPoint'
import { Outcome } from './outcome'
import { Profile } from './profile'
import {
  AgentPubKeyB64,
  ActionHashB64,
  Option,
  CellIdString,
  WithActionHash,
} from './shared'

export type ProjectAggregated = {
  projectMeta: WithActionHash<ProjectMeta>
  cellId: CellIdString
  presentMembers: AgentPubKeyB64[]
  members: Profile[]
  entryPoints: {
    entryPoint: WithActionHash<EntryPoint>
    outcome: WithActionHash<Outcome>
  }[]
}

export enum LayeringAlgorithm {
  LongestPath = 'LongestPath',
  CoffmanGraham = 'CoffmanGraham',
}

export interface ProjectMeta {
  creatorAgentPubKey: AgentPubKeyB64
  createdAt: number // f64
  name: string
  image: Option<string>
  passphrase: string
  isImported: boolean
  layeringAlgorithm: LayeringAlgorithm
  topPriorityOutcomes: Array<ActionHashB64>
  isMigrated: Option<string>
}
