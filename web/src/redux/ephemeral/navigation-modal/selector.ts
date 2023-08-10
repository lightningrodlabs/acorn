import { useSelector } from 'react-redux'
import { RootState } from '../../reducer'

export const navModalOpenSelector = () => {
  const state = useSelector((state: RootState) => state)
  return state.ui.navigationModal.open
}

export const navModalOutcomes = () => {
  const state = useSelector((state: RootState) => state)

  const projectId = state.ui.activeProject
  const outcomes = state.projects.outcomes[projectId]
  const outcomeActionHashes = state.ui.navigationModal.outcomeActionHashes
  return outcomeActionHashes.map((actionHash) => outcomes[actionHash])
}
