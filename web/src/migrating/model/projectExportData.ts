import { z } from 'zod'
import { WithActionHash } from '../../types/shared'
import { ProjectMeta, ProjectMetaSchema } from '../../types/projectMeta'
import {
  ProjectOutcomesState,
  ProjectOutcomesStateSchema,
} from '../../redux/persistent/projects/outcomes/reducer'
import {
  ProjectConnectionsState,
  ProjectConnectionsStateSchema,
} from '../../redux/persistent/projects/connections/reducer'
import {
  ProjectEntryPointsState,
  ProjectEntryPointsStateSchema,
} from '../../redux/persistent/projects/entry-points/reducer'
import {
  ProjectOutcomeCommentsState,
  ProjectOutcomeCommentsStateSchema,
} from '../../redux/persistent/projects/outcome-comments/reducer'
import {
  ProjectOutcomeMembersState,
  ProjectOutcomeMembersStateSchema,
} from '../../redux/persistent/projects/outcome-members/reducer'
import {
  ProjectTagsState,
  ProjectTagsStateSchema,
} from '../../redux/persistent/projects/tags/reducer'

export const ProjectExportDataV1Schema = z.object({
  projectMeta: z.object({ actionHash: z.string() }).merge(ProjectMetaSchema),
  outcomes: ProjectOutcomesStateSchema,
  connections: ProjectConnectionsStateSchema,
  outcomeMembers: ProjectOutcomeMembersStateSchema,
  outcomeComments: ProjectOutcomeCommentsStateSchema,
  entryPoints: ProjectEntryPointsStateSchema,
  tags: ProjectTagsStateSchema,
})

// native typescript type
// TODO: set strict mode to true to have the type be inferred properly
// export type ProjectExportDataV1 = z.infer<typeof ProjectExportDataV1Schema>
export type ProjectExportDataV1 = {
  projectMeta: WithActionHash<ProjectMeta>
  outcomes: ProjectOutcomesState
  connections: ProjectConnectionsState
  outcomeMembers: ProjectOutcomeMembersState
  outcomeComments: ProjectOutcomeCommentsState
  entryPoints: ProjectEntryPointsState
  tags: ProjectTagsState
}
