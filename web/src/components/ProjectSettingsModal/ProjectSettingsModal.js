import { connect } from 'react-redux'
import './ProjectSettingsModal.scss'
import { updateProjectMeta } from '../../redux/persistent/projects/project-meta/actions'
import ProjectSettingsModal from './ProjectSettingsModal.component'

function mapStateToProps(_state) {
  // props for the componen
  return {}
}

function mapDispatchToProps(dispatch) {
  // props for the component
  return {
    updateProjectMeta: (entry, headerHash, cellIdString) => {
      return dispatch(
        updateProjectMeta.create({
          payload: { entry, headerHash },
          cellIdString: cellIdString,
        })
      )
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectSettingsModal)
