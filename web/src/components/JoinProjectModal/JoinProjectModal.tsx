import React, { useState, useEffect } from 'react'
import './JoinProjectModal.scss'

import Icon from '../Icon/Icon'

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

function JoinProjectForm({
  checkDone,
  projectSecret,
  onSecretChange,
  invalidText,
  validatingSecret,
  onValidate,
}) {
  const validateButtonContent = (
    <ButtonWithPendingState
      pending={validatingSecret}
      pendingText="Searching..."
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
      <ProjectModalButton text={validateButtonContent} onClick={onValidate} />
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
  onJoinProject,
}) {
  const reset = () => {
    setProjectSecret('')
    setValidatingSecret(false)
    setInvalidText('')
    setCheckDone(false)
  }
  const onValidate = async () => {
    if (invalidText || projectSecret.length === 0) {
      setInvalidText('Secret must be 5 words.')
      return
    }
    setValidatingSecret(true)
    try {
      await onJoinProject(projectSecret)
      setCheckDone(true)
      setValidatingSecret(false)
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

  const [checkDone, setCheckDone] = useState(false)
  const [projectSecret, setProjectSecret] = useState('')
  const [invalidText, setInvalidText] = useState('')

  const [validatingSecret, setValidatingSecret] = useState(false)

  const onSecretChange = (val) => {
    setInvalidText('')
    setValidatingSecret(false)
    setProjectSecret(val)
    if (!val) {
      setInvalidText('')
    } else if (
      val.split(' ').length !== 5 ||
      !val.split(' ').every((word) => word.length)
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
        validatingSecret={validatingSecret}
        onValidate={onValidate}
      />
    </Modal>
  )
}
