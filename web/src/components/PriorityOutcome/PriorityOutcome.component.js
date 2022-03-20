import React, { useState } from 'react'
import moment from 'moment'
import './PriorityOutcome.scss'
import Avatar from '../Avatar/Avatar'
import Icon from '../Icon/Icon'
import HierarchyIcon from '../HierarchyIcon/HierarchyIcon'
import Button from '../Button/Button'

export default function PriorityOutcome({ whoami, outcome, votes, setPriorityPickerAddress }) {
  const fromDate = outcome.time_frame
    ? moment.unix(outcome.time_frame.from_date)
    : null
  const toDate = outcome.time_frame ? moment.unix(outcome.time_frame.to_date) : null

  // you can use these as values for
  // testing/ development, instead of `squirrels`
  // const testSquirrels = [
  //  { avatar_url: 'img/profile.png' },
  //  { avatar_url: 'img/profile.png' },
  //  { avatar_url: 'img/profile.png' },
  //]

  const myVote =
    whoami &&
    votes.find((value) => {
      return value.agent_address === whoami.entry.headerHash
    })

  return (
    <div className="priority-quadrant-outcome-item">
      <div className="priority-quadrant-outcome-iconANDmark">
        <div className="priority-quadrant-outcome-icon">
          <HierarchyIcon
            size="small"
            hierarchy={outcome.hierarchy}
            status={outcome.status}
          />
        </div>
        {myVote && <div className="priority-myvote-mark" />}
      </div>
      <div className="priority-quadrant-outcome-content">
        <div className="priority-quadrant-outcome-titleANDinfo">
          <div className="priority-quadrant-outcome-title">{outcome.content}</div>
          <div className="priority-quadrant-outcome-info">
            {outcome.time_frame && (
              <div className="priority-quadrant-outcome-timeframe">
                <Icon
                  name="calendar.svg"
                  size="very-small"
                  className="grey not-hoverable"
                />
                {fromDate && fromDate.format('MMM D, YYYY')}
                {toDate && ' - '}
                {toDate && toDate.format('MMM D, YYYY')}
              </div>
            )}
            <div className="priority-quadrant-outcome-squirrels">
              {outcome.members
                ? outcome.members.map((outcomeMember, index) => (
                    <Avatar
                      key={index}
                      first_name={outcomeMember.first_name}
                      last_name={outcomeMember.last_name}
                      avatar_url={outcomeMember.avatar_url}
                      imported={outcomeMember.is_imported}
                      small
                    />
                  ))
                : null}
            </div>
          </div>
        </div>
        <div className="priority-quadrant-outcome-right-menu">
          <div className="weigh_in_button">
            <Button
              key="priority"
              size="small"
              color="purple"
              text={myVote ? 'See My Vote' : 'Weigh In'}
              onClick={() => setPriorityPickerAddress(outcome.headerHash)}
            />
          </div>

          {/* TODO: enable linking to this outcome on the MapView */}
          {/* <div className='priority-quadrant-outcome-view-mode-icons'>
            <NavLink to='/project/:projectId/map'>
              <Icon
                name='map.svg'
                size='view-mode-small'
                className='grey'
              />
            </NavLink>
            <Icon
              name='timeline.svg'
              size='view-mode-small'
              className='grey'
            />
          </div> */}
        </div>
      </div>
    </div>
  )
}
