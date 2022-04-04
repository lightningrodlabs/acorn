import React, { useState, useEffect } from 'react'
import './ProjectSettingsModal.scss'
import { PriorityModeOptions } from '../../constants'
import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'
import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalHeading,
  ProjectModalSubHeading,
} from '../ProjectModal/ProjectModal'
import PreferenceSelect, { PreferenceSelectOption } from '../PreferenceSelect/PreferenceSelect'
import Icon from '../Icon/Icon'

// since this is a big wordset, dynamically import it
// instead of including in the main bundle
async function generatePassphrase() {
  const { default: randomWord } = await import('diceware-word')
  return `${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()} ${randomWord()}`
}

function EditProjectForm({
  updatingProject,
  onSubmit,
  projectName,
  setProjectName,
  projectCoverUrl,
  setProjectCoverUrl,
  priorityMode,
  setPriorityMode,
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

  const changeProjectName = name => {
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

  const universalOption = <PreferenceSelectOption
    key='preference-select-universal'
    active={priorityMode === PriorityModeOptions.Universal}
    onClick={() => setPriorityMode(PriorityModeOptions.Universal)}
    iconName='earth.svg'
    iconExtraClassName=""
    title="Universal"
  />
  const voteOption = <PreferenceSelectOption
    key='preference-select-vote'
    active={priorityMode === PriorityModeOptions.Vote}
    onClick={() => setPriorityMode(PriorityModeOptions.Vote)}
    iconName='team.svg'
    iconExtraClassName=""
    title="Vote Based"
  />

  return (
    <div className='edit-project-form'>
      <ProjectModalHeading title='Project Settings' />
      <ProjectModalSubHeading title={subheading} />
      <ProjectModalContent>
        {/* Invite Members Button */}
        <div
          className="my-projects-button invite-members"
          onClick={() => openInviteMembersModal(projectPassphrase)}
        >
          <Icon
            name="user-plus.svg"
            size="small"
            className="grey"
          />
          Invite Members
        </div>
        {/* project name */}
        <ValidatingFormInput
          value={projectName}
          onChange={changeProjectName}
          invalidInput={!isValidProjectName}
          validInput={projectName.length > 0 && isValidProjectName}
          errorText={errorProjectName}
          label='Project Name'
          placeholder='The best project ever'
        />
        {/* project cover image */}
        <div className='edit-project-image-row'>
          <ValidatingFormInput
            value={projectCoverUrl}
            onChange={setProjectCoverUrl}
            label='Project Cover Image'
            placeholder='Paste in your project image URL here'
            invalidInput={
              projectCoverUrl.length > 0 && !isValidProjectCoverUrl
            }
            validInput={projectCoverUrl.length > 0 && isValidProjectCoverUrl}
            errorText={errorProjectCoverUrl}
          />
          <div
            className='edit-project-image'
            style={{ backgroundImage: `url(${projectCoverUrl})` }}
          />
        </div>
        {/* project priority mode setting */}
        <PreferenceSelect title="Prioritization Mode" subtitle="Select your preferred prioritization mode for you and your team in this project." options={[universalOption, voteOption]} />
      </ProjectModalContent>
      <ProjectModalButton text='Update' onClick={submit} />
    </div>
  )
}

export default function ProjectSettingsModal({
  showModal,
  onClose,
  updateProjectMeta,
  openInviteMembersModal,
  project,
  cellIdString,
}) {
  const [updatingProject, setUpdatingProject] = useState(false)

  const onSubmit = async () => {
    setUpdatingProject(true)
    await updateProjectMeta(
      {
        // editable
        name: projectName,
        image: projectCoverUrl,
        priorityMode: priorityMode,
        // not editable
        creatorAgentPubKey: project.creatorAgentPubKey,
        createdAt: project.createdAt,
        passphrase: project.passphrase,
        isImported: project.isImported,
        topPriorityOutcomes: project.topPriorityOutcomes,
      },
      project.headerHash,
      cellIdString,
    )
    setUpdatingProject(false)
    onClose()
  }

  // editable
  useEffect(() => {
    setProjectName(project.name)
    setProjectCoverUrl(project.image)
    setPriorityMode(project.priorityMode)
    setProjectPassphrase(project.passphrase)
  }, [project])
  const [projectName, setProjectName] = useState(project.name)
  const [projectCoverUrl, setProjectCoverUrl] = useState(project.image)
  const [priorityMode, setPriorityMode] = useState(project.priorityMode)
  const [projectPassphrase, setProjectPassphrase] = useState(project.passphrase)

  return (
    <Modal
      white
      active={showModal}
      onClose={onClose}
      className='edit-project-modal-wrapper'>
      <EditProjectForm
        onSubmit={onSubmit}
        updatingProject={updatingProject}
        projectName={projectName}
        openInviteMembersModal={openInviteMembersModal}
        projectPassphrase={projectPassphrase}
        setProjectName={setProjectName}
        projectCoverUrl={projectCoverUrl}
        setProjectCoverUrl={setProjectCoverUrl}
        priorityMode={priorityMode}
        setPriorityMode={setPriorityMode}
      />
    </Modal>
  )
}
