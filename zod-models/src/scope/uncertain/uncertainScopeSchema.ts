import {z} from 'zod'
import SmallsEstimateSchema from '../small/smallsEstimateSchema'
import TimeFrameSchema from './timeFrameSchema'

const UncertainScopeSchema = z.object({
  Uncertain: z.object({
    smallsEstimate: SmallsEstimateSchema,
    timeFrame: TimeFrameSchema,
    inBreakdown: z.boolean(),
  })
})

export type UncertainScope = z.infer<typeof UncertainScopeSchema>
export default UncertainScopeSchema