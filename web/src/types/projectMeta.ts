import { AgentPubKeyB64, CellIdString, WithActionHash } from './shared'
import { EntryPoint, Outcome, Profile, ProjectMetaV1 } from 'zod-models'

export { LayeringAlgorithm } from 'zod-models'

export type ProjectAggregated = {
  projectMeta: WithActionHash<ProjectMetaV1>
  cellId: CellIdString
  presentMembers: AgentPubKeyB64[]
  members: Profile[]
  entryPoints: {
    entryPoint: WithActionHash<EntryPoint>
    outcome: WithActionHash<Outcome>
  }[]
}

export type ProjectMeta = ProjectMetaV1
