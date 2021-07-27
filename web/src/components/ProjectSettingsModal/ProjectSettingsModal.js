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
import PreferenceSelect, { PreferenceSelectOption } from '../PreferenceSelect/PreferenceSelect'

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
      <ProjectModalButton text='Update' onClick={submit} />
    </div>
  )
}

function ProjectSettingsModal({
  showModal,
  onClose,
  updateProjectMeta,
  project
}) {
  const [updatingProject, setUpdatingProject] = useState(false)

  const onSubmit = async () => {
    setUpdatingProject(true)
    await updateProjectMeta(
      {
        // editable
        name: projectName,
        image: projectCoverUrl,
        priority_mode: priorityMode,
        // not editable
        creator_address: project.creator_address,
        created_at: project.created_at,
        passphrase: project.passphrase,
        is_imported: project.is_imported,
        top_priority_goals: project.top_priority_goals,
      },
      project.address,
      project.cellId
    )
    setUpdatingProject(false)
    onClose()
  }

  // editable
  useEffect(() => {
    setProjectName(project.name)
    setProjectCoverUrl(project.image)
    setPriorityMode(project.priority_mode)
  }, [project])
  const [projectName, setProjectName] = useState(project.name)
  const [projectCoverUrl, setProjectCoverUrl] = useState(project.image)
  const [priorityMode, setPriorityMode] = useState(project.priority_mode)

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

function mapStateToProps(_state) {
  // props for the componen
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
