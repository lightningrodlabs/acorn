import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'

import './EntryPointPicker.scss'

import DoorClosed from '../../images/door-closed.svg'

import PickerTemplate from '../PickerTemplate/PickerTemplate'
import Icon from '../Icon/Icon'
import { NavLink } from 'react-router-dom'
import { ENTRY_POINTS } from '../../searchParams'
import Checkbox from '../Checkbox/Checkbox'

function EntryPointPickerItem({
  entryPoint,
  outcome,
  isActive,
  activeEntryPoints,
  goToOutcome,
}) {
  const dotStyle = {
    backgroundColor: entryPoint.color,
  }
  const location = useLocation()

  const pathWithEntryPoint = `${
    location.pathname
  }?${ENTRY_POINTS}=${activeEntryPoints
    .concat([entryPoint.actionHash])
    .join(',')}`

  const pathWithoutEntryPoint = `${
    location.pathname
  }?${ENTRY_POINTS}=${activeEntryPoints
    .filter((actionHash) => actionHash !== entryPoint.actionHash)
    .join(',')}`

  const onClickArrow = (event) => {
    // prevent the navigation (NavLink)
    // event that would be triggered
    event.preventDefault()
    goToOutcome(entryPoint.outcomeActionHash)
  }
  return (
    <li>
      <NavLink
        isActive={() => isActive}
        to={isActive ? pathWithoutEntryPoint : pathWithEntryPoint}
        className="entry-point-picker-item"
      >
        <div className="entry-point-picker-dot" style={dotStyle}></div>
        <div className="entry-point-picker-name" title={outcome.content}>
          {outcome.content}
        </div>
        <div onClick={onClickArrow} className="entry-point-picker-switch">
          <Icon name="enter.svg" size="small" className="grey" />
        </div>
        <Checkbox isChecked={isActive} size="small" />
      </NavLink>
    </li>
  )
}

export default function EntryPointPicker({
  entryPointsAndOutcomes,
  isOpen,
  onClose,
  activeEntryPoints,
  goToOutcome,
}) {
  const [filterText, setFilterText] = useState('')

  // filter people out if there's filter text defined, and don't bother case matching
  const filteredEntryPoints = entryPointsAndOutcomes.filter(({ outcome }) => {
    return (
      !filterText ||
      outcome.content.toLowerCase().indexOf(filterText.toLowerCase()) > -1
    )
  })

  const goToOutcomeWrapped = (outcomeActionHash) => {
    onClose()
    goToOutcome(outcomeActionHash)
  }

  return (
    <CSSTransition
      in={isOpen}
      timeout={100}
      unmountOnExit
      classNames="entry-point-picker-wrapper"
    >
      <PickerTemplate
        className="entry-point-picker"
        heading="Entry Points"
        onClose={onClose}
      >
        {/* Entry Point Picker Search */}
        <div className="entry-point-picker-search">
          <Icon name="search.svg" size="small" className="grey not-hoverable" />
          <input
            type="text"
            onChange={(e) => setFilterText(e.target.value)}
            value={filterText}
            placeholder="Search entry points"
            autoFocus
          />
          {filterText !== '' && (
            <button
              onClick={() => {
                setFilterText('')
              }}
              className="clear-button"
            >
              <Icon
                name="x.svg"
                size="small"
                className="light-grey not-hoverable"
                withTooltip
                tooltipText="Clear"
              />
            </button>
          )}
        </div>
        <ul className="entry-point-picker-list">
          {filteredEntryPoints.map(({ entryPoint, outcome }) => (
            <EntryPointPickerItem
              key={entryPoint.actionHash}
              entryPoint={entryPoint}
              outcome={outcome}
              isActive={activeEntryPoints.some(
                (actionHash) => actionHash === entryPoint.actionHash
              )}
              activeEntryPoints={activeEntryPoints}
              goToOutcome={goToOutcomeWrapped}
            />
          ))}
          {/* Entry Points Empty State */}
          {entryPointsAndOutcomes.length === 0 && (
            <li className="entry-points-empty-state-content">
              <img
                src={DoorClosed}
                className="entry-points-empty-state-image"
              />
              <div className="entry-points-empty-state-image-circle"></div>
              <span>
                You currently have no entry points for this project.{' '}
                <a
                  href="https://sprillow.gitbook.io/acorn-knowledge-base/outcomes/entry-point-outcomes"
                  target="_blank"
                  onClick={onClose}
                  className="entry-points-empty-state-content-link"
                >
                  Learn how to create one
                </a>
                .
              </span>
            </li>
          )}
        </ul>
      </PickerTemplate>
    </CSSTransition>
  )
}
