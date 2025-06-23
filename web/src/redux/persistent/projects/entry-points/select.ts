import { CellIdString } from '../../../../types/shared'
import { RootState } from '../../../reducer'

export default function selectEntryPoints(
  state: RootState,
  projectId: CellIdString
) {
  const entryPoints = state.projects.entryPoints[projectId] || {}
  const outcomes = state.projects.outcomes[projectId] || {}

  const combinedEntryPoints = Object.keys(entryPoints)
    .map((key) => {
      const entryPoint = entryPoints[key]
      const outcome = outcomes[entryPoint.outcomeActionHash]
      if (outcome) {
        return {
          entryPoint,
          outcome,
        }
      }
      return null
    })
    // filter out nulls
    .filter((e) => e)

  return combinedEntryPoints
}
