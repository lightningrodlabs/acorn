import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import './ProjectSettingsModal.css'
import { updateProjectMeta } from '../../projects/project-meta/actions'
import { PriorityModeOptions } from '../../constants'
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
import PreferenceSelect, { PreferenceSelectExtra, PreferenceSelectOption } from '../PreferenceSelect/PreferenceSelect'

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

  const subheading = `Change this project's name or image`

  // validate before firing event
  const submit = () => {
    // set this to trigger the invalid field to show
    setShouldInvalidateProjectName(true)
    if (projectName.length > 0 && !updatingProject) {
      onSubmit()
    }
  }

  const universalOption = <PreferenceSelectOption
    active={priorityMode === PriorityModeOptions.Universal}
    onClick={() => setPriorityMode(PriorityModeOptions.Universal)}
    iconName='trackpad.svg' // TODO
    iconExtraClassName=""
    title="Universal"
  />
  const voteOption = <PreferenceSelectOption
    active={priorityMode === PriorityModeOptions.Vote}
    onClick={() => setPriorityMode(PriorityModeOptions.Vote)}
    iconName='mouse.svg' // TODO
    iconExtraClassName=""
    title="Vote"
  />

  return (
    <div className='edit-project-form'>
      <ProjectModalHeading title='Edit project' />
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
          <PreferenceSelect title="Prioritization Mode" subtitle="Select your preferred prioritization mode for you and your team in this project. Changes will apply for all team members" options={[universalOption, voteOption]} />
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton text='Update' onClick={submit} />
    </div>
  )
}

function ProjectSettingsModal({
  showModal,
  onClose,
  updateProjectMeta,
  projectAddress,
  creatorAddress,
  createdAt,
  isImported,
  priorityModeProp,
  topPriorityGoals,
  passphrase,
  cellIdString,
  projectNameProp,
  projectCoverUrlProp,
}) {
  const [updatingProject, setUpdatingProject] = useState(false)

  const onSubmit = async () => {
    setUpdatingProject(true)
    await updateProjectMeta(
      {
        name: projectName,
        image: projectCoverUrl,
        creator_address: creatorAddress,
        created_at: createdAt,
        passphrase: passphrase,
        is_imported: isImported,
        priority_mode: priorityMode,
        top_priority_goals: topPriorityGoals,
      },
      projectAddress,
      cellIdString
    )
    setUpdatingProject(false)
    onClose()
  }

  const [projectName, setProjectName] = useState(projectNameProp)
  const [projectCoverUrl, setProjectCoverUrl] = useState(projectCoverUrlProp)
  const [priorityMode, setPriorityMode] = useState(priorityModeProp)

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
        setProjectName={setProjectName}
        projectCoverUrl={projectCoverUrl}
        setProjectCoverUrl={setProjectCoverUrl}
        priorityMode={priorityMode}
        setPriorityMode={setPriorityMode}
      />
    </Modal>
  )
}

function mapStateToProps(state) {
  // props for the component

  return {}
}

function mapDispatchToProps(dispatch) {
  // props for the component
  return {
    updateProjectMeta: (entry, address, cellIdString) => {
      return dispatch(
        updateProjectMeta.create({
          payload: { entry, address },
          cellIdString: cellIdString,
        })
      )
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectSettingsModal)
