
import {z} from 'zod'
import SmallTaskSchema from './smallTaskSchema'

const SmallScopeSchema = z.object({
  Small: z.object({
    achievementStatus: z.enum(['Achieved', 'NotAchieved']), // TODO: extract into a reusable enum
    targetDate: z.number().nullable(),
    taskList: z.array(SmallTaskSchema),
  })
})

export type SmallScope = z.infer<typeof SmallScopeSchema>
export default SmallScopeSchema