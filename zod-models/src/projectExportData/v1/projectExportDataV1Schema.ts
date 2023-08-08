import {z} from 'zod'
import { ProjectConnectionsStateSchema } from '../../connection/connectionSchema'
import { ProjectEntryPointsStateSchema } from '../../entryPoint/entryPointSchema'
import { ProjectOutcomesStateSchema } from '../../outcome/outcomeSchema'
import { ProjectOutcomeCommentsStateSchema } from '../../outcomeComment/outcomeCommentSchema'
import { ProjectOutcomeMembersStateSchema } from '../../outcomeMember/outcomeMemberSchema'
import BackwardsCompatibleProjectMetaSchema, { ProjectMetaV1WithActionHashSchema } from '../../projectMetaSchema/projectMetaSchema'
import { ProjectTagsStateSchema } from '../../tag/tagSchema'

const BackwardsCompatibleProjectExportSchema = z.object({
  // projectMeta requires backwards compatibility
  projectMeta: BackwardsCompatibleProjectMetaSchema,
  outcomes: ProjectOutcomesStateSchema,
  connections: ProjectConnectionsStateSchema,
  outcomeMembers: ProjectOutcomeMembersStateSchema,
  outcomeComments: ProjectOutcomeCommentsStateSchema,
  entryPoints: ProjectEntryPointsStateSchema,
  tags: ProjectTagsStateSchema,
})

const ProjectExportDataV1Schema = z.object({
  // projectMeta has a v1 specific schema
  projectMeta: ProjectMetaV1WithActionHashSchema,
  outcomes: ProjectOutcomesStateSchema,
  connections: ProjectConnectionsStateSchema,
  outcomeMembers: ProjectOutcomeMembersStateSchema,
  outcomeComments: ProjectOutcomeCommentsStateSchema,
  entryPoints: ProjectEntryPointsStateSchema,
  tags: ProjectTagsStateSchema,
})

export type BackwardsCompatibleProjectExport = z.infer<typeof BackwardsCompatibleProjectExportSchema>

export type ProjectExportDataV1 = z.infer<typeof ProjectExportDataV1Schema>

export default ProjectExportDataV1Schema