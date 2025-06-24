import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { Status, StatusCssColorClass } from './Status'
import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'
import useOnClickOutside from 'use-onclickoutside'
import { CSSTransition } from 'react-transition-group'
import { ProjectMapViewOnly } from '../ViewFilters/ViewFilters'
import Typography from '../Typography/Typography'
import hashCodeId from '../../api/clientSideIdHash'
import { isWeaveContext } from '@theweave/api'

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
  outcomeActionHash,
}) {
  return (
    <div className="search-result-item-wrapper">
      <div className="search-result-item-text-icon">
        {/* @ts-ignore */}
        <Icon name={name} size="small" className="light-grey not-hoverable" />
        <div
          className="search-result-item-text"
          title={text}
          onClick={() => panAndZoom(outcomeActionHash)}
        >
          {text}
        </div>
      </div>
      {/* @ts-ignore */}
      <div className="search-result-item-buttons">
        {/* <div onClick={() => panAndZoom(outcomeActionHash)}>

          <Icon name="enter.svg" size="small" className="light-grey" />
        </div> */}
        <div onClick={() => onExpandClick(outcomeActionHash)}>
          {/* @ts-ignore */}
          <Icon name="expand.svg" size="small" className="light-grey" />
        </div>
      </div>
    </div>
  )
}

function SearchResultsFilter({ name, filterActive, setFilter }) {
  return (
    <div
      className={`search-results-filter-wrapper ${name} ${
        filterActive ? 'filter-is-applied' : ''
      } `}
      onClick={() => setFilter(!filterActive)}
    >
      {name}
    </div>
  )
}

export default function HeaderRightPanel({
  myLocalProfile,
  onClickEditProfile,
  onClickPreferences,
  saveStatus,
  status,
  outcomeList,
  commentList,
  openExpandedView,
  animatePanAndZoom,
  unselectAll,
  projectId,
}) {
  const ref = useRef<HTMLDivElement>(null)
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

  // reset the search when the project
  // changes, including navigating away
  // to the dashboard
  useEffect(() => {
    setIsTextFilter(false)
    setIsDescriptionFilter(false)
    setIsCommentFilter(false)
    setIsSearchOpen(false)
    setFilterText('')
  }, [projectId])

  const noFilters = isTextFilter || isDescriptionFilter || isCommentFilter

  return (
    <div className="header-right-panel">
      <ProjectMapViewOnly>
        <div
          className={`search-button-wrapper ${
            isSearchOpen ? 'search-is-open' : ''
          }
        ${filterText !== '' ? 'results-dropdown-is-open' : ''}`}
        >
          <div className="search-icon-input">
            <div className="search-open-icon">
              {/* @ts-ignore */}
              <Icon
                name="search.svg"
                size="small"
                className="grey"
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
                  onFocus={() => {
                    unselectAll()
                  }}
                  type="text"
                  onChange={(e) => setFilterText(e.target.value.toLowerCase())}
                  value={filterText}
                  placeholder="Search for an Outcome, comment & more"
                  autoFocus
                />
              </CSSTransition>
            </div>
            {filterText !== '' && (
              <>
                {/* @ts-ignore */}
                <Icon
                  name="x.svg"
                  size="small"
                  className="light-grey"
                  onClick={() => {
                    setFilterText('')
                  }}
                />
              </>
            )}
          </div>
          {filterText !== '' && (
            <div className="search-results-dropdown">
              <div className="search-results-filters">
                <SearchResultsFilter
                  name="Statement"
                  filterActive={isTextFilter}
                  setFilter={setIsTextFilter}
                />
                <SearchResultsFilter
                  name="Description"
                  filterActive={isDescriptionFilter}
                  setFilter={setIsDescriptionFilter}
                />
                <SearchResultsFilter
                  name="Comment"
                  filterActive={isCommentFilter}
                  setFilter={setIsCommentFilter}
                />
              </div>
              <div className="search-results-list">
                {(!noFilters || isTextFilter) &&
                  outcomeList
                    .filter(
                      (outcome) =>
                        outcome.content.toLowerCase().includes(filterText) ||
                        hashCodeId(outcome.actionHash).includes(filterText)
                    )
                    .map((outcome) => (
                      <SearchResultItem
                        text={outcome.content}
                        name="title.svg"
                        onExpandClick={openExpandedView}
                        panAndZoom={animatePanAndZoom}
                        outcomeActionHash={outcome.actionHash}
                      />
                    ))}
                {(!noFilters || isDescriptionFilter) &&
                  outcomeList
                    .filter((outcome) =>
                      outcome.description.toLowerCase().includes(filterText)
                    )
                    .map((outcome) => (
                      <SearchResultItem
                        text={outcome.description}
                        name="text-align-left.svg"
                        onExpandClick={openExpandedView}
                        panAndZoom={animatePanAndZoom}
                        outcomeActionHash={outcome.actionHash}
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
                        outcomeActionHash={comment.outcomeActionHash}
                      />
                    ))}
              </div>
            </div>
          )}
        </div>
        {/* end search */}
      </ProjectMapViewOnly>

      <div className="header-right-panel-help-profile">
        {/* Help button */}
        <a
          className="help-button-external"
          href="https://docs.acorn.software/about-acorn/what-is-acorn"
          target="_blank"
        >
          <Typography style="h8">Help</Typography>
          {/* @ts-ignore */}
          <Icon
            name="external-link.svg"
            size="small"
            className="grey not-hoverable"
          />
        </a>

        <div
          className="avatar-and-status-wrapper"
          onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
        >
          <div
            className="avatar-container"
            onMouseEnter={onHoverAvatarEnter}
            onMouseLeave={onHoverAvatarLeave}
          >
            {/* @ts-ignore */}
            <Avatar
              firstName={myLocalProfile.firstName}
              lastName={myLocalProfile.lastName}
              avatarUrl={myLocalProfile.avatarUrl}
              imported={myLocalProfile.isImported}
              // highlighted={isAvatarMenuOpen || isAvatarHover}
              clickable
              size="small-medium"
              withStatus
              withWhiteBorder
              selfAssignedStatus={status}
            />
          </div>
        </div>
        {/* Profile Menu */}
        {isAvatarMenuOpen && (
          <div className="profile-wrapper" ref={ref}>
            {!isWeaveContext() && (
              <AvatarMenuItem
                className={isStatusOpen ? 'active' : ''}
                title="Change Status"
                onClick={() => setIsStatusOpen(true)}
              />
            )}
            {!isWeaveContext() && isStatusOpen && (
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
            {!isWeaveContext() && (
              <AvatarMenuItem
                title="Profile Settings"
                onClick={() => {
                  onClickEditProfile()
                  setIsAvatarMenuOpen(false)
                }}
              />
            )}

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
    </div>
  )
}
