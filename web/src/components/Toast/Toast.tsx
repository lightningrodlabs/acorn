import React, { useEffect, useRef, useState } from 'react'
import './Toast.scss'
import ButtonClose from '../ButtonClose/ButtonClose'
import { ShowToast, ToastState } from '../../context/ToastContext'
import Icon from '../Icon/Icon'

export type ToastProps = {
  toastState: ToastState
  setToastState: React.Dispatch<React.SetStateAction<ToastState>>
}

const Toast: React.FC<ToastProps> = ({ toastState, setToastState }) => {
  const isVisible = toastState.id === ShowToast.Yes
  // create a local cached state of whatever the most
  // recent text and type given is, so that we can make a nice
  // disappearing transition
  const { recentText, recentType } = useToastStateCache(
    toastState,
    setToastState
  )
  return (
    <div className={`toast ${recentType} ${isVisible ? 'visible' : ''} `}>
      <Icon name={`${recentType}.svg`} className='toast-icon not-clickable' size='small'/>
      <div className="toast-text">{recentText}</div>
      <div className="toast-close">
      <ButtonClose
        size={'small'}
        onClick={() => setToastState({ id: ShowToast.No })}
      />
      </div>
    </div>
  )
}

export default Toast

const TOAST_TIMEOUT_DELAY = 4000

// 2 purposes:
// 1. cache the most recent text and type of toast
// 2. set a timeout-driven delay to clear the toast
function useToastStateCache(
  toastState: ToastState,
  setToastState: React.Dispatch<React.SetStateAction<ToastState>>
) {
  const [recentText, setRecentText] = useState('')
  const [recentType, setRecentType] = useState('')
  const intervalRef = useRef<number | undefined>(undefined)
  // update whenever toast state changes to any other
  // visible ToastState
  useEffect(() => {
    if (toastState.id !== ShowToast.No) {
      setRecentText(toastState.text)
      setRecentType(toastState.type)
      // clear any previous interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // set a new interval to clear the toast
      intervalRef.current = window.setTimeout(() => {
        setToastState({ id: ShowToast.No })
      }, TOAST_TIMEOUT_DELAY)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [toastState])
  return {
    recentText,
    recentType,
  }
}
