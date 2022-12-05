import React, { useState, useRef } from 'react'

import './ImportProjectModal.scss'

// @ts-ignore
import AcornLogo from '../../images/acorn-logo.svg'

import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
} from '../ProjectModal/ProjectModal'

function ImportProjectFilePicker({ showModal, onFilePicked, onCancel }) {
  const [fileFormatInvalidMessage, setFileFormatInvalidMessage] = useState(
    false
  )
  const handleFilePicked = (e) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target.result as string
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
      className="import-project-modal-wrapper"
    >
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
            <div className="import-project-content-wrapper">
              Import an Acorn project from a previously exported{' '}
              <strong>JSON</strong> formatted file. The project secret will
              remain the same.
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
        className="browse-files-button"
        type="file"
        accept="application/json, .json, .JSON"
        onChange={handleFilePicked}
      />
      <ProjectModalButton text="Browse Files" onClick={onBrowseFilesClick} />
    </Modal>
  )
}

function ImportingProjectModal({ showModal }) {
  return (
    <Modal white active={showModal} className="import-project-modal-wrapper">
      <div className="importing-modal-content">
        <img src={AcornLogo} />
        <div className="importing-modal-content-title">
          Importing your project
        </div>
        <div>This might take up to a few minutes</div>
      </div>
    </Modal>
  )
}

function ProjectImportedModal({
  showModal,
  onDone,
  projectName,
  outcomeCount,
}) {
  return (
    <Modal
      white
      active={showModal}
      onClose={onDone}
      className="import-project-modal-wrapper"
    >
      <ProjectModalHeading title="Project imported!" />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          <div className="import-project-content-wrapper">
            <strong>{projectName}</strong> with{' '}
            <strong>{outcomeCount} outcomes</strong> was successfully imported.
          </div>
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton text="Done" onClick={onDone} />
    </Modal>
  )
}

export type ImportProjectModalProps = {
  showModal: boolean
  onClose: () => void
  onImportProject: (projectData: any, passphrase: string) => Promise<void>
}

const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  showModal,
  onClose,
  onImportProject,
}) => {
  // actively importing
  const [importingProject, setImportingProject] = useState(false)
  const [projectImported, setProjectImported] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [outcomeCount, setOutcomeCount] = useState(0)

  const onFilePicked = async (projectData) => {
    if (!projectData.tags) {
      alert('Cannot import projects from versions prior to v1.0.0-alpha')
      onClose()
      return
    }
    setImportingProject(true)
    setProjectName(projectData.projectMeta.name)
    setOutcomeCount(Object.keys(projectData.outcomes).length)
    // keep the existing passphrase, such that other users know how
    // to enter the new project
    await onImportProject(projectData, projectData.projectMeta.passphrase)
    setImportingProject(false)
    setProjectImported(true)
  }
  const onDone = () => {
    onClose()
    setProjectImported(false)
  }

  return (
    <>
      <ImportProjectFilePicker
        showModal={showModal && !projectImported && !importingProject}
        onCancel={onDone}
        onFilePicked={onFilePicked}
      />
      <ImportingProjectModal showModal={showModal && importingProject} />
      <ProjectImportedModal
        showModal={showModal && projectImported}
        onDone={onDone}
        projectName={projectName}
        outcomeCount={outcomeCount}
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

export default ImportProjectModal
