import React, { useState, useEffect, useContext } from 'react'
import './CreateProjectModal.scss'

import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'
import Modal, { ModalContent } from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
  ProjectModalSubHeading,
} from '../ProjectModal/ProjectModal'
import ProjectSecret from '../ProjectSecret/ProjectSecret'
import ButtonWithPendingState from '../ButtonWithPendingState/ButtonWithPendingState'
import { generatePassphrase } from '../../secrets'
import ToastContext, { ShowToast } from '../../context/ToastContext'

function CreateProjectForm({
  creatingProject,
  onSubmit,
  projectName,
  setProjectName,
  projectCoverUrl,
  setProjectCoverUrl,
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

  const actionButtonContent = (
    <ButtonWithPendingState
      pending={creatingProject}
      pendingText="Creating..."
      actionText="Create Project"
    />
  )

  // validate before firing event
  const submit = () => {
    // set this to trigger the invalid field to show
    setShouldInvalidateProjectName(true)
    if (projectName.length > 0 && !creatingProject) {
      onSubmit()
    }
  }

  return (
    <div className={'create-project-form'}>
      <ProjectModalHeading title="Create a new project" />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
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
          <div className="create-project-image-row">
            <ValidatingFormInput
              value={projectCoverUrl}
              onChange={setProjectCoverUrl}
              label="Project Cover Image (optional)"
              placeholder="Paste in your project image URL here"
              invalidInput={
                projectCoverUrl.length > 0 && !isValidProjectCoverUrl
              }
              validInput={projectCoverUrl.length > 0 && isValidProjectCoverUrl}
              errorText={errorProjectCoverUrl}
            />
            <div
              className="create-project-image"
              style={{ backgroundImage: `url(${projectCoverUrl})` }}
            />
          </div>
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton
        text={actionButtonContent}
        onClick={submit}
        disabled={creatingProject || projectName.length === 0}
      />
    </div>
  )
}
export default function CreateProjectModal({
  showModal,
  onClose,
  onCreateProject,
}) {
  // pull in the toast context
  const { setToastState } = useContext(ToastContext)

  const [creatingProject, setCreatingProject] = useState(false)
  const [projectSecret, setProjectSecret] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectCoverUrl, setProjectCoverUrl] = useState('')

  const genAndSetPassphrase = async () => {
    try {
      const passphrase = await generatePassphrase()
      if (!hasUnmounted) setProjectSecret(passphrase)
    } catch (e) {
      console.log(e)
    }
  }

  let hasUnmounted = false

  // generate a passphrase on component mount
  useEffect(() => {
    hasUnmounted = false
    genAndSetPassphrase()
    return () => {
      hasUnmounted = true
    }
  }, [])

  const resetCreateProjectState = () => {
    onClose()
    // wait for the closing of the modal animation
    setTimeout(() => {
      setCreatingProject(false)
      setProjectName('')
      setProjectCoverUrl('')
      genAndSetPassphrase()
    }, 100)
  }

  const onSubmit = async () => {
    setCreatingProject(true)
    try {
      await onCreateProject(
        {
          name: projectName,
          image: projectCoverUrl,
        },
        projectSecret
      )
      resetCreateProjectState()
      // if project creation is successful
      setToastState({
        id: ShowToast.Yes,
        text: 'New project created',
        type: 'confirmation',
      })
    } catch (e) {
      // if project creation is not successful
      console.log(e)
      resetCreateProjectState()
      setToastState({
        id: ShowToast.Yes,
        text: 'Error creating project',
        type: 'destructive',
      })
    }
  }

  return (
    <Modal
      white
      active={showModal}
      onClose={onClose}
      className="create-project-modal-wrapper"
    >
      <CreateProjectForm
        onSubmit={onSubmit}
        creatingProject={creatingProject}
        projectName={projectName}
        setProjectName={setProjectName}
        projectCoverUrl={projectCoverUrl}
        setProjectCoverUrl={setProjectCoverUrl}
      />
    </Modal>
  )
}
