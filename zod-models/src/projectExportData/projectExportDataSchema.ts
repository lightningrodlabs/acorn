import {z} from 'zod'
import { BackwardsCompatibleProjectConnectionsStateSchema, ProjectConnectionsStateSchema } from '../connection/connectionSchema'
import { ProjectEntryPointsStateSchema } from '../entryPoint/entryPointSchema'
import { ProjectOutcomesStateSchema } from '../outcome/outcomeSchema'
import { ProjectOutcomeCommentsStateSchema } from '../outcomeComment/outcomeCommentSchema'
import { ProjectOutcomeMembersStateSchema } from '../outcomeMember/outcomeMemberSchema'
import BackwardsCompatibleProjectMetaSchema, { ProjectMetaV1WithActionHashSchema } from '../projectMetaSchema/projectMetaSchema'
import { ProjectTagsStateSchema } from '../tag/tagSchema'

// This one is the one that requires backwards compatibility
export const BackwardsCompatibleProjectExportSchema = z.object({
  // projectMeta requires backwards compatibility
  projectMeta: BackwardsCompatibleProjectMetaSchema,
  outcomes: ProjectOutcomesStateSchema,
  // connections requires backwards compatibility
  connections: BackwardsCompatibleProjectConnectionsStateSchema,
  outcomeMembers: ProjectOutcomeMembersStateSchema,
  outcomeComments: ProjectOutcomeCommentsStateSchema,
  entryPoints: ProjectEntryPointsStateSchema,
  tags: ProjectTagsStateSchema,
})
export type BackwardsCompatibleProjectExport = z.infer<typeof BackwardsCompatibleProjectExportSchema>

// this is designed for whatever the current/latest version is.
const ProjectExportDataSchema = z.object({
  projectMeta: ProjectMetaV1WithActionHashSchema,
  outcomes: ProjectOutcomesStateSchema,
  connections: ProjectConnectionsStateSchema,
  outcomeMembers: ProjectOutcomeMembersStateSchema,
  outcomeComments: ProjectOutcomeCommentsStateSchema,
  entryPoints: ProjectEntryPointsStateSchema,
  tags: ProjectTagsStateSchema,
})
export type ProjectExportData = z.infer<typeof ProjectExportDataSchema>
export default ProjectExportDataSchema