import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'

import './EntryPointPicker.css'

import PickerTemplate from '../PickerTemplate/PickerTemplate'
import Icon from '../Icon/Icon'
import selectEntryPoints from '../../projects/entry-points/select'
import { NavLink } from 'react-router-dom'
import { GUIDE_IS_OPEN } from '../GuideBook/guideIsOpen'

function EntryPointPickerItem({ entryPoint, isActive, activeEntryPoints }) {
  const dotStyle = {
    backgroundColor: entryPoint.color,
  }
  const location = useLocation()

  const pathWithEntryPoint = `${location.pathname
    }?entryPoints=${activeEntryPoints.concat([entryPoint.address]).join(',')}`

  const pathWithoutEntryPoint = `${location.pathname
    }?entryPoints=${activeEntryPoints
      .filter(address => address !== entryPoint.address)
      .join(',')}`

  return (
    <li>
      <NavLink
        isActive={() => isActive}
        to={isActive ? pathWithoutEntryPoint : pathWithEntryPoint}
        className='entry-point-picker-item'>
        <div className='entry-point-picker-dot' style={dotStyle}></div>
        <div className='entry-point-picker-name'>{entryPoint.content}</div>
        <NavLink
          to={`${location.pathname}?entryPoints=${entryPoint.address}`}
          className='entry-point-picker-switch'>
          <Icon name='enter.svg' size='small' className='grey' />
        </NavLink>
        <div className='entry-point-picker-radio'>
          <Icon
            name={isActive ? 'radio-button-checked.svg' : 'radio-button.svg'}
            size='small'
            className={isActive ? 'purple' : 'light-grey'}
          />
        </div>
      </NavLink>
    </li>
  )
}

function EntryPointPicker({ entryPoints, isOpen, onClose, activeEntryPoints }) {
  const [filterText, setFilterText] = useState('')

  const location = useLocation()

  // filter people out if there's filter text defined, and don't bother case matching
  const filteredEntryPoints = entryPoints.filter(entryPoint => {
    return (
      !filterText ||
      entryPoint.content.toLowerCase().indexOf(filterText.toLowerCase()) > -1
    )
  })

  return (
    <CSSTransition
      in={isOpen}
      timeout={100}
      unmountOnExit
      classNames='entry-point-picker-wrapper'>
      <PickerTemplate
        className='entry-point-picker'
        heading='Entry Points'
        onClose={onClose}>
        {/* Entry Point Picker Search */}
        <div className='entry-point-picker-search'>
          <Icon
            name='search.svg'
            size='very-small'
            className='grey not-hoverable'
          />
          <input
            type='text'
            onChange={e => setFilterText(e.target.value)}
            value={filterText}
            placeholder='search entry points...'
            autoFocus
          />
          {filterText !== '' && (
            <button
              onClick={() => {
                setFilterText('')
              }}
              className='clear-button'>
              clear
            </button>
          )}
        </div>
        <div className='entry-point-picker-spacer' />
        <ul className='entry-point-picker-list'>
          {filteredEntryPoints.map(entryPoint => (
            <EntryPointPickerItem
              key={entryPoint.address}
              entryPoint={entryPoint}
              isActive={activeEntryPoints.some(
                address => address === entryPoint.address
              )}
              activeEntryPoints={activeEntryPoints}
            />
          ))}
          {/* Entry Points Empty State */}
          {entryPoints.length === 0 && (
            <li className='entry-points-empty-state-content'>
              <img
                src='img/door-closed.svg'
                className='entry-points-empty-state-image'
              />
              <div className='entry-points-empty-state-image-circle'></div>
              <span>
                You currently have no entry points for this project.{' '}
                <NavLink
                  to={`${location.pathname}?${GUIDE_IS_OPEN}=creating_entry_points`}
                  onClick={onClose}
                  className='entry-points-empty-state-content-link'>
                  Learn how to create one
                </NavLink>
                .
              </span>
            </li>
          )}
        </ul>
        <img
          className='entry-point-picker-pointer'
          src='img/popup-curved-pointer-downside.svg'
        />
      </PickerTemplate>
    </CSSTransition>
  )
}

function mapStateToProps(state) {
  const {
    ui: { activeProject, activeEntryPoints },
  } = state
  const combinedEntryPoints = selectEntryPoints(state, activeProject)

  return {
    entryPoints: combinedEntryPoints,
    activeEntryPoints,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(EntryPointPicker)
