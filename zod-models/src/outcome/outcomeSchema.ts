import {z} from 'zod'
import ScopeSchema from '../scope/scopeSchema'
import WithActionHashSchema from '../withActionHashSchema'

const OutcomeSchema = z.object({
  content: z.string(),
  creatorAgentPubKey: z.string(),
  editorAgentPubKey: z.string().nullable(),
  timestampCreated: z.number().gt(0),
  timestampUpdated: z.number().gt(0).nullable(),
  scope: ScopeSchema,
  tags: z.array(z.string()).nullable(),
  description: z.string(),
  isImported: z.boolean(),
  githubLink: z.string().url().or(z.literal('')),
})

export const ProjectOutcomesStateSchema = z.record(
    WithActionHashSchema.merge(OutcomeSchema)
)
export type ProjectOutcomesState = z.infer<typeof ProjectOutcomesStateSchema>


export type Outcome = z.infer<typeof OutcomeSchema>
export default OutcomeSchema