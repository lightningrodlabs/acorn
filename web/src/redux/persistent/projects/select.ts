import { CellIdString } from '../../../types/shared'
import { RootState } from '../../reducer'
import selectEntryPoints from './entry-points/select'
import selectProjectMembersPresent from './realtime-info-signal/select'

const selectProjectAggregated = (
  state: RootState,
  cellIdString: CellIdString
) => {
  const projectMeta = state.projects.projectMeta[cellIdString]
  const members = state.projects.members[cellIdString] || {}
  const memberProfiles = Object.keys(members).map(
    (agentAddress) => state.agents[agentAddress]
  )
  const entryPoints = selectEntryPoints(state, cellIdString)
  const presentMembers = selectProjectMembersPresent(state, cellIdString)
  return {
    projectMeta,
    cellId: cellIdString,
    presentMembers,
    members: memberProfiles,
    entryPoints,
  }
}

const createSelectProjectAggregated = (state: RootState) => {
  return (cellIdString: CellIdString) =>
    selectProjectAggregated(state, cellIdString)
}

export { selectProjectAggregated, createSelectProjectAggregated }
