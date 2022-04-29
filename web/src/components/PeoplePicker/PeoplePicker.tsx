import React, { useState } from 'react'
import './PeoplePicker.scss'
import Icon from '../Icon/Icon'
import PickerTemplate from '../PickerTemplate/PickerTemplate'
import Avatar from '../Avatar/Avatar'
import { AgentPubKeyB64, CellIdString, HeaderHashB64 } from '../../types/shared'
import { Profile } from '../../types'

export type PeoplePickerProps = {
  projectId: CellIdString
  onClose: () => void
  activeAgentPubKey: AgentPubKeyB64
  people: (Profile & {
    isOutcomeMember: boolean
    outcomeMemberHeaderHash: HeaderHashB64
  })[]
  outcomeHeaderHash: HeaderHashB64
  createOutcomeMember: (
    outcomeHeaderHash: HeaderHashB64,
    memberAgentPubKey: AgentPubKeyB64,
    creatorAgentPubKey: AgentPubKeyB64
  ) => Promise<void>
  deleteOutcomeMember: (headerHash: HeaderHashB64) => Promise<void>
}

const PeoplePicker: React.FC<PeoplePickerProps> = ({
  activeAgentPubKey,
  people,
  outcomeHeaderHash,
  createOutcomeMember,
  deleteOutcomeMember,
  onClose,
}) => {
  const [filterText, setFilterText] = useState('')

  return (
    <PickerTemplate
      className="people-picker"
      heading="Assignees"
      onClose={onClose}
    >
      <div className="people-picker-search">
        <Icon name="search.svg" size="small" className="not-hoverable" />
        <input
          type="text"
          onChange={(e) => setFilterText(e.target.value)}
          value={filterText}
          placeholder="Search members"
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
            if (p1.isOutcomeMember && !p2.isOutcomeMember) return -1
            else if (p1.isOutcomeMember && p2.isOutcomeMember) return 0
            else if (!p1.isOutcomeMember && p2.isOutcomeMember) return 1
          })
          .map((person, index) => {
            const onClick = () => {
              if (person.isOutcomeMember)
                deleteOutcomeMember(person.outcomeMemberHeaderHash)
              else
                createOutcomeMember(
                  outcomeHeaderHash,
                  person.agentPubKey,
                  activeAgentPubKey
                )
            }
            return (
              <li
                key={index}
                className={person.isOutcomeMember ? 'member' : ''}
                onClick={onClick}
              >
                <Avatar
                  firstName={person.firstName}
                  lastName={person.lastName}
                  avatarUrl={person.avatarUrl}
                  imported={person.isImported}
                  size='medium'
                  withStatus
                  selfAssignedStatus={person.status}
                />
                <div className="person-nameANDhandle">
                  <span className="person-name">
                    {person.firstName} {person.lastName}
                  </span>
                  <div className="person-handle">{person.handle}</div>
                </div>
                {!person.isOutcomeMember && (
                  <Icon
                    name="radio-button.svg"
                    size="small"
                    className="light-grey radio-button"
                  />
                )}
                {person.isOutcomeMember && (
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

export default PeoplePicker
