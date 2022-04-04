import { connect } from 'react-redux'
import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import PriorityPickerUniversal from './PriorityPickerUniversal.component'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'

function mapStateToProps(state, ownProps) {
  const { projectId, outcomeHeaderHash } = ownProps
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const topPriorityOutcomes = projectMeta.topPriorityOutcomes || []
  // see if the outcome of interest is listed in the set
  // of top priority outcomes for the project
  const isTopPriorityOutcome = !!topPriorityOutcomes.find(headerHash => headerHash === outcomeHeaderHash)
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
    updateProjectMeta: async (entry, headerHash) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedProjectMeta = await projectsZomeApi.projectMeta.update(cellId, { entry, headerHash })
      return dispatch(
        updateProjectMeta(cellIdString, updatedProjectMeta)
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPickerUniversal)
