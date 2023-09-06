import {z} from 'zod'
import ProfileSchema from '../profile/profileSchema'
import ProjectExportDataV1Schema from '../projectExportData/projectExportDataSchema'

export const BackwardsCompatibleAllProjectsExportSchema = z.object({
  myProfile: ProfileSchema,
  projects: z.array(ProjectExportDataV1Schema),
})

export type BackwardsCompatibleAllProjectsExport = z.infer<typeof BackwardsCompatibleAllProjectsExportSchema>

export const AllProjectsDataExportSchema = z.object({
  myProfile: ProfileSchema,
  projects: z.array(ProjectExportDataV1Schema),
  integrityVersion: z.number(),
})

export type AllProjectsDataExport = z.infer<typeof AllProjectsDataExportSchema>

export default AllProjectsDataExportSchema