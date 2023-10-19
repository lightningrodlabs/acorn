import React from 'react'

export enum ShowToast {
  No,
  Yes,
}

export type ToastState =
  | {
      id: ShowToast.No
    }
  | {
      id: ShowToast.Yes
      text: string
      type: 'confirmation' | 'information' | 'warning' | 'destructive'
    }

export interface ToastContextShape {
  toastState: ToastState
  setToastState: React.Dispatch<React.SetStateAction<ToastState>>
}

const ToastContext = React.createContext<ToastContextShape>({
  // default values
  toastState: {
    id: ShowToast.No,
  },
  setToastState: () => {},
})

export default ToastContext
