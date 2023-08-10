import {z} from 'zod'

const TimeFrameSchema = z.object({
  fromDate: z.number(),
  toDate: z.number(),
}).nullable()

export type TimeFrame = z.infer<typeof TimeFrameSchema>
export default TimeFrameSchema