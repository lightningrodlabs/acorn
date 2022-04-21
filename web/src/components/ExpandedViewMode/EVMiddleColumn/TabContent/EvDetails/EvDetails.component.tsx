import React, { useState, useEffect } from 'react'
import moment from 'moment'
import TextareaAutosize from 'react-textarea-autosize'

import Avatar from '../../../../Avatar/Avatar'
import PersonInfoPopup from '../../../../PersonInfoPopup/PersonInfoPopup'
import PeoplePicker from '../../../../PeoplePicker/PeoplePicker'
import Icon from '../../../../Icon/Icon'
import {
  AssigneeWithHeaderHash,
  ComputedOutcome,
  Outcome,
  Profile,
  Tag,
} from '../../../../../types'
import {
  AgentPubKeyB64,
  CellIdString,
  HeaderHashB64,
  WithHeaderHash,
} from '../../../../../types/shared'

import './EvDetails.scss'
import TagsList from '../../../../TagsList/TagsList'
import MetadataWithLabel from '../../../../MetadataWithLabel/MetadataWithLabel'

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
}

export type EvDetailsConnectorStateProps = {
  activeAgentPubKey: AgentPubKeyB64
  outcomeHeaderHash: HeaderHashB64
  projectTags: WithHeaderHash<Tag>[]
  // a list of specifically the assignees
  assignees: AssigneeWithHeaderHash[]
  // an object with ALL profiles
  profiles: { [agentPubKey: AgentPubKeyB64]: Profile }
  // a list of all profiles, with data about
  // whether the person is an assignee on each object
  people: (Profile & {
    isOutcomeMember: boolean
    outcomeMemberHeaderHash: HeaderHashB64
  })[]
  // TODO: fix this type
  editingPeers: {}[]
}

export type EvDetailsConnectorDispatchProps = {
  onSaveTag: (text: string, backgroundColor: string) => Promise<void>
  updateOutcome: (outcome: Outcome, headerHash: HeaderHashB64) => Promise<void>
  createOutcomeMember: (
    outcomeHeaderHash: HeaderHashB64,
    memberAgentPubKey: AgentPubKeyB64,
    creatorAgentPubKey: AgentPubKeyB64
  ) => Promise<void>
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
  // state props
  activeAgentPubKey,
  projectTags,
  outcomeHeaderHash,
  assignees,
  people,
  profiles,
  // dispatch props
  onSaveTag,
  updateOutcome,
  createOutcomeMember,
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

  const cleanOutcome = () => {
    return {
      ...outcome,
      editorAgentPubKey: activeAgentPubKey,
      timestampUpdated: moment().unix(),
      content,
      description,
    }
  }
  const updateOutcomeWithLatest = () => {
    updateOutcome(cleanOutcome(), outcomeHeaderHash)
  }
  const onTitleBlur = () => {
    updateOutcomeWithLatest()
    endTitleEdit(outcomeHeaderHash)
  }
  const onDescriptionBlur = () => {
    updateOutcomeWithLatest()
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

  // TAGS
  const selectedTags = outcome ? outcome.tags : []
  const onSelectNewTags = async (newSelectedTags: HeaderHashB64[]) => {
    const newOutcome = cleanOutcome()
    newOutcome.tags = newSelectedTags
    updateOutcome(newOutcome, outcomeHeaderHash)
  }

  return (
    <>
      <div className="expanded-view-details-wrapper">
        <div className="expanded-view-title-wrapper">
          {editingTitlePeer ? (
            <div>
              <div className="member-editing-title-wrapper">
                <Avatar
                  withStatusBorder
                  size="small-medium"
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
                    disabled={!!editingTitlePeer}
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
        <div>
          <TagsList
            tags={projectTags}
            showAddTagButton={true}
            selectedTags={selectedTags}
            onChange={onSelectNewTags}
            onSaveTag={onSaveTag}
          />
        </div>

        <div className="squirrels-timeframe-row">
          <div className="expanded-view-squirrels-wrapper">
            <MetadataWithLabel label="Assignees">
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
                        size="medium"
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
                  <PersonInfoPopup
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
                      activeAgentPubKey={activeAgentPubKey}
                      people={people}
                      outcomeHeaderHash={outcomeHeaderHash}
                      createOutcomeMember={createOutcomeMember}
                      deleteOutcomeMember={deleteOutcomeMember}
                    />
                  )}
                </div>
              </div>
            </MetadataWithLabel>
          </div>
          <div className="timeframe-wrapper">
            <MetadataWithLabel label="Timeframe">
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
            </MetadataWithLabel>
          </div>
        </div>
        <MetadataWithLabel
          label="Description"
          // @ts-ignore
          icon={<Icon name="text-align-left.svg" />}
        >
          <div className="expanded-view-description-wrapper">
            {editingDescriptionPeer ? (
              <div>
                <div className="member-editing-description-wrapper">
                  <Avatar
                    withStatusBorder
                    size="small-medium"
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
                      disabled={!!editingDescriptionPeer}
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
        </MetadataWithLabel>
      </div>
    </>
  )
}

export default EvDetails
