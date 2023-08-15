import {z} from 'zod'
import { ProjectMetaV0Schema } from '../v0/projectMetaV0Schema'
import WithActionHashSchema from '../../withActionHashSchema'

export enum LayeringAlgorithm {
  LongestPath = 'LongestPath',
  CoffmanGraham = 'CoffmanGraham',
  Classic = 'Classic'
}
export const LayeringAlgorithmSchema = z.nativeEnum(LayeringAlgorithm)

export const ProjectMetaV1Schema = z.object({
  layeringAlgorithm: LayeringAlgorithmSchema,
  topPriorityOutcomes: z.array(z.string())
}).merge(ProjectMetaV0Schema)

export type ProjectMetaV1 = z.infer<typeof ProjectMetaV1Schema>

const ProjectMetaV1WithActionHashSchema = WithActionHashSchema.merge(ProjectMetaV1Schema)
export default ProjectMetaV1WithActionHashSchema