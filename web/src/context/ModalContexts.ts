import React from 'react'
import { CellIdString } from '../types/shared'
import { ViewingReleaseNotes } from '../components/UpdateModal/UpdateModal'

export enum OpenModal {
  None,
  CreateProject,
  JoinProject,
  ImportProject,
  ProjectSettings,
  InviteMembers,
  DeleteProject,
  RemoveSelfProject,
  Preferences,
  ProfileEditForm,
  UpdateApp,
  ProjectMigrated,
}

export type ModalState =
  | {
      id: OpenModal.None
    }
  | {
      id: OpenModal.CreateProject
      passphrase: string
    }
  | {
      id: OpenModal.JoinProject
      passphrase: string
    }
  | {
      id: OpenModal.ImportProject
      passphrase: string
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
      id: OpenModal.Preferences
    }
  | {
      id: OpenModal.ProfileEditForm
    }
  | {
      id: OpenModal.ProjectMigrated
      cellId: CellIdString
    }
  | {
      id: OpenModal.UpdateApp
      section: ViewingReleaseNotes
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
