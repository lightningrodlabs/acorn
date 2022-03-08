import React from 'react'
import './Zoom.css'
import Icon from '../Icon/Icon'

class Zoom extends React.Component {
  constructor (props) {
    super(props)
    this.zoomIn = this.zoomIn.bind(this)
    this.zoomOut = this.zoomOut.bind(this)
  }
  zoomIn () {
    const zoomIntensity = 0.05
    const zoom = Math.exp(1 * zoomIntensity)
    let { width, height } = this.props.screensize
    this.props.zoom(zoom, width / 2, height / 2)
  }
  zoomOut () {
    const zoomIntensity = 0.05
    const zoom = Math.exp(-1 * zoomIntensity)
    let { width, height } = this.props.screensize
    this.props.zoom(zoom, width / 2, height / 2)
  }
  render () {
    return (
      <div className='zoom-wrapper'>
        <Icon
          name='minus.svg'
          size='small'
          className='grey'
          withBackground={false}
          onClick={this.zoomOut}
        />
        <Icon
          name='plus.svg'
          size='small'
          className='grey'
          withBackground={false}
          onClick={this.zoomIn}
        />
        <span>{parseInt(this.props.scale * 100)}%</span>
      </div>
    )
  }
}
export default Zoom