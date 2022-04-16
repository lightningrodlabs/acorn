import React from 'react'
import { ComputedOutcome } from '../types'
import { HeaderHashB64 } from '../types/shared'

export interface ProjectComputedOutcomes {
  // note they are nested like a tree
  computedOutcomesAsTree: ComputedOutcome[]
  computedOutcomesKeyed: {
    [headerHash: HeaderHashB64]: ComputedOutcome
  }
}

const ComputedOutcomeContext = React.createContext<ProjectComputedOutcomes>({
  // default states
  computedOutcomesAsTree: [],
  computedOutcomesKeyed: {}
})

export default ComputedOutcomeContext
