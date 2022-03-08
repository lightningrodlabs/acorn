import React from 'react'
import './Zoom.css'
import Icon from '../Icon/Icon'
import { connect } from 'react-redux'
import { changeScale } from '../../redux/ephemeral/viewport/actions'
import Zoom from './Zoom.component'

function mapDispatchToProps (dispatch) {
  return {
    zoom: (zoom, x, y) => {
      return dispatch(changeScale(zoom, x, y))
    }
  }
}

function mapStateToProps (state) {
  return {
    screensize: state.ui.screensize,
    scale: state.ui.viewport.scale
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Zoom)
