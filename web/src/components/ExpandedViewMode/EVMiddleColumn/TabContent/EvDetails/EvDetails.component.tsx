import React, { useState, useEffect } from 'react'
import moment from 'moment'
import TextareaAutosize from 'react-textarea-autosize'

import Avatar from '../../../../Avatar/Avatar'
import PeopleInfoPopup from '../../../../PersonInfoPopup/PersonInfoPopup'
import PeoplePicker from '../../../../PeoplePicker/PeoplePicker.connector'
import Icon from '../../../../Icon/Icon'
import { ExpandedViewTab } from '../../../NavEnum'
import {
  AssigneeWithHeaderHash,
  ComputedOutcome,
  Outcome,
  Profile,
} from '../../../../../types'
import {
  AgentPubKeyB64,
  CellIdString,
  HeaderHashB64,
} from '../../../../../types/shared'

import './EvDetails.scss'

/*
testing data
*/

// you can use these as values for
// testing/ development, instead of `assignees`
const _testAssignees = [
  { avatarUrl: 'img/profile.png' },
  { avatarUrl: 'img/profile.png' },
  { avatarUrl: 'img/profile.png' },
]

const _member = {
  firstName: 'Pegah',
  lastName: 'Vaezi',
  avatarUrl:
    'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.fouladiprojects.com%2Fwp-content%2Fuploads%2F2015%2F10%2FBarbourshow1.jpg&f=1&nofb=1',
  isImported: false,
  headerHash: 'riusry3764yiud',
  connectionStatus: 'connected',
  status: 'online',
}

/* end testing data */

export type EvDetailsOwnProps = {
  projectId: CellIdString
  outcome: ComputedOutcome
  setActiveTab: React.Dispatch<React.SetStateAction<ExpandedViewTab>>
}

export type EvDetailsConnectorStateProps = {
  activeAgentPubKey: AgentPubKeyB64
  outcomeHeaderHash: HeaderHashB64
  assignees: AssigneeWithHeaderHash[]
  // TODO: what type?
  editingPeers: any
  profiles: { [agentPubKey: AgentPubKeyB64]: Profile }
}

export type EvDetailsConnectorDispatchProps = {
  updateOutcome: (outcome: Outcome, headerHash: HeaderHashB64) => Promise<void>
  deleteOutcomeMember: (headerHash: HeaderHashB64) => Promise<void>
  startTitleEdit: (outcomeHeaderHash: HeaderHashB64) => void
  endTitleEdit: (outcomeHeaderHash: HeaderHashB64) => void
  startDescriptionEdit: (outcomeHeaderHash: HeaderHashB64) => void
  endDescriptionEdit: (outcomeHeaderHash: HeaderHashB64) => void
}

export type EvDetailsProps = EvDetailsOwnProps &
  EvDetailsConnectorStateProps &
  EvDetailsConnectorDispatchProps

const EvDetails: React.FC<EvDetailsProps> = ({
  // own props
  projectId,
  outcome,
  setActiveTab,
  // state props
  activeAgentPubKey,
  outcomeHeaderHash,
  assignees,
  profiles,
  // dispatch props
  updateOutcome,
  deleteOutcomeMember,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) => {
  let creator: Profile
  if (outcome) {
    Object.keys(profiles).forEach((value) => {
      if (profiles[value].agentPubKey === outcome.creatorAgentPubKey)
        creator = profiles[value]
    })
  }

  const [outcomeState, setOutcomeState] = useState<ComputedOutcome>()
  const [assigneesState, setAssigneesState] = useState<
    AssigneeWithHeaderHash[]
  >()
  const [creatorState, setCreatorState] = useState<Profile>()

  useEffect(() => {
    if (outcome) {
      setOutcomeState({ ...outcome })
    }
  }, [outcome])

  useEffect(() => {
    if (assignees) {
      setAssigneesState([...assignees])
    }
  }, [assignees])

  useEffect(() => {
    if (creator) {
      setCreatorState({ ...creator })
    }
  }, [creator])

  const [editAssignees, setEditAssignees] = useState(false)
  const [
    personInfoPopup,
    setPersonInfoPopup,
  ] = useState<AssigneeWithHeaderHash>(null)

  // the live editor state
  const [content, setContent] = useState('')
  // the live editor state
  const [description, setDescription] = useState('')

  // reset
  useEffect(() => {
    if (!outcomeHeaderHash) {
      setActiveTab(ExpandedViewTab.Details)
      setEditAssignees(false)
      setPersonInfoPopup(null)
      // setEditTimeframe(false)
    }
  }, [outcomeHeaderHash])

  // handle change of outcome
  const outcomeContent = outcome ? outcome.content : ''
  const outcomeDescription = outcome ? outcome.description : ''
  useEffect(() => {
    setContent(outcomeContent)
  }, [outcomeContent])
  useEffect(() => {
    setDescription(outcomeDescription)
  }, [outcomeDescription])

  const onTitleBlur = () => {
    updateOutcome(
      {
        ...outcome,
        editorAgentPubKey: activeAgentPubKey,
        timestampUpdated: moment().unix(),
        content,
        description,
      },
      outcomeHeaderHash
    )
    endTitleEdit(outcomeHeaderHash)
  }
  const onDescriptionBlur = () => {
    updateOutcome(
      {
        ...outcome,
        editorAgentPubKey: activeAgentPubKey,
        timestampUpdated: moment().unix(),
        content,
        description,
      },
      outcomeHeaderHash
    )
    endDescriptionEdit(outcomeHeaderHash)
  }
  const onTitleFocus = () => {
    startTitleEdit(outcomeHeaderHash)
  }
  const onDescriptionFocus = () => {
    startDescriptionEdit(outcomeHeaderHash)
  }
  const handleOnChangeTitle = ({ target }) => {
    setContent(target.value)
  }
  const handleOnChangeDescription = ({ target }) => {
    setDescription(target.value)
  }

  let fromDate: moment.Moment, toDate: moment.Moment
  if (outcome) {
    fromDate = outcome.timeFrame
      ? moment.unix(outcome.timeFrame.fromDate)
      : null
    toDate = outcome.timeFrame ? moment.unix(outcome.timeFrame.toDate) : null
  }

  // const isBeingEdited = false

  // find out if any of the peers is editing title, then take the agent key from that and use to feed into avatar

  const editingTitlePeer = editingPeers.find(
    (peerInfo) => peerInfo.outcomeBeingEdited.isTitle
  )
  const editingDescriptionPeer = editingPeers.find(
    (peerInfo) => !peerInfo.outcomeBeingEdited.isTitle
  )
  const titleEditor = editingTitlePeer ? editingTitlePeer.profileInfo : {}
  const descriptionEditor = editingDescriptionPeer
    ? editingDescriptionPeer.profileInfo
    : {}

  return (
    <>
      <div className="expanded-view-details-wrapper">
        <div className="expanded-view-title-wrapper">
          {editingTitlePeer ? (
            <div>
              <div className="member-editing-title-wrapper">
                <Avatar
                  withStatusBorder
                  size='small-medium'
                  firstName={titleEditor.firstName}
                  lastName={titleEditor.lastName}
                  avatarUrl={titleEditor.avatarUrl}
                  // @ts-ignore
                  isImported={titleEditor.isImported}
                  headerHash={titleEditor.address}
                  connectionStatus={'connected'}
                  selfAssignedStatus={titleEditor.status}
                />
              </div>
              <div className="expanded-view-title-editing-placeholder">
                <div className="expanded-view-title">
                  <TextareaAutosize
                    disabled={editingTitlePeer}
                    value={content}
                    onBlur={onTitleBlur}
                    onChange={handleOnChangeTitle}
                    onKeyPress={handleOnChangeTitle}
                    placeholder="Add a title..."
                    onFocus={onTitleFocus}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="expanded-view-title">
              <TextareaAutosize
                value={content}
                onBlur={onTitleBlur}
                onChange={handleOnChangeTitle}
                onKeyPress={handleOnChangeTitle}
                placeholder="Add a title..."
                onFocus={onTitleFocus}
              />
            </div>
          )}
        </div>

        {/* Github Link */}
        <div>Github Link</div>

        {/* Tags */}
        <div>Tags</div>

        <div className="squirrels-timeframe-row">
          <div className="expanded-view-squirrels-wrapper">
            <div className="expanded-view-squirrels-title">Assignees</div>
            <div className="expanded-view-squirrels-content">
              {assignees.map((assignee, index) => {
                // TODO: fix the highlight for avatars showing all at once
                // instead of only highlighting the selected avatar
                const highlighted = personInfoPopup
                  ? personInfoPopup.outcomeMemberHeaderHash ===
                    assignee.outcomeMemberHeaderHash
                  : false
                return (
                  <div className="expanded-view-squirrel-wrapper">
                    <Avatar
                      withWhiteBorder
                      key={index}
                      size='medium'
                      firstName={assignee.profile.firstName}
                      lastName={assignee.profile.lastName}
                      avatarUrl={assignee.profile.avatarUrl}
                      imported={assignee.profile.isImported}
                      // @ts-ignore
                      withWhiteBorder
                      withStatus
                      selfAssignedStatus={assignee.profile.status}
                      clickable
                      onClick={() =>
                        setPersonInfoPopup(personInfoPopup ? null : assignee)
                      }
                      highlighted={highlighted}
                    />
                  </div>
                )
              })}
              {personInfoPopup && (
                <PeopleInfoPopup
                  onClose={() => setPersonInfoPopup(null)}
                  person={personInfoPopup}
                  deleteOutcomeMember={deleteOutcomeMember}
                />
              )}
              <div className="expanded-view-squirrels-add-wrapper">
                {/* @ts-ignore */}
                <Icon
                  className="add-squirrel-plus-icon"
                  name="plus.svg"
                  size="small"
                  onClick={() => setEditAssignees(!editAssignees)}
                  withTooltip
                  tooltipText="Add Squirrels"
                />
                {editAssignees && (
                  <PeoplePicker
                    projectId={projectId}
                    onClose={() => setEditAssignees(false)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="timeframe-wrapper">
            <div className="expanded-view-timeframe-title">Timeframe</div>
            <div
              className="expanded-view-timeframe-display"
              // TODO: bring this back
              // onClick={() => setEditTimeframe(!editTimeframe)}
            >
              {fromDate && fromDate.format('MMM D, YYYY')}
              {toDate && ' - '}
              {toDate && toDate.format('MMM D, YYYY')}
              {!fromDate && !toDate && 'Click to set timeframe'}
            </div>
          </div>
        </div>
        <div className="expanded-view-description-wrapper">
          {editingDescriptionPeer ? (
            <div>
              <div className="member-editing-description-wrapper">
                <Avatar
                  withStatusBorder
                  size='small-medium'
                  firstName={descriptionEditor.firstName}
                  lastName={descriptionEditor.lastName}
                  avatarUrl={descriptionEditor.avatarUrl}
                  // @ts-ignore
                  isImported={descriptionEditor.isImported}
                  headerHash={descriptionEditor.address}
                  connectionStatus={'connected'}
                  selfAssignedStatus={descriptionEditor.status}
                />
              </div>
              <div className="expanded-view-description-editing-placeholder">
                <div className="expanded-view-description">
                  <TextareaAutosize
                    disabled={editingDescriptionPeer}
                    placeholder="Add description here"
                    value={description}
                    onBlur={onDescriptionBlur}
                    onChange={handleOnChangeDescription}
                    onFocus={onDescriptionFocus}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="expanded-view-description">
              <TextareaAutosize
                placeholder="Add description here"
                value={description}
                onBlur={onDescriptionBlur}
                onChange={handleOnChangeDescription}
                onFocus={onDescriptionFocus}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default EvDetails
