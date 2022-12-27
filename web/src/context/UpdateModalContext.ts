import React from 'react'

export interface UpdateModalContextShape {
  showUpdateModal: boolean
  setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>
}

const UpdateModalContext = React.createContext<UpdateModalContextShape>({
  showUpdateModal: false,
  setShowUpdateModal: () => {},
})

export default UpdateModalContext
