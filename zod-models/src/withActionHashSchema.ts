import {z} from 'zod'

const WithActionHashSchema = z.object({
  actionHash: z.string().nonempty()
})

export default WithActionHashSchema