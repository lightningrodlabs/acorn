import React from 'react'
import { ComputedOutcome } from '../types'

export interface ProjectComputedOutcomes {
  // note they are nested like a tree
  computedOutcomes: ComputedOutcome[]
}

const ComputedOutcomeContext = React.createContext<ProjectComputedOutcomes>({
  computedOutcomes: [],
})

export default ComputedOutcomeContext
