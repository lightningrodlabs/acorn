import React, { useRef, useState } from 'react'
import { NavLink, Route, useHistory, useLocation } from 'react-router-dom'

import { GUIDE_IS_OPEN } from '../GuideBook/guideIsOpen'
import GuideBook from '../GuideBook/GuideBook'
import { Status, StatusCssColorClass, StatusIcons } from './Status'
import Modal from '../Modal/Modal'
import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'
import useOnClickOutside from 'use-onclickoutside'

function AvatarMenuItem({
  title,
  onClick,
  className,
}: {
  title: string
  onClick: () => void
  className?: string
}) {
  return (
    <button className={className} onClick={onClick}>
      <p>{title}</p>
    </button>
  )
}

function StatusMenuItem({ color, title, onClick }) {
  return (
    <button onClick={onClick}>
      {/* @ts-ignore */}
      <div className={`status-circle ${color}`} />
      <p>{title}</p>
    </button>
  )
}

function HeaderRightPanel({
  hideGuidebookHelpMessage,
  whoami,
  onClickEditProfile,
  onClickPreferences,
  saveStatus,
  status,
}) {
  const ref = useRef()
  useOnClickOutside(ref, () => {
    setIsAvatarMenuOpen(false)
    setIsStatusOpen(false)
  })
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const location = useLocation()
  const history = useHistory()
  // hover states
  const [isAvatarHover, setIsAvatarHover] = useState(false)
  // hover handlers
  const onHoverAvatarEnter = () => {
    setIsAvatarHover(true)
  }
  const onHoverAvatarLeave = () => {
    setIsAvatarHover(false)
  }

  // check the url for GUIDE_IS_OPEN
  // and affect the state
  const searchParams = new URLSearchParams(location.search)
  const isGuideOpen = !!searchParams.get(GUIDE_IS_OPEN)

  const onCloseGuidebook = () => {
    const pathWithoutGuidebook = location.pathname
    history.push(pathWithoutGuidebook)
  }

  return (
    <div className="header-right-panel">
      {/* <Icon name="search-line.svg" onClick={clickSearch}/> */}
      <Route path="/project">
        {/* open or close the guidebook, depending on if it */}
        {/* is currently open or closed */}
        {/* Guidebook Button */}
        <NavLink
          className="header-right-panel-icon"
          to={`${location.pathname}${
            isGuideOpen ? '' : '?' + GUIDE_IS_OPEN + '=1'
          }`}
          // if clicked on guidebook for the first time, remove the help message
          // and remember not to show that in the future (store that locally) aka persist
          onClick={hideGuidebookHelpMessage}
        >
          {/* @ts-ignore */}
          <Icon name="guidebook.svg" className="header-right-panel-icon" />
        </NavLink>
      </Route>
      <div className="avatar-and-status-wrapper">
        <div
          className="avatar-container"
          onMouseEnter={onHoverAvatarEnter}
          onMouseLeave={onHoverAvatarLeave}
        >
          {/* @ts-ignore */}
          <Avatar
            first_name={whoami.entry.first_name}
            last_name={whoami.entry.last_name}
            avatar_url={whoami.entry.avatar_url}
            imported={whoami.entry.is_imported}
            highlighted={isAvatarMenuOpen || isAvatarHover}
            clickable
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
          />
        </div>
        {/* Current status circle color under avatar*/}
        <div className="status-circle-wrapper">
          <div className={`status-circle ${StatusCssColorClass[status]}`}></div>
        </div>
      </div>
      {/* Guidebook */}
      <Route path="/project">
        <Modal
          className="guidebook-modal"
          white
          active={isGuideOpen}
          onClose={onCloseGuidebook}
        >
          <GuideBook />
        </Modal>
      </Route>
      {/* Profile Menu */}
      {isAvatarMenuOpen && (
        <div className="profile-wrapper" ref={ref}>
          <AvatarMenuItem
            className={isStatusOpen ? 'active' : ''}
            title="Change Status"
            onClick={() => setIsStatusOpen(true)}
          />
          {isStatusOpen && (
            <div className="user-status-wrapper">
              {Object.keys(Status).map((key) => (
                <StatusMenuItem
                  key={key}
                  color={StatusCssColorClass[key]}
                  title={key}
                  onClick={() => {
                    saveStatus(Status[key])
                    setIsAvatarMenuOpen(false)
                    setIsStatusOpen(false)
                  }}
                />
              ))}
            </div>
          )}
          <AvatarMenuItem
            title="Profile Settings"
            onClick={() => {
              onClickEditProfile()
              setIsAvatarMenuOpen(false)
            }}
          />
          <AvatarMenuItem
            title="Preferences"
            onClick={() => {
              onClickPreferences()
              setIsAvatarMenuOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default HeaderRightPanel
