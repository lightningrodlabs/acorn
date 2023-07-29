import React, { useState, useEffect } from 'react'
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
import { WithActionHash } from '../../types/shared'

function EditProjectForm({
  updatingProject,
  onSubmit,
  projectName,
  setProjectName,
  projectCoverUrl,
  setProjectCoverUrl,
  projectPassphrase,
  openInviteMembersModal,
}) {
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

  const subheading = `Any changes will apply for all team members.`

  // validate before firing event
  const submit = () => {
    // set this to trigger the invalid field to show
    setShouldInvalidateProjectName(true)
    if (projectName.length > 0 && !updatingProject) {
      onSubmit()
    }
  }

  return (
    <div className="edit-project-form">
      <ProjectModalHeading title="Project Settings" />
      <ProjectModalSubHeading title={subheading} />
      <ProjectModalContent>
        {/* Invite Members Button */}
        <div
          className="my-projects-button invite-members"
          onClick={() => openInviteMembersModal(projectPassphrase)}
        >
          <Icon name="user-plus.svg" size="small" className="grey" />
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
          placeholder="The best project ever"
        />
        {/* project cover image */}
        <div className="edit-project-image-row">
          <ValidatingFormInput
            value={projectCoverUrl}
            onChange={setProjectCoverUrl}
            label="Project Cover Image (optional)"
            placeholder="Paste in your project image URL here"
            invalidInput={projectCoverUrl.length > 0 && !isValidProjectCoverUrl}
            validInput={projectCoverUrl.length > 0 && isValidProjectCoverUrl}
            errorText={errorProjectCoverUrl}
          />
          <div
            className="edit-project-image"
            style={{ backgroundImage: `url(${projectCoverUrl})` }}
          />
        </div>
      </ProjectModalContent>
      <ProjectModalButton text="Update" onClick={submit} />
    </div>
  )
}

export default function ProjectSettingsModal({
  showModal,
  onClose,
  project = {} as WithActionHash<ProjectMeta>,
  updateProjectMeta,
  openInviteMembersModal,
  cellIdString,
}) {
  const [updatingProject, setUpdatingProject] = useState(false)

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
    onClose()
  }

  // editable
  useEffect(() => {
    if (project) {
      setProjectName(project.name)
      setProjectCoverUrl(project.image)
      setProjectPassphrase(project.passphrase)
    }
  }, [project])
  const [projectName, setProjectName] = useState('')
  const [projectCoverUrl, setProjectCoverUrl] = useState('')
  const [projectPassphrase, setProjectPassphrase] = useState('')

  return (
    <Modal
      white
      active={showModal}
      onClose={onClose}
      className="edit-project-modal-wrapper"
    >
      <EditProjectForm
        onSubmit={onSubmit}
        updatingProject={updatingProject}
        projectName={projectName}
        openInviteMembersModal={openInviteMembersModal}
        projectPassphrase={projectPassphrase}
        setProjectName={setProjectName}
        projectCoverUrl={projectCoverUrl}
        setProjectCoverUrl={setProjectCoverUrl}
      />
    </Modal>
  )
}
