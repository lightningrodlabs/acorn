import React, { useRef, useState } from 'react'
import useOnClickOutside from 'use-onclickoutside'
import './Header.css'
import { Status } from './Status'
import HeaderLeftPanel from './HeaderLeftPanel'
import HeaderRightPanel from './HeaderRightPanel'
import HeaderMiddlePanel from './HeaderMiddlePanel'

function Header({
  whoami,
  setShowProjectSettingsOpen,
  setShowProfileEditForm,
  setShowPreferences,
  updateStatus,
  activeEntryPoints,
  project,
  projectId,
  hideGuidebookHelpMessage,
  goToGoal,
  members,
  presentMembers,
}) {
  const [isExportOpen, setIsExportOpen] = useState(false)

  const [status, setStatus] = useState<Status>(
    whoami ? whoami.entry.status : Status.Online
  )

  // click handlers
  const ref = useRef()
  useOnClickOutside(ref, () => {
    setIsExportOpen(false)
  })
  const onClickExport = () => {
    setIsExportOpen(!isExportOpen)
  }
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
    <div className="header-wrapper" ref={ref}>
      {/* <UpdateBar
        active={showUpdateBar}
        onClose={() => setShowUpdateBar(false)}
        setShowUpdatePromptModal={setShowUpdatePromptModal}
      /> */}
      <div className="header">
        <HeaderLeftPanel
          members={members}
          presentMembers={presentMembers}
          whoami={whoami}
          setShowProjectSettingsOpen={setShowProjectSettingsOpen}
          projectName={project.name}
          isExportOpen={isExportOpen}
          onClickExport={onClickExport}
          activeEntryPoints={activeEntryPoints}
          goToGoal={goToGoal}
        />
        <HeaderMiddlePanel
          projectId={projectId}
          projectPriorityMode={project.priority_mode}
        />
        {whoami && (
          // add all these values as props
          <HeaderRightPanel
            {...{
              status,
              hideGuidebookHelpMessage,
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
