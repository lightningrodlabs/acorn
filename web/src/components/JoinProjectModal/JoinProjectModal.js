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

function ProjectJoinFollowUp({ onDone, peerFound, checkDone }) {
  return (
    <div
      className={`project-join-follow-up ${
        checkDone ? 'project-join-check-is-done' : ''
      }`}
    >
      <div>
      <ProjectModalHeading
        title={
          peerFound
            ? 'Project joined successfully'
            : 'Project has been queued for syncing'
        }
      />
      {!peerFound && (
        <ProjectModalSubHeading title="In order to join this project, you and a peer must simultaneously open the app." />
      )}
      </div>
        <ProjectModalContent>
          <div className="project-join-follow-up-content-wrapper">
            {peerFound
              ? 'Peers in this project were found so now you will get synced with them.'
              : `If a peer is found, you are likely to be able to immediately begin to access the project, although a short sync period in the queue may be required before you can access it.`}
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
    setPeerFound(false)
    setCheckDone(false)
  }
  const onValidate = async () => {
    if (invalidText || projectSecret.length === 0) {
      setInvalidText('Secret must be 5 words.')
      return
    }
    setValidatingSecret(true)
    try {
      const peerWasFound = await onJoinProject(projectSecret)
      setPeerFound(peerWasFound)
      setCheckDone(true)
      setValidatingSecret(false)
    } catch (e) {
      console.log(e)
      setInvalidText('There was an error while joining project: ' + e.message)
    }
  }
  const onDone = () => {
    reset()
    onClose()
  }

  const [checkDone, setCheckDone] = useState(false)
  const [peerFound, setPeerFound] = useState(true)
  const [projectSecret, setProjectSecret] = useState('')
  const [invalidText, setInvalidText] = useState('')

  const [validatingSecret, setValidatingSecret] = useState(false)

  const onSecretChange = (val) => {
    setInvalidText('')
    setValidatingSecret(false)
    setProjectSecret(val)
    if (!val) {
      setInvalidText('')
    } else if (val.split(' ').length !== 5 || !val.split(' ').every(word => word.length)) {
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
      <ProjectJoinFollowUp
        onDone={onDone}
        checkDone={checkDone}
        peerFound={peerFound}
      />
      <JoinProjectForm
        checkDone={checkDone}
        peerFound={peerFound}
        projectSecret={projectSecret}
        onSecretChange={onSecretChange}
        invalidText={invalidText}
        validatingSecret={validatingSecret}
        onValidate={onValidate}
      />
    </Modal>
  )
}
