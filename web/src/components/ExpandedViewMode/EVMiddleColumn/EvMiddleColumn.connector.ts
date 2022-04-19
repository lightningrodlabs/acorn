import { connect } from 'react-redux'
import { RootState } from '../../../redux/reducer'
import EVMiddleColumn from './EVMiddleColumn.component'

function mapStateToProps(_state: RootState) {
  return {}
}

function mapDispatchToProps() {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(EVMiddleColumn)
