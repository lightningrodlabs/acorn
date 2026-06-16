import React from 'react'
import './Zoom.scss'
import Icon from '../Icon/Icon'
import {
  CoordinatesState,
  DimensionsState,
} from '../../redux/ephemeral/layout/state-type'
import { ViewportState } from '../../redux/ephemeral/viewport/state-type'
import { fitViewportToNodes } from '../../drawing/fitViewportToNodes'

export type StateZoomProps = {
  screensize: { width: number; height: number }
  scale: number
  coordinates: CoordinatesState
  dimensions: DimensionsState
}

export type DispatchZoomProps = {
  zoom: (
    zoom: number,
    pageCoord: { x: number; y: number },
    instant?: boolean
  ) => void
  changeViewport: (viewport: ViewportState) => void
}

export type ZoomProps = StateZoomProps & DispatchZoomProps

class Zoom extends React.Component<ZoomProps> {
  constructor(props: ZoomProps) {
    super(props)
    this.zoomIn = this.zoomIn.bind(this)
    this.zoomOut = this.zoomOut.bind(this)
    this.fitToScreen = this.fitToScreen.bind(this)
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
  // Frame every laid-out node within the screen — recovers the tree when it has
  // been panned/zoomed off-screen.
  fitToScreen() {
    const { coordinates, dimensions, screensize } = this.props
    const viewport = fitViewportToNodes(
      Object.keys(coordinates),
      coordinates,
      dimensions,
      screensize
    )
    if (viewport) this.props.changeViewport(viewport)
  }
  render() {
    return (
      <div className="zoom-wrapper">
        <Icon
          name="expand.svg"
          size="small"
          className="grey"
          withBackground={false}
          withTooltipTop
          tooltipText="Fit tree to screen"
          onClick={this.fitToScreen}
        />
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
