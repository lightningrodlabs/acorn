import {z} from 'zod'
import ProfileSchema from '../profile/profileSchema'
import ProjectExportDataV1Schema from '../projectExportData/v1/projectExportDataV1Schema'

const AllProjectsDataExportSchema = z.object({
  myProfile: ProfileSchema,
  projects: z.array(ProjectExportDataV1Schema),
  integrityVersion: z.string(),
})


export type AllProjectsDataExport = z.infer<typeof AllProjectsDataExportSchema>

export default AllProjectsDataExportSchema