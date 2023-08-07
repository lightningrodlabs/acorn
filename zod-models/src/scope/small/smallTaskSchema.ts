import {z} from 'zod'

const SmallTaskSchema = z.object({
  complete: z.boolean(),
  task: z.string(),
})

export type SmallTask = z.infer<typeof SmallTaskSchema>

export default SmallTaskSchema