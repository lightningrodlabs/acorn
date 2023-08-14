import React from 'react'
import { ComputedOutcome } from '../types'
import { ActionHashB64 } from '../types/shared'

export interface ProjectComputedOutcomes {
  // note they are nested like a tree
  computedOutcomesAsTree: ComputedOutcome[]
  computedOutcomesKeyed: {
    [actionHash: ActionHashB64]: ComputedOutcome
  }
}

const ComputedOutcomeContext = React.createContext<ProjectComputedOutcomes>({
  // default states
  computedOutcomesAsTree: [],
  computedOutcomesKeyed: {},
})

export default ComputedOutcomeContext
