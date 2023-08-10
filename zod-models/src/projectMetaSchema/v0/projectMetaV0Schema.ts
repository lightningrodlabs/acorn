import {z} from 'zod'
import WithActionHashSchema from '../../withActionHashSchema'

export const ProjectMetaV0Schema = z.object({
  creatorAgentPubKey: z.string(),
  createdAt: z.number(),
  name: z.string(),
  image: z.string().nullable(),
  passphrase: z.string(),
  isImported: z.boolean(),
  isMigrated: z.string().nullable(),
})

const ProjectMetaV0WithActionHashSchema = WithActionHashSchema.merge(ProjectMetaV0Schema)

export default ProjectMetaV0WithActionHashSchema