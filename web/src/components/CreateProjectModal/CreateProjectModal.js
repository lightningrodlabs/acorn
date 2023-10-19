import React, { useState, useEffect } from 'react'
import './CreateProjectModal.scss'

import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'
import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
  ProjectModalSubHeading,
} from '../ProjectModal/ProjectModal'
import ProjectSecret from '../ProjectSecret/ProjectSecret'
import ButtonWithPendingState from '../ButtonWithPendingState/ButtonWithPendingState'

// since this is a big wordset, dynamically import it
// instead of including in the main bundle
async function generatePassphrase() {
  const { default: randomWord } = await import('diceware-word')
  return `${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()}`
}

function CreateProjectForm({
  creatingProject,
  onSubmit,
  projectCreated,
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

  useEffect(() => {
    // if (projectCoverUrl.length > 0) {
    //   setisValidProjectCoverUrl(true)
    // } else {
    //   setisValidProjectCoverUrl(false)
    //   setErrorProjectCoverUrl('Project name is not... ?')
    // }
  }, [projectCoverUrl])

  const subheading =
    'You can share the project with people or just keep it to yourself'

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
    <div
      className={`create-project-form ${
        projectCreated ? 'project-created' : ''
      }`}
    >
      <ProjectModalHeading title="Create a new project" />
      <ProjectModalSubHeading title={subheading} />
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

function ProjectCreatedModal({ onDone, projectCreated, projectSecret }) {
  return (
    <div
      className={`project-created-modal ${
        projectCreated ? 'project-created' : ''
      }`}
    >
      <ProjectModalHeading title="New project created!" />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          <ProjectSecret passphrase={projectSecret} />
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton text="Done" onClick={onDone} />
    </div>
  )
}

export default function CreateProjectModal({
  showModal,
  onClose,
  onCreateProject,
}) {
  const reset = () => {
    setProjectName('')
    setProjectCoverUrl('')
  }
  const [creatingProject, setCreatingProject] = useState(false)

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
      setCreatingProject(false)
      setProjectCreated(true)
      reset()
    } catch (e) {
      console.log(e)
    }
  }

  let hasUnmounted = false

  const genAndSetPassphrase = async () => {
    try {
      const passphrase = await generatePassphrase()
      if (!hasUnmounted) setProjectSecret(passphrase)
    } catch (e) {
      console.log(e)
    }
  }

  const onDone = () => {
    onClose()
    setProjectCreated(false)
    genAndSetPassphrase()
  }

  const [projectSecret, setProjectSecret] = useState('')
  const [projectCreated, setProjectCreated] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectCoverUrl, setProjectCoverUrl] = useState('')

  // generate a passphrase on component mount
  useEffect(() => {
    hasUnmounted = false
    genAndSetPassphrase()
    return () => {
      hasUnmounted = true
    }
  }, [])

  return (
    <Modal
      white
      active={showModal}
      onClose={projectCreated ? onDone : onClose}
      className="create-project-modal-wrapper"
    >
      <ProjectCreatedModal
        projectSecret={projectSecret}
        onDone={onDone}
        projectCreated={projectCreated}
      />
      <CreateProjectForm
        onSubmit={onSubmit}
        creatingProject={creatingProject}
        projectCreated={projectCreated}
        projectName={projectName}
        setProjectName={setProjectName}
        projectCoverUrl={projectCoverUrl}
        setProjectCoverUrl={setProjectCoverUrl}
      />
    </Modal>
  )
}
