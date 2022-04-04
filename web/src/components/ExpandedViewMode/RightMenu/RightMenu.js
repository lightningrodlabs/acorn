import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './RightMenu.scss'

import Icon from '../../Icon/Icon'

import PeoplePicker from '../../PeoplePicker/PeoplePicker.connector'
import DatePicker from '../../DatePicker/DatePicker'
import PriorityPicker from '../../PriorityPicker/PriorityPicker.connector'
import HierarchyPicker from '../../HierarchyPicker/HierarchyPicker'

export default function RightMenu({
  projectId,
  agentAddress,
  outcomeHeaderHash,
  outcome,
  updateOutcome,
}) {
  const defaultViews = {
    help: false,
    squirrels: false,
    priority: false,
    timeframe: false,
    hierarchy: false,
  }

  const innerUpdateOutcome = key => val => {
    updateOutcome(
      {
        ...outcome,
        editorAgentPubKey: agentAddress,
        timestampUpdated: moment().unix(),
        [key]: val,
      },
      outcomeHeaderHash
    )
  }

  const [viewsOpen, setViews] = useState(defaultViews)

  useEffect(() => {
    if (!outcomeHeaderHash) {
      setViews({ ...defaultViews })
    }
  }, [outcomeHeaderHash])

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
        fromDate: start,
        toDate: end,
      }
    }

    updateOutcome(
      {
        ...outcome,
        editorAgentPubKey: agentAddress,
        timestampUpdated: moment().unix(),
        timeFrame: timeframe,
      },
      outcomeHeaderHash
    )
  }

  const fromDate = outcome.timeFrame
    ? moment.unix(outcome.timeFrame.fromDate)
    : null
  const toDate = outcome.timeFrame ? moment.unix(outcome.timeFrame.toDate) : null

  return (
    <div className='expanded_view_right_menu'>
      <div className='right-menu-icons'>
        {/* priority */}
        <Icon
          name='sort-asc.svg'
          className={rightMenuPriorityClass}
          key='priority'
          onClick={() => toggleView('priority')}
        />
        {/* squirrels */}
        <Icon
          name='squirrel.svg'
          className={rightMenuSquirrelsClass}
          key='squirrels'
          onClick={() => toggleView('squirrels')}
        />
        {/* timeframe */}
        <Icon
          name='calendar.svg'
          className={rightMenuTimeframeClass}
          key='timeframe'
          onClick={() => toggleView('timeframe')}
        />
        {/* hierarchy */}
        <Icon
          name='hierarchy-leaf.svg'
          className={rightMenuHierarchyClass}
          key='hierarchy'
          onClick={() => toggleView('hierarchy')}
        />
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
          name='delete.svg'
          className='right_menu_delete feature-in-development'
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
      <div className='right-menu-open-picker'>
        {viewsOpen.priority && (
          <PriorityPicker
            projectId={projectId}
            outcomeHeaderHash={outcomeHeaderHash}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
        {viewsOpen.squirrels && (
          <PeoplePicker
            projectId={projectId}
            onClose={() => setViews({ ...defaultViews })}
          />
        )}
        {viewsOpen.timeframe && (
          <DatePicker
            onClose={() => setViews({ ...defaultViews })}
            onSet={updateTimeframe}
            fromDate={fromDate}
            toDate={toDate}
          />
        )}
        {viewsOpen.hierarchy && (
          <HierarchyPicker
            onClose={() => setViews({ ...defaultViews })}
            selectedHierarchy={outcome.hierarchy}
            hierarchyClicked={innerUpdateOutcome('hierarchy')}
          />
        )}
      </div>
    </div>
  )
}
