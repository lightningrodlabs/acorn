import React, { useState } from 'react'
import moment from 'moment'
import './PriorityGoal.scss'
import Avatar from '../Avatar/Avatar'
import Icon from '../Icon/Icon'
import HierarchyIcon from '../HierarchyIcon/HierarchyIcon'
import Button from '../Button/Button'

export default function PriorityGoal({ whoami, goal, votes, setPriorityPickerAddress }) {
  const fromDate = goal.time_frame
    ? moment.unix(goal.time_frame.from_date)
    : null
  const toDate = goal.time_frame ? moment.unix(goal.time_frame.to_date) : null

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
    <div className="priority-quadrant-goal-item">
      <div className="priority-quadrant-goal-iconANDmark">
        <div className="priority-quadrant-goal-icon">
          <HierarchyIcon
            size="small"
            hierarchy={goal.hierarchy}
            status={goal.status}
          />
        </div>
        {myVote && <div className="priority-myvote-mark" />}
      </div>
      <div className="priority-quadrant-goal-content">
        <div className="priority-quadrant-goal-titleANDinfo">
          <div className="priority-quadrant-goal-title">{goal.content}</div>
          <div className="priority-quadrant-goal-info">
            {goal.time_frame && (
              <div className="priority-quadrant-goal-timeframe">
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
            <div className="priority-quadrant-goal-squirrels">
              {goal.members
                ? goal.members.map((goalMember, index) => (
                    <Avatar
                      key={index}
                      first_name={goalMember.first_name}
                      last_name={goalMember.last_name}
                      avatar_url={goalMember.avatar_url}
                      imported={goalMember.is_imported}
                      small
                    />
                  ))
                : null}
            </div>
          </div>
        </div>
        <div className="priority-quadrant-goal-right-menu">
          <div className="weigh_in_button">
            <Button
              key="priority"
              size="small"
              color="purple"
              text={myVote ? 'See My Vote' : 'Weigh In'}
              onClick={() => setPriorityPickerAddress(goal.headerHash)}
            />
          </div>

          {/* TODO: enable linking to this goal on the MapView */}
          {/* <div className='priority-quadrant-goal-view-mode-icons'>
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
