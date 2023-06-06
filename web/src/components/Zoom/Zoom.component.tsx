import React from 'react'
import './Zoom.scss'
import Icon from '../Icon/Icon'
import useTheme from '../../hooks/useTheme'

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

const Zoom: React.FC<ZoomProps> = (props: ZoomProps) => {
  function zoomIn() {
    const zoomIntensity = 0.05
    const zoom = Math.exp(1 * zoomIntensity)
    let { width, height } = props.screensize
    const instant = true
    props.zoom(zoom, { x: width / 2, y: height / 2 }, instant)
  }
  function zoomOut() {
    const zoomIntensity = 0.05
    const zoom = Math.exp(-1 * zoomIntensity)
    let { width, height } = props.screensize
    const instant = true
    props.zoom(zoom, { x: width / 2, y: height / 2 }, instant)
  }

  const theme = useTheme()

  return (
    <div className={`zoom-wrapper ${theme}`}>
      <Icon
        name="minus.svg"
        size="small"
        className="grey"
        withBackground={false}
        onClick={zoomOut}
      />
      <Icon
        name="plus.svg"
        size="small"
        className="grey"
        withBackground={false}
        onClick={zoomIn}
      />
      <span className={`${theme}`}>{Math.round(props.scale * 100)}%</span>
    </div>
  )
}

export default Zoom
