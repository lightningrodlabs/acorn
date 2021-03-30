import React, { useState, useEffect } from 'react'
import './ImportProjectModal.css'

import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
  ProjectModalSubHeading
} from '../ProjectModal/ProjectModal'
import ProjectSecret from '../ProjectSecret/ProjectSecret'
import ButtonWithPendingState from '../ButtonWithPendingState/ButtonWithPendingState'

// since this is a big wordset, dynamically import it
// instead of including in the main bundle
async function generatePassphrase () {
  const { default: randomWord } = await import('diceware-word')
  return `${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()}`
}

function ImportProjectForm ({
  importingProject,
  onSubmit,
  projectImported,
  projectData,
  setProjectData
}) {
  const subheading = (
    <div>
      Import a previously exported Acorn project in <b>JSON format</b>.
    </div>
  )

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

  const onFilePicked = e => {
    const reader = new FileReader()
    reader.onload = async e => {
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
      className={`import-project-form ${
        projectImported ? 'project-imported' : ''
      }`}
    >
      <ProjectModalHeading title='Import a project' />
      <ProjectModalSubHeading title={subheading} />
      <ProjectModalContentSpacer>
        <ProjectModalContent></ProjectModalContent>
      </ProjectModalContentSpacer>
      <input
        className='browse-files-button'
        type='file'
        onChange={onFilePicked}
      />
      <ProjectModalButton text={actionButtonContent} onClick={submit} />
    </div>
  )
}

function ProjectImportedModal ({ onDone, projectImported, projectSecret }) {
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

export default function ImportProjectModal ({
  showModal,
  onClose,
  onImportProject
}) {
  // actively importing
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
      className='import-project-modal-wrapper'
    >
      {!projectImported && (
        <ImportProjectForm
          onSubmit={onSubmit}
          importingProject={importingProject}
          projectImported={projectImported}
          projectData={projectData}
          setProjectData={setProjectData}
        />
      )}

      {projectImported && (
        <ProjectImportedModal
          projectSecret={projectSecret}
          onDone={onDone}
          projectImported={projectImported}
        />
      )}
    </Modal>
  )
}
