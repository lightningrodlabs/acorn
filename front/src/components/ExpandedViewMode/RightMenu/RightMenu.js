import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './RightMenu.css'

import Icon from '../../Icon/Icon'

import PeoplePicker from '../../PeoplePicker/PeoplePicker'
import DatePicker from '../../DatePicker/DatePicker'
import PriorityPicker from '../../PriorityPicker/PriorityPicker'
import HierarchyPicker from '../../HierarchyPicker/HierarchyPicker'

export default function RightMenu({
  projectId,
  goalAddress,
  goal,
  updateGoal,
}) {
  const defaultViews = {
    help: false,
    squirrels: false,
    priority: false,
    timeframe: false,
    hierarchy: false,
  }

  const innerUpdateGoal = key => val => {
    updateGoal(
      {
        ...goal,
        timestamp_updated: moment().unix(),
        [key]: val,
      },
      goalAddress
    )
  }

  const [viewsOpen, setViews] = useState(defaultViews)

  useEffect(() => {
    if (!goalAddress) {
      setViews({ ...defaultViews })
    }
  }, [goalAddress])

  const rightMenuPriorityClass = viewsOpen.priority ? 'active' : ''
  const rightMenuHelpClass = viewsOpen.help ? 'active' : ''

  const rightMenuSquirrelsClass = viewsOpen.squirrels ? 'active' : ''
  const rightMenuTimeframeClass = viewsOpen.timeframe ? 'active' : ''
  const rightMenuHierarchyClass = viewsOpen.hierarchy ? 'active' : ''

  const toggleView = key => {
    setViews({ ...defaultViews, [key]: !viewsOpen[key] })
  }

  /* timeframe variables */

  const updateTimeframe = (start, end) => {
    let timeframe = null

    if (start && end) {
      timeframe = {
        from_date: start,
        to_date: end,
      }
    }

    updateGoal(
      {
        ...goal,
        timestamp_updated: moment().unix(),
        time_frame: timeframe,
      },
      goalAddress
    )
  }

  const fromDate = goal.time_frame
    ? moment.unix(goal.time_frame.from_date)
    : null
  const toDate = goal.time_frame ? moment.unix(goal.time_frame.to_date) : null

  return (
    <div className='expanded_view_right_menu'>
      {/* priority */}
      <Icon
        name='priority.svg'
        className={rightMenuPriorityClass}
        key='priority'
        onClick={() => toggleView('priority')}
      />
      {viewsOpen.priority && (
        <PriorityPicker
          projectId={projectId}
          goalAddress={goalAddress}
          onClose={() => setViews({ ...defaultViews })}
        />
      )}
      {/* squirrels */}
      <Icon
        name='squirrel.svg'
        className={rightMenuSquirrelsClass}
        key='squirrels'
        onClick={() => toggleView('squirrels')}
      />
      {viewsOpen.squirrels && (
        <PeoplePicker
          projectId={projectId}
          onClose={() => setViews({ ...defaultViews })}
        />
      )}
      {/* timeframe */}
      <Icon
        name='calendar.svg'
        className={rightMenuTimeframeClass}
        key='timeframe'
        onClick={() => toggleView('timeframe')}
      />
      {viewsOpen.timeframe && (
        <DatePicker
          onClose={() => setViews({ ...defaultViews })}
          onSet={updateTimeframe}
          fromDate={fromDate}
          toDate={toDate}
        />
      )}
      {/* hierarchy */}
      <Icon
        name='hierarchy.svg'
        className={rightMenuHierarchyClass}
        key='hierarchy'
        onClick={() => toggleView('hierarchy')}
      />
      {viewsOpen.hierarchy && (
        <HierarchyPicker
          onClose={() => setViews({ ...defaultViews })}
          selectedHierarchy={goal.hierarchy}
          hierarchyClicked={innerUpdateGoal('hierarchy')}
        />
      )}

      <Icon name='tag.svg' className='right_menu_tag feature-in-development' />
      <Icon
        name='help.svg'
        className='right_menu_help feature-in-development'
      />
      <Icon
        name='link.svg'
        className='right_menu_link feature-in-development'
      />
      <Icon
        name='archive.svg'
        className='right_menu_archive feature-in-development'
      />
      <Icon
        name='share.svg'
        className='right_menu_share feature-in-development'
      />
      <Icon
        name='github.svg'
        className='right_menu_github feature-in-development'
      />
    </div>
  )
}
