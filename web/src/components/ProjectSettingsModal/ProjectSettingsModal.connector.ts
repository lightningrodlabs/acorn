import { connect } from 'react-redux'
import { updateProjectMeta } from '../../redux/persistent/projects/project-meta/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import ProjectSettingsModal from './ProjectSettingsModal.component'
import { RootState } from '../../redux/reducer'
import { CellIdString, HeaderHashB64 } from '../../types/shared'
import { ProjectMeta } from '../../types'

function mapStateToProps(_state: RootState) {
  // props for the componen
  return {}
}

function mapDispatchToProps(dispatch) {
  // props for the component
  return {
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
        { entry: projectMeta, headerHash }
      )
      return dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectSettingsModal)
