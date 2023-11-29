import React, { useRef, useState } from 'react'
import useOnClickOutside from 'use-onclickoutside'

import { WireRecord } from '../../api/hdkCrud'
import {
  AgentPubKeyB64,
  ActionHashB64,
  WithActionHash,
} from '../../types/shared'
import { ProjectMeta, Profile, EntryPoint, Outcome } from '../../types'

import { Status } from './Status'
import HeaderLeftPanel from './HeaderLeftPanel'
import HeaderRightPanel from './HeaderRightPanel.connector'
import UpdateBar from '../UpdateBar/UpdateBar'
import { ViewingReleaseNotes } from '../UpdateModal/UpdateModal'
import { ModalState, OpenModal } from '../../context/ModalContexts'

import './Header.scss'

export type HeaderProps = {
  // for update bar
  showUpdateBar: boolean
  setShowUpdateBar: React.Dispatch<React.SetStateAction<boolean>>
  hasMigratedSharedProject: boolean
  // other
  whoami: WireRecord<Profile>
  activeEntryPoints: {
    entryPoint: WithActionHash<EntryPoint>
    outcome: WithActionHash<Outcome>
  }[]
  project: WithActionHash<ProjectMeta>
  members: Profile[]
  presentMembers: AgentPubKeyB64[]
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
  unselectAll: () => void
  // holochain
  updateStatus: (statusString: Profile['status']) => Promise<void>
}

const Header: React.FC<HeaderProps> = ({
  showUpdateBar,
  hasMigratedSharedProject,
  whoami,
  activeEntryPoints,
  project,
  members,
  presentMembers,
  unselectAll,
  setShowUpdateBar,
  setModalState,
  updateStatus,
  goToOutcome,
}) => {
  const [status, setStatus] = useState<Status>(
    // @ts-ignore
    whoami ? whoami.entry.status : Status.Online
  )

  // click handlers
  const onClickEditProfile = () => {
    setModalState({
      id: OpenModal.ProfileEditForm
    })
  }

  const changeStatus = (status: Status) => {
    setStatus(status)
  }
  const saveStatus = (status: Status) => {
    // persist
    updateStatus(status)
    // change local to the component
    changeStatus(status)
  }
  const onClickPreferences = () => {
    setModalState({
      id: OpenModal.Preferences
    })
  }

  return (
    <div className={`header-wrapper`} onClick={() => unselectAll()}>
      {/* Update Bar */}
      <div className="header-update-bar-wrapper">
        <UpdateBar
          active={showUpdateBar}
          onClose={() => setShowUpdateBar(false)}
          buttonSecondaryText={'Changelog'}
          onClickSecondaryAction={() => {
            setModalState({
              id: OpenModal.UpdateApp,
              section: ViewingReleaseNotes.ReleaseNotes
            })
            setShowUpdateBar(false)
          }}
          buttonPrimaryText={'Update Now'}
          onClickPrimaryAction={() => {
            setModalState({
              id: OpenModal.UpdateApp,
              section: ViewingReleaseNotes.MainMessage
            })
            setShowUpdateBar(false)
          }}
          // party popper emoji
          text={<>&#x1F389; A new update for Acorn is available.</>}
          migratedSharedProjectText={
            hasMigratedSharedProject
              ? ' Update is required to access a shared project brought to the updated version by another team member.'
              : ''
          }
        />
      </div>

      <div className="header">
        {/* Header Left Panel */}
        <HeaderLeftPanel
          members={members}
          presentMembers={presentMembers}
          whoami={whoami}
          projectPassphrase={project ? project.passphrase : ''}
          setModalState={setModalState}
          projectName={project ? project.name : ''}
          activeEntryPoints={activeEntryPoints}
          goToOutcome={goToOutcome}
        />
        {whoami && (
          // add all these values as props
          //  Header Left Panel
          <HeaderRightPanel
            {...{
              status,
              whoami,
              onClickEditProfile,
              onClickPreferences,
              saveStatus,
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Header
