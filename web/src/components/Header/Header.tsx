import React, { useRef, useState } from 'react'
import useOnClickOutside from 'use-onclickoutside'

import { WireRecord } from '../../api/hdkCrud'
import {
  AgentPubKeyB64,
  ActionHashB64,
  WithActionHash,
  CellIdString,
} from '../../types/shared'
import { ProjectMeta, Profile, EntryPoint, Outcome } from '../../types'

import { Status } from './Status'
import HeaderLeftPanel from './HeaderLeftPanel'
import HeaderRightPanel from './HeaderRightPanel.connector'
import UpdateBar from '../UpdateBar/UpdateBar'
import { useRouteMatch } from 'react-router-dom'
import { ViewingReleaseNotes } from '../UpdateModal/UpdateModal'

import './Header.scss'
import { ModalState, OpenModal } from '../../context/ModalContexts'

export type HeaderProps = {
  // for update bar
  showUpdateBar: boolean
  setShowUpdateBar: React.Dispatch<React.SetStateAction<boolean>>
  hasMigratedSharedProject: boolean
  setViewingReleaseNotes: React.Dispatch<
    React.SetStateAction<ViewingReleaseNotes>
  >
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
  setShowProfileEditForm: React.Dispatch<React.SetStateAction<boolean>>
  setShowPreferences: React.Dispatch<React.SetStateAction<boolean>>
  goToOutcome: (outcomeActionHash: ActionHashB64) => void
  // holochain
  updateStatus: (statusString: Profile['status']) => Promise<void>
}

const Header: React.FC<HeaderProps> = ({
  // for update bar
  showUpdateBar,
  setShowUpdateBar,
  hasMigratedSharedProject,
  setViewingReleaseNotes,
  whoami,
  setModalState,
  setShowProfileEditForm,
  setShowPreferences,
  updateStatus,
  activeEntryPoints,
  project,
  goToOutcome,
  members,
  presentMembers,
}) => {
  const isDashboardMatch = useRouteMatch('/dashboard')
  const isPriorityMatch = useRouteMatch('/project/:project_id/priority')
  const isTableMatch = useRouteMatch('/project/:project_id/table')
  // const hasBackground = isPriorityMatch || isTableMatch

  const [isExportOpen, setIsExportOpen] = useState(false)

  const [status, setStatus] = useState<Status>(
    // @ts-ignore
    whoami ? whoami.entry.status : Status.Online
  )

  // click handlers
  const ref = useRef()
  useOnClickOutside(ref, () => {
    setIsExportOpen(false)
  })
  const onClickEditProfile = () => {
    setIsExportOpen(false)
    setShowProfileEditForm(true)
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
    setIsExportOpen(false)
    // call the prop function
    setShowPreferences(true)
  }

  return (
    <div className={`header-wrapper`} ref={ref}>
      {/* Update Bar */}
      <div className="header-update-bar-wrapper">
        <UpdateBar
          active={showUpdateBar}
          onClose={() => setShowUpdateBar(false)}
          buttonSecondaryText={'Changelog'}
          onClickSecondaryAction={() => {
            setViewingReleaseNotes(ViewingReleaseNotes.ReleaseNotes)
            setModalState({
              id: OpenModal.UpdateApp
            })
            setShowUpdateBar(false)
          }}
          buttonPrimaryText={'Update Now'}
          onClickPrimaryAction={() => {
            setViewingReleaseNotes(ViewingReleaseNotes.MainMessage)
            setModalState({
              id: OpenModal.UpdateApp
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
          isExportOpen={isExportOpen}
          setIsExportOpen={setIsExportOpen}
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
