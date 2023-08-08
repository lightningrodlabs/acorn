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
import { ProjectMetaV1, ProjectMetaV1Schema } from 'zod-models'

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

export type ProjectMeta = ProjectMetaV1