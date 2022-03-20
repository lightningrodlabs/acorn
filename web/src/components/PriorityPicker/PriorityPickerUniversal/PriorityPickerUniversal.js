import { connect } from 'react-redux'
import { updateProjectMeta } from '../../../redux/persistent/projects/project-meta/actions'
import PriorityPickerUniversal from './PriorityPickerUniversal.component'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'

function mapStateToProps(state, ownProps) {
  const { projectId, goalAddress } = ownProps
  const projectMeta = state.projects.projectMeta[projectId] || {}
  const topPriorityGoals = projectMeta.top_priority_goals || []
  // see if the goal of interest is listed in the set
  // of top priority goals for the project
  const isTopPriorityGoal = !!topPriorityGoals.find(headerHash => headerHash === goalAddress)
  return {
    whoami: state.whoami,
    isTopPriorityGoal,
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
