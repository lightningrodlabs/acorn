import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import selectEntryPoints from '../../redux/persistent/projects/entry-points/select'
import { animatePanAndZoom } from '../../redux/ephemeral/viewport/actions'
import EntryPointPicker from './EntryPointPicker.component'

function mapStateToProps(state: RootState) {
  const {
    ui: { activeProject, activeEntryPoints },
  } = state
  const entryPointsAndOutcomes = selectEntryPoints(state, activeProject)

  return {
    entryPointsAndOutcomes,
    activeEntryPoints,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    goToOutcome: (outcomeActionHash) => {
      return dispatch(animatePanAndZoom(outcomeActionHash))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EntryPointPicker)
