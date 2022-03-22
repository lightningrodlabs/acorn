import { connect } from 'react-redux'
import selectEntryPoints from '../../redux/persistent/projects/entry-points/select'
import { animatePanAndZoom } from '../../redux/ephemeral/viewport/actions'
import EntryPointPicker from './EntryPointPicker.component'

function mapStateToProps(state) {
  const {
    ui: { activeProject, activeEntryPoints },
  } = state
  const combinedEntryPoints = selectEntryPoints(state, activeProject)

  return {
    entryPoints: combinedEntryPoints,
    activeEntryPoints,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    goToOutcome: (outcomeHeaderHash) => {
      return dispatch(animatePanAndZoom(outcomeHeaderHash))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EntryPointPicker)
