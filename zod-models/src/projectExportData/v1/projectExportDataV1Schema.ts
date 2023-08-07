import {z} from 'zod'
import { ProjectConnectionsStateSchema } from '../../connection/connectionSchema'
import { ProjectEntryPointsStateSchema } from '../../entryPoint/entryPointSchema'
import { ProjectOutcomesStateSchema } from '../../outcome/outcomeSchema'
import { ProjectOutcomeCommentsStateSchema } from '../../outcomeComment/outcomeCommentSchema'
import { ProjectOutcomeMembersStateSchema } from '../../outcomeMember/outcomeMemberSchema'
import ProjectMetaWithActionHashSchema from '../../projectMetaSchema/projectMetaSchema'
import { ProjectTagsStateSchema } from '../../tag/tagSchema'

const ProjectExportDataV1Schema = z.object({
  projectMeta: ProjectMetaWithActionHashSchema,
  outcomes: ProjectOutcomesStateSchema,
  connections: ProjectConnectionsStateSchema,
  outcomeMembers: ProjectOutcomeMembersStateSchema,
  outcomeComments: ProjectOutcomeCommentsStateSchema,
  entryPoints: ProjectEntryPointsStateSchema,
  tags: ProjectTagsStateSchema,
})

export type ProjectExportDataV1 = z.infer<typeof ProjectExportDataV1Schema>

export default ProjectExportDataV1Schema