import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeScale } from '../../redux/ephemeral/viewport/actions'
import { RootState } from '../../redux/reducer'
import Zoom from './Zoom.component'

const ConnectedZoom = () => {
  const dispatch = useDispatch()
  const scale = useSelector((state: RootState) => state.ui.viewport.scale)
  const screensize = useSelector((state: RootState) => state.ui.screensize)
  const value = `${Math.round(scale * 100)}%`
  const zoom = (
    zoom: number,
    pageCoord: { x: number; y: number },
    instant?: boolean
  ) => {
    return dispatch(changeScale(zoom, pageCoord, instant))
  }
  const onClickPlus = () => {
    const zoomIntensity = 0.05
    const newZoom = Math.exp(1 * zoomIntensity)
    let { width, height } = screensize
    const instant = true
    zoom(newZoom, { x: width / 2, y: height / 2 }, instant)
  }
  const onClickMinus = () => {
    const zoomIntensity = 0.05
    const newZoom = Math.exp(-1 * zoomIntensity)
    let { width, height } = screensize
    const instant = true
    zoom(newZoom, { x: width / 2, y: height / 2 }, instant)
  }

  return (
    <Zoom value={value} onClickPlus={onClickPlus} onClickMinus={onClickMinus} />
  )
}

export default ConnectedZoom