import {z} from 'zod'

const SmallsEstimateSchema = z.number().nullable()

export type SmallsEstimate = z.infer<typeof SmallsEstimateSchema>
export default SmallsEstimateSchema