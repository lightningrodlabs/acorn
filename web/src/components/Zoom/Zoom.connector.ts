import { connect } from 'react-redux'
import { changeScale } from '../../redux/ephemeral/viewport/actions'
import { RootState } from '../../redux/reducer'
import Zoom from './Zoom.component'


function mapStateToProps (state: RootState) {
  return {
    screensize: state.ui.screensize,
    scale: state.ui.viewport.scale
  }
}

function mapDispatchToProps (dispatch) {
  return {
    zoom: (zoom, x, y) => {
      return dispatch(changeScale(zoom, x, y))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Zoom)
