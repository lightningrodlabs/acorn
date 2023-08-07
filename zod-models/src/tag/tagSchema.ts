import {z} from 'zod'

export const TagSchema = z.object({
  backgroundColor: z.string(),
  text: z.string(),
})

export const ProjectTagsStateSchema = z.record(
  z.object({ actionHash: z.string() }).merge(TagSchema)
)

export type Tag = z.infer<typeof TagSchema>
export type ProjectTagsState = z.infer<typeof ProjectTagsStateSchema>

export default TagSchema