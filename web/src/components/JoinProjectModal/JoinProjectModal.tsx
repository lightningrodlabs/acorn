import React, { useState } from 'react'
import './JoinProjectModal.scss'

import ValidatingFormInput from '../ValidatingFormInput/ValidatingFormInput'
import Modal from '../Modal/Modal'
import {
  ProjectModalButton,
  ProjectModalContent,
  ProjectModalContentSpacer,
  ProjectModalHeading,
  ProjectModalSubHeading,
} from '../ProjectModal/ProjectModal'
import ButtonWithPendingState from '../ButtonWithPendingState/ButtonWithPendingState'
import { CellIdString } from '../../types/shared'

function JoinProjectForm({
  checkDone,
  projectSecret,
  onSecretChange,
  invalidText,
  pendingJoiningProject,
  onClickDone,
}) {
  const joinProjectButtonContent = (
    <ButtonWithPendingState
      pending={pendingJoiningProject}
      pendingText="joining..."
      actionText="Join Project"
    />
  )

  return (
    <div
      className={`join-project-form ${
        checkDone ? 'project-join-check-is-done' : ''
      }`}
    >
      <ProjectModalHeading title="Join an existing project" />
      <ProjectModalSubHeading title="You will need to sync with a peer to get started" />
      <ProjectModalContentSpacer>
        <ProjectModalContent>
          {/* @ts-ignore */}
          <ValidatingFormInput
            value={projectSecret}
            onChange={onSecretChange}
            invalidInput={invalidText}
            errorText={invalidText}
            label="Project Invitation Secret"
            helpText="Paste the 5 word secret you received from the project host"
          />
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton
        text={joinProjectButtonContent}
        onClick={onClickDone}
        // show the button as disabled if there is a text about invalid secret input
        // or if there is no input
        disabled={invalidText !== '' || projectSecret === ''}
      />
    </div>
  )
}

function ProjectJoinFollowUp({ onDone, checkDone }) {
  return (
    <div
      className={`project-join-follow-up ${
        checkDone ? 'project-join-check-is-done' : ''
      }`}
    >
      <div>
        <ProjectModalHeading title="Project has been queued for syncing" />
        <ProjectModalSubHeading title="In order to join this project, you and a peer must simultaneously open the app." />
      </div>
      <ProjectModalContent>
        <div className="project-join-follow-up-content-wrapper">
          If a peer is found, you are likely to be able to immediately begin to
          access the project, although a short sync period in the queue may be
          required before you can access it.
        </div>
      </ProjectModalContent>
      <ProjectModalButton text="I understand" onClick={onDone} />
    </div>
  )
}

export default function JoinProjectModal({
  showModal,
  onClose,
  doJoinProject,
  joinedProjectsSecrets,
}: {
  showModal: boolean
  onClose: () => void
  doJoinProject: (projectSecret: string) => Promise<CellIdString>
  joinedProjectsSecrets: string[]
}) {
  const reset = () => {
    setProjectSecret('')
    setPendingJoiningProject(false)
    setInvalidText('')
    setCheckDone(false)
  }

  const [checkDone, setCheckDone] = useState(false)
  const [projectSecret, setProjectSecret] = useState('')
  const [invalidText, setInvalidText] = useState('')
  const [pendingJoiningProject, setPendingJoiningProject] = useState(false)

  const onClickDone = async () => {
    setPendingJoiningProject(true)
    try {
      await doJoinProject(projectSecret)
      setCheckDone(true)
      setPendingJoiningProject(false)
    } catch (e) {
      console.log(e)
      // TODO: add better detail here
      setInvalidText('There was an error while joining project: ' + e.message)
    }
  }
  const onDone = () => {
    reset()
    onClose()
  }

  const onSecretChange = (userInputText: string) => {
    setInvalidText('')
    setPendingJoiningProject(false)
    setProjectSecret(userInputText)
    if (!userInputText) {
      setInvalidText('')
    } else if (joinedProjectsSecrets.includes(userInputText)) {
      setInvalidText("You've already joined this project!")
    } else if (
      userInputText.split(' ').length !== 5 ||
      !userInputText.split(' ').every((word) => word.length)
    ) {
      setInvalidText('Secret must be 5 words.')
    }
  }

  return (
    <Modal
      white
      active={showModal}
      onClose={onDone}
      className="join-project-modal-wrapper"
    >
      <ProjectJoinFollowUp onDone={onDone} checkDone={checkDone} />
      <JoinProjectForm
        checkDone={checkDone}
        projectSecret={projectSecret}
        onSecretChange={onSecretChange}
        invalidText={invalidText}
        pendingJoiningProject={pendingJoiningProject}
        onClickDone={onClickDone}
      />
    </Modal>
  )
}
