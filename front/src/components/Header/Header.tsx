import React, { useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import useOnClickOutside from 'use-onclickoutside'
import './Header.css'
import UpdateBar from '../UpdateBar/UpdateBar'
import { Status } from './Status'
import HeaderLeftPanel from './HeaderLeftPanel'
import HeaderRightPanel from './HeaderRightPanel'
import HeaderMiddlePanel from './HeaderMiddlePanel'

function Header({
  whoami,
  setShowProfileEditForm,
  setShowPreferences,
  updateStatus,
  activeEntryPoints,
  showUpdateBar,
  setShowUpdateBar,
  setShowUpdatePromptModal,
  projectName,
  projectId,
  hideGuidebookHelpMessage,
}) {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  const [_status, setStatus] = useState<Status>(
    whoami ? whoami.entry.status : Status.Online
  )

  // click handlers
  const ref = useRef()
  useOnClickOutside(ref, () => {
    setIsExportOpen(false)
    setIsAvatarMenuOpen(false)
    setIsStatusOpen(false)
  })
  const onClickAvatar = () => {
    setIsAvatarMenuOpen(!isAvatarMenuOpen)
    setIsExportOpen(false)
    setIsStatusOpen(false)
  }
  const onClickStatus = () => {
    setIsStatusOpen(!isStatusOpen)
    setIsAvatarMenuOpen(false)
    setIsExportOpen(false)
  }
  const onClickExport = () => {
    setIsStatusOpen(false)
    setIsAvatarMenuOpen(false)
    setIsExportOpen(!isExportOpen)
  }
  const onClickEditProfile = () => {
    setIsStatusOpen(false)
    setIsAvatarMenuOpen(false)
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
    // close this menu
    setIsStatusOpen(false)
  }
  const onClickPreferences = () => {
    setIsStatusOpen(false)
    setIsAvatarMenuOpen(false)
    setIsExportOpen(false)
    // call the prop function
    setShowPreferences(true)
  }

  return (
    <div className="header-wrapper" ref={ref}>
      <UpdateBar
        active={showUpdateBar}
        onClose={() => setShowUpdateBar(false)}
        setShowUpdatePromptModal={setShowUpdatePromptModal}
      />
      <div className="header">
        <HeaderLeftPanel
          whoami={whoami}
          projectName={projectName}
          isExportOpen={isExportOpen}
          onClickExport={onClickExport}
          activeEntryPoints={activeEntryPoints}
        />
        <HeaderMiddlePanel projectId={projectId} />
        {whoami && (
          // add all these values as props
          <HeaderRightPanel
            {...{
              hideGuidebookHelpMessage,
              whoami,
              isAvatarMenuOpen,
              onClickAvatar,
              isStatusOpen,
              onClickStatus,
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
