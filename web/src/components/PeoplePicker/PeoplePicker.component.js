import React, { useState } from 'react'
import './PeoplePicker.scss'
import Icon from '../Icon/Icon'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import Avatar from '../Avatar/Avatar'

export default function PeoplePicker({
  agentAddress,
  people,
  outcomeHeaderHash,
  createOutcomeMember,
  deleteOutcomeMember,
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
            const name = `${person.firstName} ${person.lastName}`
            return (
              !filterText ||
              name.toLowerCase().indexOf(filterText.toLowerCase()) > -1
            )
          })
          // sort members (people attached to Outcome) to the top of the list
          .sort((p1, p2) => {
            if (p1.is_member && !p2.is_member) return -1
            else if (p1.is_member && p2.is_member) return 0
            else if (!p1.is_member && p2.is_member) return 1
          })
          .map((person, index) => {
            const onClick = () => {
              if (person.is_member)
                deleteOutcomeMember(person.outcome_member_address)
              else createOutcomeMember(outcomeHeaderHash, person.address, agentAddress)
            }
            return (
              <li
                key={index}
                className={person.is_member ? 'member' : ''}
                onClick={onClick}
              >
                <Avatar
                  firstName={person.firstName}
                  lastName={person.lastName}
                  avatarUrl={person.avatarUrl}
                  imported={person.isImported}
                  medium
                  withStatus
                  selfAssignedStatus={person.status}
                />
                <div className="person-nameANDhandle">
                  <span className="person-name">
                    {person.firstName} {person.lastName}
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
