import { connect } from 'react-redux'
import {
  collectExportProjectData,
  projectDataToCsv,
} from '../../migrating/export'
import { RootState } from '../../redux/reducer'
import ExportMenuItem, { ExportMenuItemProps } from './ExportMenuItem.component'

type ConnectedExportMenuItemProps = Omit<ExportMenuItemProps, 'data'>

function mapStateToProps(state: RootState, ownProps: ConnectedExportMenuItemProps) {
  const {
    ui: { activeProject },
  } = state
  const activeProjectData = collectExportProjectData(state, activeProject)
  const data =
    ownProps.type === 'csv'
      ? projectDataToCsv(activeProjectData)
      : JSON.stringify(activeProjectData, null, 2)

  return {
    data,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportMenuItem)
