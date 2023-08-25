import React from 'react'
import './Zoom.scss'
import Icon from '../Icon/Icon'

// export type StateZoomProps = {
//   screensize: { width: number; height: number }
//   scale: number
// }

// export type DispatchZoomProps = {
//   zoom: (
//     zoom: number,
//     pageCoord: { x: number; y: number },
//     instant?: boolean
//   ) => void
// }

export type ZoomProps = {
  onClickPlus: () => void
  onClickMinus: () => void
  value: string
}

const Zoom: React.FC<ZoomProps> = ({ onClickPlus, onClickMinus, value }) => {
  return (
    <div className="zoom-wrapper">
      <Icon
        name="minus.svg"
        size="small"
        className="grey"
        withBackground={false}
        onClick={onClickMinus}
      />
      <Icon
        name="plus.svg"
        size="small"
        className="grey"
        withBackground={false}
        onClick={onClickPlus}
      />
      <span>{value}</span>
    </div>
  )
}

export default Zoom
