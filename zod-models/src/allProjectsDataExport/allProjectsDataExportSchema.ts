import { z } from 'zod'
import ProfileSchema from '../profile/profileSchema'
import ProjectExportDataSchema, {
  BackwardsCompatibleProjectExportSchema,
} from '../projectExportData/projectExportDataSchema'

// this is the one that requires backwards compatibility
// it's the one that gets used for importing
export const BackwardsCompatibleAllProjectsExportSchema = z.object({
  myProfile: ProfileSchema,
  projects: z.array(BackwardsCompatibleProjectExportSchema),
  integrityVersion: z.number().optional(),
})
export type BackwardsCompatibleAllProjectsExport = z.infer<
  typeof BackwardsCompatibleAllProjectsExportSchema
>

// this is designed for whatever the current/latest version is.
export const AllProjectsDataExportSchema = z.object({
  myProfile: ProfileSchema,
  projects: z.array(ProjectExportDataSchema),
  integrityVersion: z.number(),
})
export type AllProjectsDataExport = z.infer<typeof AllProjectsDataExportSchema>
export default AllProjectsDataExportSchema
