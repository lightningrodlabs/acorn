
import {z} from 'zod'
import SmallTaskSchema from './smallTaskSchema'
import AchievementStatusSchema from './achievementStatus'

const SmallScopeSchema = z.object({
  Small: z.object({
    achievementStatus: AchievementStatusSchema,
    targetDate: z.number().nullable(),
    taskList: z.array(SmallTaskSchema),
  })
})

export type SmallScope = z.infer<typeof SmallScopeSchema>
export default SmallScopeSchema