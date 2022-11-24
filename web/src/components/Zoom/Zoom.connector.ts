import { connect } from 'react-redux'
import { changeScale } from '../../redux/ephemeral/viewport/actions'
import { RootState } from '../../redux/reducer'
import Zoom, { DispatchZoomProps, StateZoomProps } from './Zoom.component'

function mapStateToProps(state: RootState): StateZoomProps {
  return {
    screensize: state.ui.screensize,
    scale: state.ui.viewport.scale,
  }
}

function mapDispatchToProps(dispatch: any): DispatchZoomProps {
  return {
    zoom: (zoom, pageCoord, instant) => {
      return dispatch(changeScale(zoom, pageCoord, instant))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Zoom)
