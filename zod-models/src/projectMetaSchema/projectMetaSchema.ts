
import {z} from 'zod'
import ProjectMetaV0WithActionHashSchema from './v0/projectMetaV0Schema'
import ProjectMetaV1WithActionHashSchema from './v1/projectMetaV1Schema'

const ProjectMetaWithActionHashSchema = z.union([ProjectMetaV1WithActionHashSchema, ProjectMetaV0WithActionHashSchema])

export type ProjectMetaWithActionHash = z.infer<typeof ProjectMetaWithActionHashSchema>
export default ProjectMetaWithActionHashSchema