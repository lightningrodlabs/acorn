import {z} from 'zod'
import { ProjectMetaV0Schema } from '../v0/projectMetaV0Schema'
import WithActionHashSchema from '../../withActionHashSchema'

export const ProjectMetaV1Schema = z.object({
  layeringAlgorithm: z.enum(['LongestPath', 'CoffmanGraham']),
  topPriorityOutcomes: z.array(z.string())
}).merge(ProjectMetaV0Schema)

const ProjectMetaV1WithActionHashSchema = WithActionHashSchema.merge(ProjectMetaV1Schema)
export default ProjectMetaV1WithActionHashSchema