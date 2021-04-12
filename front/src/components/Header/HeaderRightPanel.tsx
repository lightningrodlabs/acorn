import React, { useState } from 'react'
import { NavLink, Route, useHistory, useLocation } from 'react-router-dom'

import { GUIDE_IS_OPEN } from '../GuideBook/guideIsOpen'
import GuideBook from '../GuideBook/GuideBook'
import { Status, StatusCssColorClass, StatusIcons } from './Status'
import Modal from '../Modal/Modal'
import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'

function AvatarMenuItem({ title, onClick }) {
  return (
    <button onClick={onClick}>
      <p>{title}</p>
    </button>
  )
}

function StatusMenuItem({ color, title, img, onClick }) {
  return (
    <button className={color + ' btn'} onClick={onClick}>
      {/* @ts-ignore */}
      <Icon name={img} className="user-status white not-hoverable" />
      <p>{title}</p>
    </button>
  )
}

function HeaderRightPanel({
  hideGuidebookHelpMessage,
  whoami,
  isAvatarMenuOpen,
  onClickAvatar,
  isStatusOpen,
  onClickStatus,
  onClickEditProfile,
  onClickPreferences,
  saveStatus,
}) {
  const location = useLocation()
  const history = useHistory()
  // hover states
  const [isStatusHover, setIsStatusHover] = useState(false)
  const [isAvatarHover, setIsAvatarHover] = useState(false)
  // hover handlers
  const onHoverStatusEnter = () => {
    setIsStatusHover(true)
  }
  const onHoverStatusLeave = () => {
    setIsStatusHover(false)
  }
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
      <div
        className={`avatar-and-status-wrapper ${StatusCssColorClass[status]}`}
      >
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
            highlighted={isAvatarMenuOpen || isAvatarHover}
            clickable
            onClick={onClickAvatar}
          />
        </div>

        <span
          className={`user-status-icon-wrapper ${
            isStatusOpen || isStatusHover ? 'user-status-is-active' : ''
          }`}
          onMouseEnter={onHoverStatusEnter}
          onMouseLeave={onHoverStatusLeave}
        >
          {!isStatusOpen && !isStatusHover && (
            <>
              {/* @ts-ignore */}
              <Icon
                name={StatusIcons[status]}
                onClick={onClickStatus}
                className="user-status white"
              />
            </>
          )}
          {(isStatusOpen || isStatusHover) && (
            <>
              {/* @ts-ignore */}
              <Icon
                name="user-status-hover.svg"
                onClick={onClickStatus}
                className="user-status white not-hoverable"
              />
            </>
          )}
        </span>
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
      {isAvatarMenuOpen && (
        <div className="profile-wrapper">
          <AvatarMenuItem
            title="Profile Settings"
            onClick={onClickEditProfile}
          />
          <AvatarMenuItem title="Preferences" onClick={onClickPreferences} />
        </div>
      )}
      {isStatusOpen && (
        <div className="user-status-wrapper">
          {Object.keys(Status).map((key) => (
            <StatusMenuItem
              key={key}
              img={StatusIcons[key]}
              color={StatusCssColorClass[key]}
              title={key}
              onClick={() => saveStatus(Status[key])}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HeaderRightPanel
