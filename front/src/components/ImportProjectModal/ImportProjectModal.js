import React, { useState, useEffect, useRef } from 'react'
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

function ImportProjectFilePicker ({ showModal, onFilePicked, onCancel }) {
  const [fileFormatInvalidMessage, setFileFormatInvalidMessage] = useState(
    false
  )
  const handleFilePicked = e => {
    const reader = new FileReader()
    reader.onload = async e => {
      const text = e.target.result
      try {
        const parsed = JSON.parse(text)
        onFilePicked(parsed)
      } catch (e) {
        setFileFormatInvalidMessage(true)
      }
    }
    reader.readAsText(e.target.files[0])
  }

  // browse files button
  const fileInput = useRef(null)
  const onBrowseFilesClick = () => {
    // `current` points to the mounted hidden file input element
    fileInput.current.click()
  }

  return (
    <Modal
      white
      active={showModal}
      onClose={onCancel}
      className='import-project-modal-wrapper'
    >
      {/* <div className='import-project-form'> */}
      <ProjectModalHeading
        title={
          fileFormatInvalidMessage
            ? 'File format is invalid'
            : 'Import a project'
        }
      />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          {!fileFormatInvalidMessage && (
            <div className='import-project-content-wrapper'>
              Import an Acorn project from a previously exported{' '}
              <strong>JSON</strong> formatted file.
            </div>
          )}
          {fileFormatInvalidMessage && (
            <div>
              The content of selected file does not follow JSON format. :'(
            </div>
          )}
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <input
        ref={fileInput}
        className='browse-files-button'
        type='file'
        accept='application/json, .json, .JSON'
        onChange={handleFilePicked}
      />
      <ProjectModalButton text='Browse Files' onClick={onBrowseFilesClick} />
      {/* </div> */}
    </Modal>
  )
}

function ImportingProjectModal ({ showModal }) {
  return (
    <Modal white active={showModal} className='import-project-modal-wrapper'>
      {/* <div className='import-project-form'> */}
      {/* <ProjectModalContent> */}
      <div className='importing-modal-content'>
        <img src='img/acorn-logo.svg' />
        <div className='importing-modal-content-title'>
          Importing your project
        </div>
        <div>This might take up to a few minutes</div>
      </div>
      {/* </ProjectModalContent> */}
      {/* </div> */}
    </Modal>
  )
}

function ProjectImportedModal ({ showModal, onDone, projectName, goalCount }) {
  return (
    <Modal
      white
      active={showModal}
      onClose={onDone}
      className='import-project-modal-wrapper'
    >
      {/* <div className='import-project-form'> */}
      <ProjectModalHeading title='Project imported!' />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          <div className='import-project-content-wrapper'>
            <strong>{projectName}</strong> with{' '}
            <strong>{goalCount} goals</strong> was successfully imported.
          </div>
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton text='Done' onClick={onDone} />
      {/* </div> */}
    </Modal>
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
  const [projectName, setProjectName] = useState('')
  const [goalCount, setGoalCount] = useState('')
  let hasUnmounted = false

  const onFilePicked = async projectData => {
    setImportingProject(true)
    setProjectName(projectData.projectMeta.name)
    setGoalCount(Object.keys(projectData.goals).length)
    await onImportProject(projectData, projectSecret)
    setImportingProject(false)
    setProjectImported(true)
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
    <>
      <ImportProjectFilePicker
        showModal={showModal && !projectImported && !importingProject}
        onCancel={onDone}
        onFilePicked={onFilePicked}
      />
      <ImportingProjectModal
        showModal={showModal && importingProject}
        projectSecret={projectSecret}
        onDone={onDone}
        projectImported={projectImported}
      />
      <ProjectImportedModal
        showModal={showModal && projectImported}
        projectSecret={projectSecret}
        onDone={onDone}
        projectName={projectName}
        goalCount={goalCount}
      />
      {/* <FileInvalidModal
        showModal={showModal && projectImported}
        projectSecret={projectSecret}
        onDone={onDone}
        projectImported={projectImported}
      /> */}
    </>
  )
}
