import { CellIdString } from '../../../../types/shared'
import { RootState } from '../../../reducer'
import { selectActiveProjectMembers } from '../entry-points/select'

function getDnaHashFromProjectId(activeProject: CellIdString) {
  return activeProject
    ? activeProject.split('[:cell_id_divider:]')[0]
    : activeProject
}

export default function selectProjectMembersPresent(
  state: RootState,
  projectId: CellIdString
) {
  // select the list of folks ("Agents in holochain") who are members
  // of the active project, if there is one
  const members = selectActiveProjectMembers(state, projectId)
  const currentUserIsOnProject =
    state.ui.activeProject === projectId ? [state.agentAddress] : []

  return Object.values(state.ui.realtimeInfo)
    .filter(
      (agentInfo) =>
        getDnaHashFromProjectId(agentInfo.projectId) ===
        getDnaHashFromProjectId(projectId)
    )
    .map((agentInfo) => agentInfo.agentPubKey)
    .filter((agentPubKey) =>
      members.find((member) => member.agentPubKey === agentPubKey)
    )
    .concat(currentUserIsOnProject)
}
