import React, { useState, useEffect, useContext } from 'react'
import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'
import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalHeading,
  ProjectModalSubHeading,
} from '../ProjectModal/ProjectModal'
import Icon from '../Icon/Icon'
import './ProjectSettingsModal.scss'
import { ProjectMeta } from '../../types'
import { CellIdString, WithActionHash } from '../../types/shared'
import { ModalState, OpenModal } from '../../context/ModalContexts'
import { passphraseToUid } from '../../secrets'
import { PROJECT_APP_PREFIX } from '../../holochainConfig'
import { getAllApps } from '../../projectAppIds'
import ToastContext, { ShowToast } from '../../context/ToastContext'

function ProjectDeleteButton({
  onClick,
  text,
}: {
  onClick: () => void
  text: string
}) {
  return (
    <div className="project-settings-button delete-project" onClick={onClick}>
      <Icon name="delete-bin.svg" size="small" className="warning" />
      {text}
    </div>
  )
}

export type EditProjectFormProps = {
  updatingProject: boolean
  onSubmit: () => void
  projectCellId: CellIdString
  projectAppId: string
  projectName: string
  setProjectName: React.Dispatch<React.SetStateAction<string>>
  projectCoverUrl: string
  setProjectCoverUrl: React.Dispatch<React.SetStateAction<string>>
  projectPassphrase: string
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
  memberCount: number
}

function EditProjectForm({
  updatingProject,
  onSubmit,
  projectCellId,
  projectAppId,
  projectName,
  setProjectName,
  projectCoverUrl,
  setProjectCoverUrl,
  projectPassphrase,
  setModalState,
  memberCount,
}: EditProjectFormProps) {
  const [
    shouldInvalidateProjectName,
    setShouldInvalidateProjectName,
  ] = useState(false)
  const [isValidProjectName, setisValidProjectName] = useState(true)
  const [errorProjectName, setErrorProjectName] = useState('')

  const [isValidProjectCoverUrl, setisValidProjectCoverUrl] = useState(true)
  const [errorProjectCoverUrl, setErrorProjectCoverUrl] = useState('')

  const changeProjectName = (name) => {
    setShouldInvalidateProjectName(true)
    setProjectName(name)
  }
  const validateProjectName = () => {
    if (projectName.length > 0) {
      setisValidProjectName(true)
      setErrorProjectName('')
    } else if (shouldInvalidateProjectName) {
      setisValidProjectName(false)
      setErrorProjectName('Project name is required')
    }
  }
  useEffect(() => {
    validateProjectName()
  }, [projectName, shouldInvalidateProjectName])

  useEffect(() => {
    // if (projectCoverUrl.length > 0) {
    //   setisValidProjectCoverUrl(true)
    // } else {
    //   setisValidProjectCoverUrl(false)
    //   setErrorProjectCoverUrl('Project name is not... ?')
    // }
  }, [projectCoverUrl])

  // pull in the toast context
  const { setToastState } = useContext(ToastContext)

  // validate before firing event
  const submit = () => {
    // set this to trigger the invalid field to show
    setShouldInvalidateProjectName(true)
    if (projectName.length > 0 && !updatingProject) {
      onSubmit()
      setToastState({
        id: ShowToast.Yes,
        text: 'Project settings saved',
        type: 'confirmation',
      })
    }
  }

  return (
    <div className="project-settings">
      <ProjectModalHeading title="Project Settings" />
      <ProjectModalSubHeading title={''} />
      <ProjectModalContent>
        {/* Invite Members Button */}
        <div
          className="project-settings-button invite-members"
          onClick={() =>
            setModalState({
              id: OpenModal.InviteMembers,
              passphrase: projectPassphrase,
            })
          }
        >
          <Icon name="user-plus.svg" size="small" className="dark-grey" />
          Invite Members
        </div>

        {/* project name */}
        <ValidatingFormInput
          value={projectName}
          onChange={changeProjectName}
          invalidInput={!isValidProjectName}
          validInput={projectName.length > 0 && isValidProjectName}
          errorText={errorProjectName}
          label="Project Name"
          helpText="Changing project name will apply to all members."
          placeholder="The best project ever"
        />
        {/* project cover image */}
        <div className="project-settings-image-row">
          <ValidatingFormInput
            value={projectCoverUrl}
            onChange={setProjectCoverUrl}
            label="Project Cover Image (optional)"
            helpText="Changing project image will apply to all members."
            placeholder="Paste in your project image URL here"
            invalidInput={projectCoverUrl.length > 0 && !isValidProjectCoverUrl}
            validInput={projectCoverUrl.length > 0 && isValidProjectCoverUrl}
            errorText={errorProjectCoverUrl}
          />
          <div
            className="project-settings-image"
            style={{ backgroundImage: `url(${projectCoverUrl})` }}
          />
        </div>

        {/* Delete Button */}
        {/* Show if personal project: Delete Project Button */}
        {/* Show if shared project: Remove Yourself from Project Button */}
        <ProjectDeleteButton
          onClick={() =>
            setModalState({
              id:
                memberCount === 1
                  ? OpenModal.DeleteProject
                  : OpenModal.RemoveSelfProject,
              cellId: projectCellId,
              projectName,
              projectAppId,
            })
          }
          text={
            memberCount === 1
              ? 'Delete Project'
              : 'Remove Yourself from Project'
          }
        />
      </ProjectModalContent>
      <ProjectModalButton text="Save Changes" onClick={submit} />
    </div>
  )
}

export type ProjectSettingsModalProps = {
  showModal: boolean
  onClose: () => void
  project: WithActionHash<ProjectMeta>
  memberCount: number
  updateProjectMeta: any
  cellIdString: CellIdString
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
}

export default function ProjectSettingsModal({
  showModal,
  onClose,
  project,
  updateProjectMeta,
  cellIdString,
  setModalState,
  memberCount,
}: ProjectSettingsModalProps) {
  const [cachedProjectMetaHash, setCachedProjectMetaHash] = useState('')
  const [updatingProject, setUpdatingProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectCoverUrl, setProjectCoverUrl] = useState('')
  const [projectPassphrase, setProjectPassphrase] = useState('')
  const [installedAppId, setInstalledAppId] = useState('')

  const onSubmit = async () => {
    setUpdatingProject(true)
    await updateProjectMeta(
      {
        ...project,
        name: projectName,
        image: projectCoverUrl,
      },
      project.actionHash,
      cellIdString
    )
    setUpdatingProject(false)
    setCachedProjectMetaHash('')
    onClose()
  }

  const onCancel = () => {
    setCachedProjectMetaHash('')
    onClose()
  }

  // editable
  useEffect(() => {
    if (project && project.actionHash !== cachedProjectMetaHash) {
      setCachedProjectMetaHash(project.actionHash)
      setProjectName(project.name)
      setProjectCoverUrl(project.image)
      setProjectPassphrase(project.passphrase)
    }
  }, [project, setCachedProjectMetaHash])

  // TODO: once we migrate off version 9 stream, we can simplify this
  // this commented out code, because we won't have any projects that use
  // the old pattern which had randomness in it.
  // const uid = passphraseToUid(projectPassphrase)
  // const installedAppId = `${PROJECT_APP_PREFIX}-${uid}`
  useEffect(() => {
    getAllApps().then((apps) => {
      const appForCell = Object.entries(apps).find(([appId, appInfo]) => {
        return appInfo.cellIdString === cellIdString
      })
      if (appForCell) {
        setInstalledAppId(appForCell[0])
      }
    })
  }, [cellIdString])

  return (
    <Modal
      white
      active={showModal}
      onClose={onCancel}
      className="project-settings"
    >
      <EditProjectForm
        onSubmit={onSubmit}
        updatingProject={updatingProject}
        projectName={projectName}
        projectCellId={cellIdString}
        projectAppId={installedAppId}
        setModalState={setModalState}
        projectPassphrase={projectPassphrase}
        setProjectName={setProjectName}
        projectCoverUrl={projectCoverUrl}
        setProjectCoverUrl={setProjectCoverUrl}
        memberCount={memberCount}
      />
    </Modal>
  )
}

