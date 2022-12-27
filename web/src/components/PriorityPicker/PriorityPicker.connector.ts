import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import PriorityPicker from './PriorityPicker.component'

function mapStateToProps(state: RootState, ownProps) {
  const { projectId, outcomeActionHash } = ownProps
  return {
    whoami: state.whoami,
    outcomeActionHash,
    projectId,
  }
}

function mapDispatchToProps(_dispatch, _ownProps) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(PriorityPicker)
