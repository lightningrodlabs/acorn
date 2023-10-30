import React, { useContext, useState } from 'react'
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
import ToastContext, { ShowToast } from '../../context/ToastContext'

function JoinProjectForm({
  projectSecret,
  onSecretChange,
  invalidText,
  pendingJoiningProject,
  onClickJoinProject,
}) {
  const joinProjectButtonContent = (
    <ButtonWithPendingState
      pending={pendingJoiningProject}
      pendingText="joining..."
      actionText="Join Project"
    />
  )

  return (
    <div className="join-project-form">
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
            helpText="Paste the 5-word secret you received from the project host"
          />
        </ProjectModalContent>
      </ProjectModalContentSpacer>
      <ProjectModalButton
        text={joinProjectButtonContent}
        onClick={onClickJoinProject}
        // show the button as disabled if there is a text about invalid secret input
        // or if there is no input
        disabled={invalidText !== '' || projectSecret === ''}
      />
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
  // pull in the toast context
  const { setToastState } = useContext(ToastContext)

  const [checkDone, setCheckDone] = useState(false)
  const [projectSecret, setProjectSecret] = useState('')
  const [invalidText, setInvalidText] = useState('')
  const [pendingJoiningProject, setPendingJoiningProject] = useState(false)

  const resetJoinProjectState = () => {
    onClose()
    // wait for the closing of the modal animation
    setTimeout(() => {
      setProjectSecret('')
      setPendingJoiningProject(false)
      setInvalidText('')
      setCheckDone(false)
    }, 100)
  }

  const onClickJoinProject = async () => {
    setPendingJoiningProject(true)
    try {
      await doJoinProject(projectSecret)
      setCheckDone(true)
      setPendingJoiningProject(false)
      resetJoinProjectState()
      // if project joining is successful
      setToastState({
        id: ShowToast.Yes,
        text: 'Project has been queued for syncing',
        type: 'confirmation',
      })
    } catch (e) {
      // if project joining is not successful
      console.log(e)
      resetJoinProjectState()
      setToastState({
        id: ShowToast.Yes,
        text: 'Error joining the project',
        type: 'destructive',
      })
      // TODO: add better detail here
      // setInvalidText('There was an error while joining project: ' + e.message)
    }
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
      onClose={onClose}
      className="join-project-modal"
    >
      <JoinProjectForm
        projectSecret={projectSecret}
        onSecretChange={onSecretChange}
        invalidText={invalidText}
        pendingJoiningProject={pendingJoiningProject}
        onClickJoinProject={onClickJoinProject}
      />
    </Modal>
  )
}
