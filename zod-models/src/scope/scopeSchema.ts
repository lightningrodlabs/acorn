import {z} from 'zod'
import SmallScopeSchema from './small/smallScopeSchema'
import UncertainScopeSchema from './uncertain/uncertainScopeSchema'

const ScopeSchema = z.union([SmallScopeSchema, UncertainScopeSchema])

export type Scope = z.infer<typeof ScopeSchema>
export default ScopeSchema