import React, { useState, useEffect } from 'react'
import './ImportProjectModal.css'

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

function ImportProjectForm({
  importingProject,
  onSubmit,
  projectImported,
  projectData,
  setProjectData,
}) {

  const subheading =
    'You can share the project with people or just keep it to yourself'

  const actionButtonContent = (
    <ButtonWithPendingState
      pending={importingProject}
      pendingText='Importing...'
      actionText='Import'
    />
  )

  // validate before firing event
  const submit = () => {
    // set this to trigger the invalid field to show
    // setShouldInvalidateProjectName(true)
    if (projectData && !importingProject) {
      onSubmit()
    }
  }

  const onFilePicked = (e) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target.result
      try {
        const parsed = JSON.parse(text)
        setProjectData(parsed)
      } catch (e) {
        console.log('parse error')
      }
    }
    reader.readAsText(e.target.files[0])
  }

  return (
    <div
      className={`create-project-form ${
        projectImported ? 'project-created' : ''
      }`}
    >
      <ProjectModalHeading title='Import a project' />
      <ProjectModalSubHeading title={subheading} />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          <input type='file' onChange={onFilePicked} />
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton text={actionButtonContent} onClick={submit} />
    </div>
  )
}

function ProjectCreatedModal({ onDone, projectImported, projectSecret }) {
  return (
    <div
      className={`project-created-modal ${
        projectImported ? 'project-created' : ''
      }`}
    >
      <ProjectModalHeading title='New project created!' />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          <ProjectSecret passphrase={projectSecret} />
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton text='Done' onClick={onDone} />
    </div>
  )
}

export default function ImportProjectModal({
  showModal,
  onClose,
  onImportProject,
}) {
  const [importingProject, setImportingProject] = useState(false)
  const [projectImported, setProjectImported] = useState(false)
  const [projectSecret, setProjectSecret] = useState('')
  const [projectData, setProjectData] = useState(null)
  let hasUnmounted = false
  
  const reset = () => {
    setProjectData(null)
  }
  const onSubmit = async () => {
    setImportingProject(true)
    await onImportProject(projectData, projectSecret)
    setImportingProject(false)
    setProjectImported(true)
    reset()
  }
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
    setProjectImported(false)
    genAndSetPassphrase()
  }

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
      onClose={projectImported ? onDone : onClose}
      className='create-project-modal-wrapper'
    >
      <ProjectCreatedModal
        projectSecret={projectSecret}
        onDone={onDone}
        projectImported={projectImported}
      />
      <ImportProjectForm
        onSubmit={onSubmit}
        importingProject={importingProject}
        projectImported={projectImported}
        projectData={projectData}
        setProjectData={setProjectData}
      />
    </Modal>
  )
}
