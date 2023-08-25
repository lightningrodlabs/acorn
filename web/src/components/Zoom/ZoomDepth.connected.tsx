import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/reducer'
import Zoom from './Zoom.component'
import { changeDepthPerception } from '../../redux/ephemeral/depth-perception/actions'

const ConnectedZoomDepth = () => {
  const dispatch = useDispatch()
  const depthPerception = useSelector(
    (state: RootState) => state.ui.depthPerception.value
  )
  const changeP = (depthPerception: number) => {
    return dispatch(changeDepthPerception(depthPerception))
  }
  const onClickPlus = () => {
    changeP(depthPerception + 1)
  }
  const onClickMinus = () => {
    changeP(depthPerception - 1)
  }

  return (
    <Zoom
      value={depthPerception.toString()}
      onClickPlus={onClickPlus}
      onClickMinus={onClickMinus}
    />
  )
}

export default ConnectedZoomDepth
