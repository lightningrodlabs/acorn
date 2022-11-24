import React from 'react'
import './Zoom.scss'
import Icon from '../Icon/Icon'

export type StateZoomProps = {
  screensize: { width: number; height: number }
  scale: number
}

export type DispatchZoomProps = {
  zoom: (
    zoom: number,
    pageCoord: { x: number; y: number },
    instant?: boolean
  ) => void
}

export type ZoomProps = StateZoomProps & DispatchZoomProps

class Zoom extends React.Component<ZoomProps> {
  constructor(props: ZoomProps) {
    super(props)
    this.zoomIn = this.zoomIn.bind(this)
    this.zoomOut = this.zoomOut.bind(this)
  }
  zoomIn() {
    const zoomIntensity = 0.05
    const zoom = Math.exp(1 * zoomIntensity)
    let { width, height } = this.props.screensize
    const instant = true
    this.props.zoom(zoom, { x: width / 2, y: height / 2 }, instant)
  }
  zoomOut() {
    const zoomIntensity = 0.05
    const zoom = Math.exp(-1 * zoomIntensity)
    let { width, height } = this.props.screensize
    const instant = true
    this.props.zoom(zoom, { x: width / 2, y: height / 2 }, instant)
  }
  render() {
    return (
      <div className="zoom-wrapper">
        <Icon
          name="minus.svg"
          size="small"
          className="grey"
          withBackground={false}
          onClick={this.zoomOut}
        />
        <Icon
          name="plus.svg"
          size="small"
          className="grey"
          withBackground={false}
          onClick={this.zoomIn}
        />
        <span>{Math.round(this.props.scale * 100)}%</span>
      </div>
    )
  }
}
export default Zoom
