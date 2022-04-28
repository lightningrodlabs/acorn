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
import Typography from '../../../../Typography/Typography'
import GithubLink from '../../../../GithubLink/GithubLink'
import AvatarsList from '../../../../AvatarsList/AvatarsList'

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

  // the live editor state
  const [content, setContent] = useState('')
  // the live editor state
  const [description, setDescription] = useState('')

  // the live github link editor state
  const [githubInputLinkText, setGithubInputLinkText] = useState('')
  const [isEditingGithubLink, setIsEditingGithubLink] = useState(false)

  // reset
  useEffect(() => {
    if (!outcomeHeaderHash) {
      setEditAssignees(false)
      // setEditTimeframe(false)
    }
  }, [outcomeHeaderHash])

  // handle change (or update) of outcome
  const outcomeContent = outcome ? outcome.content : ''
  const outcomeDescription = outcome ? outcome.description : ''
  const outcomeGithubLink = outcome ? outcome.githubLink : ''
  useEffect(() => {
    setContent(outcomeContent)
  }, [outcomeContent])
  useEffect(() => {
    setDescription(outcomeDescription)
  }, [outcomeDescription])
  useEffect(() => {
    setGithubInputLinkText(outcomeGithubLink)
    if (!outcomeGithubLink) {
      setIsEditingGithubLink(true)
    } else {
      setIsEditingGithubLink(false)
    }
  }, [outcomeGithubLink])

  const cleanOutcome = (): Outcome => {
    return {
      ...outcome,
      editorAgentPubKey: activeAgentPubKey,
      timestampUpdated: moment().unix(),
      content,
      description,
      githubLink: githubInputLinkText,
    }
  }
  const updateOutcomeWithLatest = async () => {
    await updateOutcome(cleanOutcome(), outcomeHeaderHash)
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
    // fromDate = outcome.timeFrame
    //   ? moment.unix(outcome.timeFrame.fromDate)
    //   : null
    // toDate = outcome.timeFrame ? moment.unix(outcome.timeFrame.toDate) : null
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
      <div className="ev-details-wrapper">
        {/* Expanded View Title */}
        <div className="ev-details-inner-wrapper">
          <div className="ev-title-wrapper">
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
                <div className="ev-title-editing-placeholder">
                  <div className="ev-title">
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
              <div className="ev-title">
                <TextareaAutosize
                  value={content}
                  onBlur={onTitleBlur}
                  onChange={handleOnChangeTitle}
                  onKeyPress={handleOnChangeTitle}
                  placeholder="Add outcome statement"
                  onFocus={onTitleFocus}
                />
              </div>
            )}
          </div>

          {/* Github Link */}

          <div className="ev-github-link">
            <GithubLink
              githubLink={githubInputLinkText}
              onSubmit={async () => {
                await updateOutcomeWithLatest()
                setIsEditingGithubLink(false)
              }}
              isEditing={isEditingGithubLink}
              setIsEditing={setIsEditingGithubLink}
              inputLinkText={githubInputLinkText}
              setInputLinkText={setGithubInputLinkText}
            />
          </div>

          {/* Tags */}
          <div className="ev-tags">
            <TagsList
              tags={projectTags}
              showAddTagButton={true}
              selectedTags={selectedTags}
              onChange={onSelectNewTags}
              onSaveTag={onSaveTag}
            />
          </div>

          <div className="ev-assginees-and-time-row">
            <div className="ev-assignees-wrapper">
              <MetadataWithLabel label="Assignees">
                <AvatarsList
                  size="small-medium"
                  profiles={assignees.map((assignee) => assignee.profile)}
                  showAddButton
                  onClickButton={() => setEditAssignees(true)}
                />

                {/* {personInfoPopup && (
                <PersonInfoPopup
                  onClose={() => setPersonInfoPopup(null)}
                  person={personInfoPopup}
                  deleteOutcomeMember={deleteOutcomeMember}
                />
              )} */}
                <div className="ev-add-members-popup-wrapper">
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
              </MetadataWithLabel>
            </div>
            <div className="ev-time-wrapper">
              {/* TODO: make label based on the scope of the outcome */}
              <MetadataWithLabel label="Breakdown Time Est.">
                <div
                  className="ev-timeframe-display"
                  // TODO: bring this back
                  // onClick={() => setEditTimeframe(!editTimeframe)}
                >
                  {fromDate && fromDate.format('MMM D, YYYY')}
                  {toDate && ' - '}
                  {toDate && toDate.format('MMM D, YYYY')}
                  {!fromDate && !toDate && 'Click to set time'}
                </div>
              </MetadataWithLabel>
            </div>
          </div>
          <MetadataWithLabel
            label="Description"
            // @ts-ignore
            icon={<Icon name="text-align-left.svg" />}
          >
            <div className="ev-description-wrapper">
              {/* If description is being edited by someone */}
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
                  <div className="ev-description-editing-placeholder">
                    <div className="ev-description">
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
                <div className="ev-description">
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
      </div>
    </>
  )
}

export default EvDetails
