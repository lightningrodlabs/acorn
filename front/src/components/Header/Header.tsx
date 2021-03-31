import React, { useRef, useState } from 'react'
import {
  Switch,
  Route,
  NavLink,
  useLocation,
  withRouter,
} from 'react-router-dom'
import useOnClickOutside from 'use-onclickoutside'
import GuideBook from '../GuideBook/GuideBook'
import { GUIDE_IS_OPEN } from '../GuideBook/guideIsOpen'
import './Header.css'
import Avatar from '../Avatar/Avatar'
import Icon from '../Icon/Icon'
import ExportMenuItem from '../ExportMenuItem/ExportMenuItem'
import Modal from '../Modal/Modal'
import UpdateBar from '../UpdateBar/UpdateBar'

enum Status {
  Online = 'Online',
  Away = 'Away',
  Offline = 'Offline',
}

const StatusIcons = {
  [Status.Online]: 'checkmark-circle.svg',
  [Status.Away]: 'user-status-away.svg',
  [Status.Offline]: 'user-status-offline.svg',
}

const StatusCssColorClass = {
  [Status.Online]: 'status-online',
  [Status.Away]: 'status-away',
  [Status.Offline]: 'status-offline',
}

function Header({
  whoami,
  setShowProfileEditForm,
  setShowPreferences,
  updateStatus,
  location,
  history,
  activeEntryPoints,
  showUpdateBar,
  setShowUpdateBar,
  setShowUpdatePromptModal,
  projectName,
  hideGuidebookHelpMessage,
}) {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  // hover states
  const [isStatusHover, setIsStatusHover] = useState(false)
  const [isAvatarHover, setIsAvatarHover] = useState(false)

  const [status, setStatus] = useState<Status>(
    whoami ? whoami.entry.status : Status.Online
  )

  const activeEntryPointAddresses = activeEntryPoints.map(
    (entryPoint) => entryPoint.address
  )

  // check the url for GUIDE_IS_OPEN
  // and affect the state
  const searchParams = new URLSearchParams(location.search)
  const isGuideOpen = !!searchParams.get(GUIDE_IS_OPEN)

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
  const onCloseGuidebook = () => {
    const pathWithoutGuidebook = location.pathname
    history.push(pathWithoutGuidebook)
  }

  return (
    <div className="header-wrapper" ref={ref}>
      <UpdateBar
        active={showUpdateBar}
        onClose={() => setShowUpdateBar(false)}
        setShowUpdatePromptModal={setShowUpdatePromptModal}
      />
      <div className="header">
        {/* Top Left Panel */}
        <div className="top-left-panel">
          {/* @ts-ignore */}
          <NavLink to="/" className="home-link logo">
            {/* @ts-ignore */}
            <Icon name="acorn-logo-stroked.svg" className="not-hoverable" />
            <p className="logo-name">acorn</p>
          </NavLink>
          {whoami && (
            <Route path="/project">
              <div className="current-project-wrapper">
                <div className="current-project-content">
                  <Switch>
                    <Route
                      path="/project/:projectId/map"
                      render={() => (
                        <>
                          {/* @ts-ignore */}
                          <Icon
                            name="map.svg"
                            className="view-mode grey not-hoverable"
                          />
                        </>
                      )}
                    />
                    <Route
                      path="/project/:projectId/priority"
                      render={() => (
                        <>
                          {/* @ts-ignore */}
                          <Icon
                            name="priority.svg"
                            className="view-mode grey not-hoverable"
                          />
                        </>
                      )}
                    />
                  </Switch>
                  <div className="current-project-name">{projectName}</div>
                  <div className="divider-line"></div>
                  <div className="export-wrapper">
                    {/* @ts-ignore */}
                    <Icon
                      withTooltip
                      tooltipText="export"
                      name="export.svg"
                      size="header"
                      className={isExportOpen ? 'purple' : ''}
                      onClick={onClickExport}
                    />
                    {isExportOpen && (
                      <ul className="export-list-wrapper">
                        <li>
                          <ExportMenuItem
                            type="json"
                            title="Export as JSON (Importable)"
                            download="acorn-project.json"
                          />
                        </li>
                        <li>
                          <ExportMenuItem
                            type="csv"
                            title="Export as CSV"
                            download="acorn-project.csv"
                          />
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              {/* Current Entry Points Tab */}
              {activeEntryPoints.map((entryPoint) => (
                <ActiveEntryPoint
                  key={entryPoint.address}
                  entryPoint={entryPoint}
                  activeEntryPointAddresses={activeEntryPointAddresses}
                />
              ))}
            </Route>
          )}
        </div>
        {/* Top Right Panel */}
        {whoami && (
          <div className="top-right-panel">
            {/* <Icon name="search-line.svg" onClick={clickSearch}/> */}
            <Route path="/project">
              {/* open or close the guidebook, depending on if it */}
              {/* is currently open or closed */}
              {/* Guidebook Button */}
              {/* @ts-ignore */}
              <NavLink
                className="top-right-panel-icon"
                to={`${location.pathname}${
                  isGuideOpen ? '' : '?' + GUIDE_IS_OPEN + '=1'
                }`}
                // if clicked on guidebook for the first time, remove the help message
                // and remember not to show that in the future (store that locally) aka persist
                onClick={hideGuidebookHelpMessage}
              >
                {/* @ts-ignore */}
                <Icon name="guidebook.svg" className="top-right-panel-icon" />
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
                <AvatarMenuItem
                  title="Preferences"
                  onClick={onClickPreferences}
                />
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
        )}
      </div>
    </div>
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

function AvatarMenuItem({ title, onClick }) {
  return (
    <button onClick={onClick}>
      <p>{title}</p>
    </button>
  )
}

function ActiveEntryPoint({ entryPoint, activeEntryPointAddresses }) {
  const location = useLocation()
  const entryPointsAbsentThisOne = activeEntryPointAddresses
    .filter((address) => address !== entryPoint.address)
    .join(',')
  return (
    <div className="active-entry-point">
      <img src="img/door-open.png" />
      {/* add title because text-overflow: ellipsis */}
      <div className="active-entry-point-content" title={entryPoint.content}>
        {entryPoint.content}
      </div>
      {/* @ts-ignore */}
      <NavLink
        to={`${location.pathname}?entryPoints=${entryPointsAbsentThisOne}`}
        className="active-entry-point-close"
      >
        {/* @ts-ignore */}
        <Icon name="x.svg" size="very-small-close" className="grey" />
      </NavLink>
    </div>
  )
}

export default withRouter(Header)
