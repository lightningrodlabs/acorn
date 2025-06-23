import { CellIdString } from '../../../types/shared'
import { RootState } from '../../reducer'
import selectEntryPoints from './entry-points/select'
import selectProjectMembersPresent from './realtime-info-signal/select'

const selectProjectAggregated = (
  state: RootState,
  cellIdString: CellIdString
) => {
  const projectMeta = state.projects.projectMeta[cellIdString]
  const memberPubkeys = Object.keys(state.projects.members[cellIdString]?.members || {});
  // Need to filter profiles by members since in Moss, profiles are not stored separately
  // per project cell
  const memberProfiles = state.projects.members[cellIdString]?.profiles.filter((p) => memberPubkeys.includes(p.agentPubKey)) || []
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
