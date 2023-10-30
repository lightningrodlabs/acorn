import React from 'react'
import { CellIdString } from '../types/shared'
import { ViewingReleaseNotes } from '../components/UpdateModal/UpdateModal'

export enum OpenModal {
  None,
  DeleteProject,
  RemoveSelfProject,
  UpdateApp,
  ProjectSettings,
  InviteMembers,
  ProjectMigrated,
  Preferences,
  ProfileEditForm,
}

export type ModalState =
  | {
      id: OpenModal.None
    }
  | {
      id: OpenModal.DeleteProject
      cellId: CellIdString
      projectName: string
      projectAppId: string
    }
  | {
      id: OpenModal.RemoveSelfProject
      cellId: CellIdString
      projectName: string
      projectAppId: string
    }
  | {
      id: OpenModal.UpdateApp
      section: ViewingReleaseNotes
    }
  | {
      id: OpenModal.ProjectSettings
      cellId: CellIdString
    }
  | {
      id: OpenModal.InviteMembers
      passphrase: string
    }
  | {
      id: OpenModal.ProjectMigrated
      cellId: CellIdString
    }
  | {
      id: OpenModal.Preferences
    }
  | {
      id: OpenModal.ProfileEditForm
    }

export interface ModalContextsShape {
  modalState: ModalState
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
}

const ModalContexts = React.createContext<ModalContextsShape>({
  // default values
  modalState: {
    id: OpenModal.None,
  },
  setModalState: () => {},
})

export default ModalContexts
