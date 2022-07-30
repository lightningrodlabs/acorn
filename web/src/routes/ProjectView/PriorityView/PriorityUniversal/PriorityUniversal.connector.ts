import { connect } from 'react-redux'
import _ from 'lodash'

import { openExpandedView } from '../../../../redux/ephemeral/expanded-view/actions'
import selectProjectMembersPresent from '../../../../redux/persistent/projects/realtime-info-signal/select'
import { updateProjectMeta } from '../../../../redux/persistent/projects/project-meta/actions'
import { animatePanAndZoom } from '../../../../redux/ephemeral/viewport/actions'
import ProjectsZomeApi from '../../../../api/projectsApi'
import { getAppWs } from '../../../../hcWebsockets'
import { cellIdFromString } from '../../../../utils'
import PriorityUniversal from './PriorityUniversal.component'
import { RootState } from '../../../../redux/reducer'
import { CellIdString, ActionHashB64 } from '../../../../types/shared'
import { ProjectMeta } from '../../../../types'

function mapStateToProps(state: RootState) {
  const projectId = state.ui.activeProject
  const projectMeta = state.projects.projectMeta[projectId]
  const projectTagsObject = state.projects.tags[projectId] || {}
  const presentMembers = projectId
    ? selectProjectMembersPresent(state, projectId)
    : []

  const projectTags = Object.values(projectTagsObject)

  return {
    projectId,
    projectMeta,
    projectTags,
    presentMembers,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    openExpandedView: (outcomeActionHash: ActionHashB64) => {
      return dispatch(openExpandedView(outcomeActionHash))
    },
    goToOutcome: (outcomeActionHash: ActionHashB64) => {
      return dispatch(animatePanAndZoom(outcomeActionHash))
    },
    updateProjectMeta: async (
      projectMeta: ProjectMeta,
      actionHash: ActionHashB64,
      cellIdString: CellIdString
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellId,
        {
          entry: projectMeta,
          actionHash,
        }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityUniversal)
