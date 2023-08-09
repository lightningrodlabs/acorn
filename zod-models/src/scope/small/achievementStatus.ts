import {z} from 'zod'

const AchievementStatusSchema = z.enum(['Achieved', 'NotAchieved'])

export type AchievementStatus = z.infer<typeof AchievementStatusSchema>
export default AchievementStatusSchema