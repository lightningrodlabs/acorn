
import {z} from 'zod'
import ProjectMetaV0WithActionHashSchema from './v0/projectMetaV0Schema'
import ProjectMetaV1WithActionHashSchema, { ProjectMetaV1, ProjectMetaV1Schema } from './v1/projectMetaV1Schema'

const BackwardsCompatibleProjectMetaSchema = z.union([ProjectMetaV1WithActionHashSchema, ProjectMetaV0WithActionHashSchema])

export {
    ProjectMetaV0WithActionHashSchema,
    ProjectMetaV1WithActionHashSchema,
    ProjectMetaV1,
    ProjectMetaV1Schema,
}
export type ProjectMetaV0WithActionHash = z.infer<typeof ProjectMetaV0WithActionHashSchema>
export type ProjectMetaV1WithActionHash = z.infer<typeof ProjectMetaV1WithActionHashSchema>

export type BackwardsCompatibleProjectMeta = z.infer<typeof BackwardsCompatibleProjectMetaSchema>
export default BackwardsCompatibleProjectMetaSchema