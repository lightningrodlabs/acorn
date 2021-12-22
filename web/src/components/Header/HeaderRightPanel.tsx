import React, { useRef, useState } from 'react'
import { NavLink, Route, useHistory, useLocation } from 'react-router-dom'

import { GUIDE_IS_OPEN } from '../../searchParams'
import { Status, StatusCssColorClass, StatusIcons } from './Status'
import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'
import useOnClickOutside from 'use-onclickoutside'
import { CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import { openExpandedView } from '../../expanded-view/actions'
import { animatePanAndZoom } from '../../viewport/actions'
import { ProjectMapViewOnly } from '../ViewFilters/ViewFilters'

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

function SearchResultItem({
  text,
  name,
  onExpandClick,
  panAndZoom,
  goalAddress,
}) {
  return (
    <div className="search-result-item-wrapper">
      <div className="search-result-item-text-icon">
        <Icon
          name={name}
          size="small"
          className="light-grey not-hoverable"
        />
        <div className="search-result-item-text">{text}</div>
      </div>
      <div className="search-result-item-buttons">
        <div onClick={() => panAndZoom(goalAddress)}>
          <Icon name="enter.svg" size="small" className="light-grey" />
        </div>
        <div onClick={() => onExpandClick(goalAddress)}>
          <Icon name="expand.svg" size="small" className="light-grey" />
        </div>
      </div>
    </div>
  )
}

function SearchResultsFilter({ name, setFilter }) {
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  return (
    <div
      className={`search-results-filter-wrapper ${name} ${
        isFilterApplied ? 'filter-is-applied' : ''
      } `}
      onClick={() => {
        setIsFilterApplied(!isFilterApplied)
        setFilter(!isFilterApplied)
      }}
    >
      {name}
    </div>
  )
}

function HeaderRightPanel({
  hideGuidebookHelpMessage,
  whoami,
  onClickEditProfile,
  onClickPreferences,
  saveStatus,
  status,
  goalList,
  commentList,
  openExpandedView,
  animatePanAndZoom,
}) {
  const ref = useRef()
  useOnClickOutside(ref, () => {
    setIsAvatarMenuOpen(false)
    setIsStatusOpen(false)
  })
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [isTextFilter, setIsTextFilter] = useState(false)
  const [isDescriptionFilter, setIsDescriptionFilter] = useState(false)
  const [isCommentFilter, setIsCommentFilter] = useState(false)
  const location = useLocation()
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

  const searchResults = []

  const noFilters = isTextFilter || isDescriptionFilter || isCommentFilter

  return (
    <>
    <ProjectMapViewOnly>
      <div
        className={`search-button-wrapper ${
          isSearchOpen ? 'search-is-open' : ''
        } 
        ${filterText !== '' ? 'results-dropdown-is-open' : ''}`}
      >
        <div className="search-icon-input">
          <div className="search-open-icon">
            <Icon
              name="search.svg"
              size="small"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen)
                setFilterText('')
              }}
            />
          </div>
          <div>
            <CSSTransition
              in={isSearchOpen}
              timeout={100}
              unmountOnExit
              classNames="search-input-wrapper"
            >
              <input
                type="text"
                onChange={(e) => setFilterText(e.target.value.toLowerCase())}
                value={filterText}
                placeholder="Search for a goal, comment, and more"
                autoFocus
              />
            </CSSTransition>
          </div>
          {filterText !== '' && (
            <Icon
              name="x.svg"
              size="small"
              className="light-grey"
              onClick={() => {
                setFilterText('')
              }}
            />
          )}
        </div>
        {/* <CSSTransition
          in={filterText !== ''}
          timeout={200}
          unmountOnExit
          className="search-results-dropdown-wrapper"
        > */}
        {filterText !== '' && (
          <div className="search-results-dropdown">
            <div className="search-results-filters">
              <SearchResultsFilter name="Titles" setFilter={setIsTextFilter} />
              <SearchResultsFilter
                name="Descriptions"
                setFilter={setIsDescriptionFilter}
              />
              <SearchResultsFilter
                name="Comments"
                setFilter={setIsCommentFilter}
              />
            </div>
            <div className="search-results-list">
              {(!noFilters || isTextFilter) &&
                goalList
                  .filter((goal) =>
                    goal.content.toLowerCase().includes(filterText)
                  )
                  .map((goal) => (
                    <SearchResultItem
                      text={goal.content}
                      name="title.svg"
                      onExpandClick={openExpandedView}
                      panAndZoom={animatePanAndZoom}
                      goalAddress={goal.headerHash}
                    />
                  ))}
              {(!noFilters || isDescriptionFilter) &&
                goalList
                  .filter((goal) =>
                    goal.description.toLowerCase().includes(filterText)
                  )
                  .map((goal) => (
                    <SearchResultItem
                      text={goal.description}
                      name="text-align-left.svg"
                      onExpandClick={openExpandedView}
                      panAndZoom={animatePanAndZoom}
                      goalAddress={goal.headerHash}
                    />
                  ))}
              {(!noFilters || isCommentFilter) &&
                commentList
                  .filter((comment) =>
                    comment.content.toLowerCase().includes(filterText)
                  )
                  .map((comment) => (
                    <SearchResultItem
                      text={comment.content}
                      name="comment.svg"
                      onExpandClick={openExpandedView}
                      panAndZoom={animatePanAndZoom}
                      goalAddress={comment.goal_address}
                    />
                  ))}
            </div>
          </div>
        )}
        {/* </CSSTransition> */}
      </div> 
      {/* end search */}
      </ProjectMapViewOnly>

      <div className="header-right-panel">
        {/* open or close the guidebook, depending on if it */}
        {/* is currently open or closed */}
        {/* Guidebook Button */}
        {/* @ts-ignore */}
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
          <Icon
            name="booklet.svg"
            className="header-right-panel-icon"
            withTooltip
            tooltipText="Guidebook"
            size="small"
          />
        </NavLink>
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
              medium
            />
          </div>
          {/* Current status circle color under avatar*/}
          <div className="status-circle-wrapper">
            <div
              className={`status-circle ${StatusCssColorClass[status]}`}
            ></div>
          </div>
        </div>
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
    </>
  )
}
function mapStateToProps(state) {
  const projectId = state.ui.activeProject
  const goals = state.projects.goals[projectId] || {}
  const goalComments = state.projects.goalComments[projectId] || {}
  const goalList = Object.values(goals)
  const commentList = Object.values(goalComments)
  return {
    goalList,
    commentList,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    animatePanAndZoom: (address) => {
      return dispatch(animatePanAndZoom(address))
    },
    openExpandedView: (address) => dispatch(openExpandedView(address)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(HeaderRightPanel)
