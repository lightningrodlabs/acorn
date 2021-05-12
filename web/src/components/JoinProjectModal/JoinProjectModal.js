import React, { useState, useEffect } from 'react'
import './JoinProjectModal.css'

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
      pendingText="Validating..."
      actionText="Join"
    />
  )

  return (
    <div
      className={`join-project-form ${
        checkDone ? 'project-join-check-is-done' : ''
      }`}
    >
      <ProjectModalHeading title="Join an existing project" />
      <ProjectModalContent>
        <ProjectModalContentSpacer>
          <div>
            As you join, one of your peers will need to be reachable through the
            network by you, in order for you to synchronize with them. If no one
            is reachable right now, Acorn will sync this project with them at
            the first opportunity.
          </div>
          <ValidatingFormInput
            value={projectSecret}
            onChange={onSecretChange}
            invalidInput={invalidText}
            errorText={invalidText}
            label="Project invitation secret"
            helpText="Copy-paste in the 5 word secret phrase the project host has shared with you."
          />
        </ProjectModalContentSpacer>
      </ProjectModalContent>
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
      <ProjectModalHeading title={peerFound ? "Found a peer" : "Did not find a peer"} />
      <ProjectModalSubHeading title={peerFound ? "Say this" : "Say that"} />
      {/* <ProjectModalContentSpacer>
        <ProjectModalContent>
          <ProjectSecret passphrase={projectSecret} />
        </ProjectModalContent>
      </ProjectModalContentSpacer> */}
      <ProjectModalButton text="Done" onClick={onDone} />
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
  const [peerFound, setPeerFound] = useState(false)
  const [projectSecret, setProjectSecret] = useState('')
  const [invalidText, setInvalidText] = useState('')

  const [validatingSecret, setValidatingSecret] = useState(false)

  const onSecretChange = (val) => {
    setInvalidText('')
    setValidatingSecret(false)
    setProjectSecret(val)
    if (!val) {
      setInvalidText('')
    } else if (val.split(' ').length !== 5) {
      setInvalidText('secret must be 5 words')
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
