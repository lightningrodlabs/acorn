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

export default function JoinProjectModal({
  showModal,
  onClose,
  onJoinProject,
}) {
  const reset = () => {
    setProjectSecret('')
    setValidatingSecret(false)
    setInvalidText('')
  }
  const onValidate = async () => {
    setValidatingSecret(true)
    try {
      const projectExists = await onJoinProject(projectSecret)
      if (!projectExists) {
        setInvalidText('project does not exist or peers could not be found')
      } else {
        // it worked! reset and close
        onDone()
      }
      setValidatingSecret(false)
    } catch (e) {
      setInvalidText('There was an error while joining project: ' + e.message)
    }
  }
  const onDone = () => {
    reset()
    onClose()
  }

  const [projectSecret, setProjectSecret] = useState('')
  const [invalidText, setInvalidText] = useState('')

  const [validatingSecret, setValidatingSecret] = useState(false)

  const validateButtonContent = <ButtonWithPendingState pending={validatingSecret} pendingText="Validating..." actionText="Join" />

  const onSecretChange = val => {
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
      className='join-project-modal-wrapper'>
      <ProjectModalHeading title='Join an existing project' />
      <ProjectModalContent>
        <ProjectModalContentSpacer>
          <ValidatingFormInput
            value={projectSecret}
            onChange={onSecretChange}
            invalidInput={invalidText}
            errorText={invalidText}
            label='Project invitation secret'
            helpText='Paste in the secret phrase the project host has shared with you.'
          />
        </ProjectModalContentSpacer>
      </ProjectModalContent>
      <ProjectModalButton text={validateButtonContent} onClick={onValidate} />
    </Modal>
  )
}
