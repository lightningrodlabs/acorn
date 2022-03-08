import React, { useState } from 'react'
import './PeoplePicker.css'
import Icon from '../Icon/Icon'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import Avatar from '../Avatar/Avatar'

export default function PeoplePicker({
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
