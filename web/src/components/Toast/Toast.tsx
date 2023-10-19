import React, { useEffect, useState } from 'react'
import './Toast.scss'
import ButtonClose from '../ButtonClose/ButtonClose'
import { ShowToast, ToastState } from '../../context/ToastContext'

export type ToastProps = {
  toastState: ToastState
  setToastState: React.Dispatch<React.SetStateAction<ToastState>>
}

const Toast: React.FC<ToastProps> = ({ toastState, setToastState }) => {
  const isVisible = toastState.id === ShowToast.Yes
  // create a local cached state of whatever the most
  // recent text and type given is, so that we can make a nice
  // disappearing transition
  const { recentText, recentType } = useToastStateCache(toastState)
  return (
    <div className={`toast ${recentType} ${isVisible ? 'visible' : ''} `}>
      {recentText}
      <ButtonClose
        size={'small'}
        onClick={() => setToastState({ id: ShowToast.No })}
      />
    </div>
  )
}

export default Toast

function useToastStateCache(toastState: ToastState) {
  const [recentText, setRecentText] = useState('')
  const [recentType, setRecentType] = useState('')
  // update whenever toast state changes to any other
  // visible ToastState
  useEffect(() => {
    if (toastState.id !== ShowToast.No) {
      setRecentText(toastState.text)
      setRecentType(toastState.type)
    }
  }, [toastState])
  return {
    recentText,
    recentType,
  }
}
