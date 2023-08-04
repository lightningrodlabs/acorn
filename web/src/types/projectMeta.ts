import { z } from 'zod'
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

export const ProjectMetaSchema = z.object({
  creatorAgentPubKey: z.string(),
  createdAt: z.number(),
  name: z.string(),
  image: z.string().optional(),
  passphrase: z.string(),
  isImported: z.boolean(),
  layeringAlgorithm: z.nativeEnum(LayeringAlgorithm),
  topPriorityOutcomes: z.array(z.string()),
  isMigrated: z.string().optional(),
})
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
