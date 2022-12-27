import { connect } from 'react-redux'
import { collectExportProjectData } from '../../migrating/export'
import { RootState } from '../../redux/reducer'
import ExportMenuItem from './ExportMenuItem.component'

function mapStateToProps(state: RootState) {
  const {
    ui: { activeProject },
  } = state
  const data = collectExportProjectData(state, activeProject)
  // defensive coding for loading phase
  const projectName = (
    data.projectMeta || {
      name: '',
    }
  ).name

  return {
    projectName,
    data,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportMenuItem)
