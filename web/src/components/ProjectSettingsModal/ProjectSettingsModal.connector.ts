import { connect } from 'react-redux'
import { updateProjectMeta } from '../../redux/persistent/projects/project-meta/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { cellIdFromString } from '../../utils'
import ProjectSettingsModal, {
  ProjectSettingsModalDispatchProps,
  ProjectSettingsModalOwnProps,
} from './ProjectSettingsModal.component'
import { RootState } from '../../redux/reducer'
import { CellIdString, ActionHashB64 } from '../../types/shared'
import { ProjectMeta } from '../../types'
import { getAppWs } from '../../hcWebsockets'

function mapStateToProps(_state: RootState) {
  return {}
}

function mapDispatchToProps(
  dispatch: any,
  ownProps: ProjectSettingsModalOwnProps
): ProjectSettingsModalDispatchProps {
  // const { appWebsocket } = ownProps
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
      dispatch(updateProjectMeta(cellIdString, updatedProjectMeta))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectSettingsModal)
