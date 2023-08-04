import { z } from 'zod'
import { Profile, ProfileSchema } from '../../types/profile'
import {
  ProjectExportDataV1,
  ProjectExportDataV1Schema,
} from './projectExportData'

export const AllProjectsDataExportSchema = z.object({
  myProfile: ProfileSchema,
  projects: z.array(ProjectExportDataV1Schema),
  integrityVersion: z.string(),
})
export type AllProjectsDataExport = {
  myProfile: Profile
  projects: ProjectExportDataV1[]
  integrityVersion: string
}
