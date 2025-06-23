import React, { useState, useRef, useEffect } from 'react'

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
import { CellIdString } from '../../types/shared'
import { installProject } from '../../projects/installProject'
import { CellId } from '@holochain/client'
import { BackwardsCompatibleProjectExportSchema, Profile } from 'zod-models'
import { generatePassphrase } from '../../secrets'
import { WireRecord } from '../../api/hdkCrud'
import {
  setProjectMemberProfile,
  setProjectWhoami,
} from '../../redux/persistent/projects/members/actions'
import { fetchMyLocalProfile } from '../../utils'
import { useStore } from 'react-redux'

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
              Import an Acorn project from a previously exported <b>JSON</b>{' '}
              formatted file.
              <p />A random new secret phrase for this project will be assigned.
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

function FileInvalidModal({ showModal, onDone, errorMessage }) {
  return (
    <Modal
      white
      active={showModal}
      onClose={onDone}
      className="import-project-modal-wrapper"
    >
      <ProjectModalHeading title="Project not imported" />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          <div className="import-project-content-wrapper">{errorMessage}</div>
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton text="Done" onClick={onDone} />
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
  onImportProject: (
    cellIdString: CellIdString,
    projectData: any,
    passphrase: string
  ) => Promise<void>
  uninstallProject: (cellId: CellIdString) => Promise<void>
}

const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  showModal,
  onClose,
  onImportProject,
  uninstallProject,
}) => {
  // actively importing
  const [importingProject, setImportingProject] = useState(false)
  const [projectImported, setProjectImported] = useState(false)
  const [error, setError] = useState('')
  const [projectName, setProjectName] = useState('')
  const [outcomeCount, setOutcomeCount] = useState(0)

  const onFilePicked = async (projectData: object) => {
    let projectIds: {
      cellIdString: CellIdString
      cellId: CellId
      whoami: WireRecord<Profile>
    }
    try {
      let projectDataParsed = BackwardsCompatibleProjectExportSchema.parse(
        projectData
      )
      const newRandomPassphrase = await generatePassphrase()
      const newProjectData = {
        ...projectDataParsed,
        projectMeta: {
          ...projectDataParsed.projectMeta,
          passphrase: newRandomPassphrase,
        },
      }
      setImportingProject(true)
      setProjectName(newProjectData.projectMeta.name)
      setOutcomeCount(Object.keys(newProjectData.outcomes).length)
      // first step is to install the app and DNA
      projectIds = await installProject(newRandomPassphrase)
      const whoami = projectIds.whoami
        ? projectIds.whoami.entry
        : await fetchMyLocalProfile()
      // keep the existing passphrase, such that other users know how
      // to enter the new project
      await onImportProject(
        projectIds.cellIdString,
        projectData,
        newRandomPassphrase
      )
      setImportingProject(false)
      setProjectImported(true)
    } catch (e) {
      console.error(e)
      // if the project was installed, but then failed during import,
      // uninstall it
      if (projectIds) {
        // purposefully do nothing if this fails
        uninstallProject(projectIds.cellIdString).catch(() => {})
      }
      setImportingProject(false)
      setError(e.message)
    }
  }
  const onDone = () => {
    onClose()
    setError('')
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
      <FileInvalidModal
        errorMessage={error}
        showModal={showModal && error !== ''}
        onDone={onDone}
      />
    </>
  )
}

export default ImportProjectModal
