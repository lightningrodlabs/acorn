import { connect } from 'react-redux'
import { updateProjectMeta } from '../../redux/persistent/projects/project-meta/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import ProjectSettingsModal from './ProjectSettingsModal.component'
import { RootState } from '../../redux/reducer'
import { CellIdString, ActionHashB64 } from '../../types/shared'
import { ProjectMeta } from '../../types'

function mapStateToProps(_state: RootState) {
  // props for the component
  return {}
}

function mapDispatchToProps(dispatch) {
  // props for the component
  return {
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
        { entry: projectMeta, actionHash }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectSettingsModal)
