import { connect } from 'react-redux'
import {
  changeAllDirect,
  changeScale,
} from '../../redux/ephemeral/viewport/actions'
import { RootState } from '../../redux/reducer'
import Zoom, { DispatchZoomProps, StateZoomProps } from './Zoom.component'

function mapStateToProps(state: RootState): StateZoomProps {
  return {
    screensize: state.ui.screensize,
    scale: state.ui.viewport.scale,
    coordinates: state.ui.layout.coordinates,
    dimensions: state.ui.layout.dimensions,
  }
}

function mapDispatchToProps(dispatch: any): DispatchZoomProps {
  return {
    zoom: (zoom, pageCoord, instant) => {
      return dispatch(changeScale(zoom, pageCoord, instant))
    },
    changeViewport: (viewport) => {
      return dispatch(changeAllDirect(viewport))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Zoom)
