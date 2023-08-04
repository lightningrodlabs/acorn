import { z } from 'zod'

export const TagSchema = z.object({
  backgroundColor: z.string(),
  text: z.string(),
})
export interface Tag {
  backgroundColor: string
  text: string
}
