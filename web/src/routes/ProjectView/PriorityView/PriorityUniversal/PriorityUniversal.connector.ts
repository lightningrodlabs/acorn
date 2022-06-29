import { connect } from 'react-redux'
import _ from 'lodash'

import { openExpandedView } from '../../../../redux/ephemeral/expanded-view/actions'
import { updateProjectMeta } from '../../../../redux/persistent/projects/project-meta/actions'
import { animatePanAndZoom } from '../../../../redux/ephemeral/viewport/actions'
import ProjectsZomeApi from '../../../../api/projectsApi'
import { getAppWs } from '../../../../hcWebsockets'
import { cellIdFromString } from '../../../../utils'
import PriorityUniversal from './PriorityUniversal.component'
import { RootState } from '../../../../redux/reducer'
import { CellIdString, HeaderHashB64 } from '../../../../types/shared'
import { ProjectMeta } from '../../../../types'

function mapStateToProps(state: RootState) {
  const projectId = state.ui.activeProject
  const projectMeta = state.projects.projectMeta[projectId]

  return {
    projectId,
    projectMeta,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    openExpandedView: (outcomeHeaderHash: HeaderHashB64) => {
      return dispatch(openExpandedView(outcomeHeaderHash))
    },
    goToOutcome: (outcomeHeaderHash: HeaderHashB64) => {
      return dispatch(animatePanAndZoom(outcomeHeaderHash))
    },
    updateProjectMeta: async (
      projectMeta: ProjectMeta,
      headerHash: HeaderHashB64,
      cellIdString: CellIdString
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const cellId = cellIdFromString(cellIdString)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellId,
        {
          entry: projectMeta,
          headerHash,
        }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityUniversal)
