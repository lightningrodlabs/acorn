import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import './PeoplePicker.css'

import Icon from '../Icon/Icon'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import {
  createGoalMember,
  archiveGoalMember,
} from '../../projects/goal-members/actions'
import Avatar from '../Avatar/Avatar'
import moment from 'moment'

function PeoplePicker({
  agentAddress,
  people,
  goalAddress,
  createGoalMember,
  archiveGoalMember,
  onClose,
}) {
  const [filterText, setFilterText] = useState('')

  return (
    <PickerTemplate
      className="people-picker"
      heading="Squirrels"
      onClose={onClose}
    >
      <div className="people-picker-search">
        <Icon name="search.svg" size="small" className="not-hoverable" />
        <input
          type="text"
          onChange={(e) => setFilterText(e.target.value)}
          value={filterText}
          placeholder="search squirrels..."
          autoFocus
        />
        {filterText !== '' && (
          <button
            onClick={() => {
              setFilterText('')
            }}
            className="clear-button"
          >
            clear
          </button>
        )}
      </div>
      <div className="people-picker-spacer" />
      <ul className="people-picker-people">
        {people
          // filter people out if there's filter text defined, and don't bother case matching
          // also match anywhere in the string, not just the start
          .filter((person) => {
            const name = `${person.first_name} ${person.last_name}`
            return (
              !filterText ||
              name.toLowerCase().indexOf(filterText.toLowerCase()) > -1
            )
          })
          // sort members (people attached to Goal) to the top of the list
          .sort((p1, p2) => {
            if (p1.is_member && !p2.is_member) return -1
            else if (p1.is_member && p2.is_member) return 0
            else if (!p1.is_member && p2.is_member) return 1
          })
          .map((person, index) => {
            const onClick = () => {
              if (person.is_member)
                archiveGoalMember(person.goal_member_address)
              else createGoalMember(goalAddress, person.address, agentAddress)
            }
            return (
              <li
                key={index}
                className={person.is_member ? 'member' : ''}
                onClick={onClick}
              >
                <Avatar
                  first_name={person.first_name}
                  last_name={person.last_name}
                  avatar_url={person.avatar_url}
                  imported={person.is_imported}
                  medium
                  withStatus
                  selfAssignedStatus={person.status}
                />
                <div className="person-nameANDhandle">
                  <span className="person-name">
                    {person.first_name} {person.last_name}
                  </span>
                  <div className="person-handle">{person.handle}</div>
                </div>
                {!person.is_member && (
                  <Icon
                    name="radio-button.svg"
                    size="small"
                    className="light-grey radio-button"
                  />
                )}
                {person.is_member && (
                  <Icon
                    name="radio-button-checked.svg"
                    size="small"
                    className="purple radio-button"
                  />
                )}
              </li>
            )
          })}
      </ul>
    </PickerTemplate>
  )
}

function mapStateToProps(state, ownProps) {
  const goalAddress = state.ui.goalForm.isOpen
    ? state.ui.goalForm.editAddress
    : state.ui.expandedView.goalAddress
  const { projectId } = ownProps
  const goalMembers = state.projects.goalMembers[projectId] || {}
  const members = state.projects.members[projectId] || {}
  const membersOfGoal = Object.keys(goalMembers)
    .map((address) => goalMembers[address])
    .filter((goalMember) => goalMember.goal_address === goalAddress)
  // just in case we've received a 'member' before the agents profile
  // filter out any missing profiles for now
  const agents = Object.keys(members).map((address) => state.agents[address]).filter((agent) => agent)
  return {
    agentAddress: state.agentAddress,
    people: agents.map((agent) => {
      const member = membersOfGoal.find(
        (goalMember) => goalMember.agent_address === agent.address
      )
        console.log(member)
      return {
        ...agent, // address, name, avatar_url
        is_member: member ? true : false,
        goal_member_address: member ? member.headerHash : null,
      }
    }),
    goalAddress,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createGoalMember: (goal_address, agent_address, user_edit_hash) => {
      return dispatch(
        createGoalMember.create({
          cellIdString,
          payload: {
            goal_address,
            agent_address,
            user_edit_hash,
            unix_timestamp: moment().unix(),
            is_imported: false
          },
        })
      )
    },
    archiveGoalMember: (payload) => {
      return dispatch(archiveGoalMember.create({ cellIdString, payload }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PeoplePicker)
