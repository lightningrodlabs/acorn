import { connect } from 'react-redux'
import { RootState } from '../../../redux/reducer'
import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'
import PriorityPickerUniversal from './PriorityPickerUniversal.component'
import { ProjectMeta } from '../../../types'
import { HeaderHashB64 } from '../../../types/shared'

function mapStateToProps(state: RootState, ownProps) {
  const { projectId, outcomeHeaderHash } = ownProps
  const projectMeta = state.projects.projectMeta[projectId]
  const topPriorityOutcomes = projectMeta ? projectMeta.topPriorityOutcomes : []
  // see if the outcome of interest is listed in the set
  // of high priority outcomes for the project
  const isTopPriorityOutcome = !!topPriorityOutcomes.find(
    (headerHash) => headerHash === outcomeHeaderHash
  )
  return {
    whoami: state.whoami,
    isTopPriorityOutcome,
    projectMeta,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    updateProjectMeta: async (
      projectMeta: ProjectMeta,
      headerHash: HeaderHashB64
    ) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(
        cellId,
        { entry: projectMeta, headerHash }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PriorityPickerUniversal)
