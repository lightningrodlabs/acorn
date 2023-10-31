import React, { useState, useEffect } from 'react'
import moment from 'moment'
import TextareaAutosize from 'react-textarea-autosize'

import PeoplePicker from '../../../../PeoplePicker/PeoplePicker'
import {
  AssigneeWithActionHash,
  ComputedOutcome,
  ComputedScope,
  Outcome,
  Profile,
  Tag,
} from '../../../../../types'
import {
  AgentPubKeyB64,
  CellIdString,
  ActionHashB64,
  WithActionHash,
} from '../../../../../types/shared'

import './EvDetails.scss'
import TagsList from '../../../../TagsList/TagsList'
import MetadataWithLabel from '../../../../MetadataWithLabel/MetadataWithLabel'
import GithubLink from '../../../../GithubLink/GithubLink'
import AvatarsList from '../../../../AvatarsList/AvatarsList'
import MarkdownDescription from '../../../../MarkdownDescription/MarkdownDescription'
import EditingOverlay from '../../../../EditingOverlay/EditingOverlay'
import DateRangePicker, { DatePicker } from '../../../../DatePicker/DatePicker'
import Typography from '../../../../Typography/Typography'
import Icon from '../../../../Icon/Icon'

/* end testing data */

export type EvDetailsOwnProps = {
  projectId: CellIdString
  outcome: ComputedOutcome
  content: string
  githubInputLinkText: string
  description: string
  setContent: React.Dispatch<React.SetStateAction<string>>
  setGithubInputLinkText: React.Dispatch<React.SetStateAction<string>>
  setDescription: React.Dispatch<React.SetStateAction<string>>
  updateOutcome: (outcome: Outcome, actionHash: ActionHashB64) => Promise<void>
  updateOutcomeWithLatest: () => Promise<void>
  cleanOutcome: () => Outcome
}

export type EvDetailsConnectorStateProps = {
  activeAgentPubKey: AgentPubKeyB64
  outcomeActionHash: ActionHashB64
  projectTags: WithActionHash<Tag>[]
  // a list of project members who are
  // literally active on the project RIGHT NOW
  // concurrently
  presentMembers: AgentPubKeyB64[]
  // a list of specifically the assignees
  assignees: AssigneeWithActionHash[]
  // a list of all profiles, with data about
  // whether the person is an assignee on each object
  people: (Profile & {
    isOutcomeMember: boolean
    outcomeMemberActionHash: ActionHashB64
  })[]
  // TODO: fix this type
  editingPeers: {}[]
}

export type EvDetailsConnectorDispatchProps = {
  // tags
  onCreateTag: (text: string, backgroundColor: string) => Promise<void>
  onUpdateExistingTag: (
    actionHash: ActionHashB64,
    text: string,
    backgroundColor: string
  ) => Promise<void>
  createOutcomeMember: (
    outcomeActionHash: ActionHashB64,
    memberAgentPubKey: AgentPubKeyB64,
    creatorAgentPubKey: AgentPubKeyB64
  ) => Promise<void>
  deleteOutcomeMember: (actionHash: ActionHashB64) => Promise<void>
  startTitleEdit: (outcomeActionHash: ActionHashB64) => void
  endTitleEdit: (outcomeActionHash: ActionHashB64) => void
  startDescriptionEdit: (outcomeActionHash: ActionHashB64) => void
  endDescriptionEdit: (outcomeActionHash: ActionHashB64) => void
}

export type EvDetailsProps = EvDetailsOwnProps &
  EvDetailsConnectorStateProps &
  EvDetailsConnectorDispatchProps

const EvDetails: React.FC<EvDetailsProps> = ({
  // own props
  projectId,
  outcome,
  content,
  githubInputLinkText,
  description,
  setContent,
  setGithubInputLinkText,
  setDescription,
  updateOutcomeWithLatest,
  cleanOutcome,
  // state props
  activeAgentPubKey,
  projectTags,
  outcomeActionHash,
  assignees,
  people,
  presentMembers,
  // dispatch props
  // tags
  onCreateTag,
  onUpdateExistingTag,
  updateOutcome,
  createOutcomeMember,
  deleteOutcomeMember,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) => {
  // reset
  useEffect(() => {
    if (!outcomeActionHash) {
      setEditAssignees(false)
      // setEditTimeframe(false)
    }
  }, [outcomeActionHash])

  /*
    Title
  */

  // handle change (or update) of outcome
  const outcomeContent = outcome ? outcome.content : ''
  useEffect(() => {
    setContent(outcomeContent)
  }, [outcomeContent])
  const onTitleBlur = () => {
    console.log('onTitleBlur triggered')
    updateOutcomeWithLatest()
    endTitleEdit(outcomeActionHash)
  }
  const onTitleFocus = () => {
    startTitleEdit(outcomeActionHash)
  }
  const handleOnChangeTitle = ({ target }) => {
    setContent(target.value)
  }
  // is someone else editing it?
  // if so, local person can't
  const editingTitlePeer = editingPeers.find(
    // @ts-ignore
    (peerInfo) => peerInfo.outcomeBeingEdited.isTitle
  )
  // @ts-ignore
  const titleEditor = editingTitlePeer ? editingTitlePeer.profileInfo : {}

  /*
    Github Link
  */

  const [isEditingGithubLink, setIsEditingGithubLink] = useState(false)
  const outcomeGithubLink = outcome ? outcome.githubLink : ''
  useEffect(() => {
    setGithubInputLinkText(outcomeGithubLink)
    if (!outcomeGithubLink) {
      setIsEditingGithubLink(true)
    } else {
      setIsEditingGithubLink(false)
    }
  }, [outcomeGithubLink])

  /*
    Assignees
  */
  const [editAssignees, setEditAssignees] = useState(false)

  /*
    Times
  */
  const [editingTimeframe, setEditingTimeframe] = useState(false)

  let fromDate: moment.Moment, toDate: moment.Moment // for Uncertain
  let targetDate: moment.Moment // for Small
  let timeFieldLabel: string
  let durationEstimate: string
  let onSetDate = async (fromDate: number, toDate: number) => {}

  if (outcome) {
    // Uncertain
    if (outcome.computedScope === ComputedScope.Uncertain) {
      timeFieldLabel = 'Breakdown Time Est.'
      fromDate =
        'Uncertain' in outcome.scope &&
        outcome.scope.Uncertain.timeFrame &&
        outcome.scope.Uncertain.timeFrame.fromDate
          ? moment.unix(outcome.scope.Uncertain.timeFrame.fromDate)
          : null
      toDate =
        'Uncertain' in outcome.scope &&
        outcome.scope.Uncertain.timeFrame &&
        outcome.scope.Uncertain.timeFrame.toDate
          ? moment.unix(outcome.scope.Uncertain.timeFrame.toDate)
          : null
      onSetDate = async (fromDate: number, toDate: number) => {
        let cleaned = cleanOutcome()
        let timeFrame = fromDate && toDate ? { fromDate, toDate } : null
        cleaned.scope = {
          Uncertain: {
            ...('Uncertain' in outcome.scope
              ? outcome.scope.Uncertain
              : { inBreakdown: true, smallsEstimate: null }),
            timeFrame,
          },
        }
        await updateOutcome(cleaned, outcomeActionHash)
      }
    } else if (outcome.computedScope === ComputedScope.Small) {
      // Small
      timeFieldLabel = 'Target Date'
      targetDate =
        'Small' in outcome.scope && outcome.scope.Small.targetDate
          ? moment.unix(outcome.scope.Small.targetDate)
          : null
      onSetDate = async (targetDate: number) => {
        let cleaned = cleanOutcome()
        cleaned.scope = {
          Small: {
            ...('Small' in outcome.scope
              ? outcome.scope.Small
              : { achievementStatus: 'NotAchieved', taskList: [] }),
            targetDate,
          },
        }
        await updateOutcome(cleaned, outcomeActionHash)
      }
    } else if (outcome.computedScope === ComputedScope.Big) {
      // Big
      timeFieldLabel = 'Achievement Time Est.'
      durationEstimate = `${outcome.computedAchievementStatus.smallsTotal} days`
    }
  }

  /*
    TAGS
  */
  const selectedTags = outcome ? outcome.tags : []
  const onSelectNewTags = async (newSelectedTags: ActionHashB64[]) => {
    const newOutcome = cleanOutcome()
    newOutcome.tags = newSelectedTags
    updateOutcome(newOutcome, outcomeActionHash)
  }

  /* 
    Description
  */

  // the latest persisted state
  const outcomeDescription = outcome ? outcome.description : ''
  // sync the live editor state with the
  // persisted state, if the persisted state changes
  // "underneath" us, or because of us
  useEffect(() => {
    setDescription(outcomeDescription)
  }, [outcomeDescription])
  // find out if any of the peers is editing title
  // then take the profile metadata from that and
  // use to feed into avatar
  const onDescriptionBlur = () => {
    updateOutcomeWithLatest()
    endDescriptionEdit(outcomeActionHash)
  }
  const onDescriptionFocus = () => {
    startDescriptionEdit(outcomeActionHash)
  }
  const handleOnChangeDescription = (value: string) => {
    setDescription(value)
  }
  // is someone else editing it?
  // if so, local person can't
  const editingDescriptionPeer = editingPeers.find(
    // @ts-ignore
    (peerInfo) => !peerInfo.outcomeBeingEdited.isTitle
  )
  const descriptionEditor = editingDescriptionPeer
    ? // @ts-ignore
      editingDescriptionPeer.profileInfo
    : {}

  /*
    Component
  */
  return (
    <>
      <div className="ev-details-wrapper">
        {/* Expanded View Title */}
        <div className="ev-details-inner-wrapper">
          <div className="ev-title-wrapper">
            <EditingOverlay
              isBeingEditedByOther={!!editingTitlePeer}
              personEditing={titleEditor}
            >
              <div className="ev-title">
                <TextareaAutosize
                  disabled={!!editingTitlePeer}
                  value={content}
                  onBlur={onTitleBlur}
                  onChange={handleOnChangeTitle}
                  onKeyPress={handleOnChangeTitle}
                  placeholder="Add outcome statement"
                  onFocus={onTitleFocus}
                />
              </div>
            </EditingOverlay>
          </div>

          {/* Github Link */}
          <div className="ev-github-link">
            <GithubLink
              // the current persisted value
              githubLink={outcomeGithubLink}
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
              onCreateTag={onCreateTag}
              onUpdateExistingTag={onUpdateExistingTag}
            />
          </div>

          {/* Assignees and Time related fields */}
          <div className="ev-assignees-and-time-row">
            {/* Assignees */}
            <div className="ev-assignees-wrapper">
              <MetadataWithLabel label="Assignees">
                <AvatarsList
                  showPresence
                  profilesPresent={presentMembers}
                  size="small-medium"
                  profiles={assignees.map((assignee) => assignee.profile)}
                  showAddButton
                  onClickButton={() => setEditAssignees(true)}
                />
                <div className="ev-add-members-popup-wrapper">
                  {editAssignees && (
                    <PeoplePicker
                      projectId={projectId}
                      onClose={() => setEditAssignees(false)}
                      activeAgentPubKey={activeAgentPubKey}
                      profilesPresent={presentMembers}
                      people={people}
                      outcomeActionHash={outcomeActionHash}
                      createOutcomeMember={createOutcomeMember}
                      deleteOutcomeMember={deleteOutcomeMember}
                    />
                  )}
                </div>
              </MetadataWithLabel>
            </div>

            {/* Time related */}
            <div className="ev-time-wrapper">
              {/* make label based on the scope of the outcome */}
              <MetadataWithLabel label={timeFieldLabel}>
                {/* For Big, it is a read-only field */}
                {/* For Uncertain and Small, it is an editable field */}
                <div
                  className={`ev-time-display ${
                    outcome && outcome.computedScope === ComputedScope.Big
                      ? 'computed'
                      : ''
                  }`}
                  onClick={() =>
                    outcome.computedScope !== ComputedScope.Big &&
                    setEditingTimeframe(!editingTimeframe)
                  }
                >
                  {/* Big - Achievement Time Est.*/}
                  {outcome && outcome.computedScope === ComputedScope.Big && (
                    <>
                      <div className="big-scope-time-estimate-wrapper">
                        <Icon
                          name="calculator-grey.svg"
                          className="grey not-hoverable"
                        />
                        <Typography style="h7">{durationEstimate}</Typography>
                        <div className="more-info-wrapper">
                          <a
                            href="https://docs.acorn.software/outcomes/time"
                            target="_blank"
                          >
                            <Icon
                              name="info.svg"
                              className="light-grey"
                              size="small"
                            />
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Uncertain */}
                  {outcome &&
                    outcome.computedScope === ComputedScope.Uncertain && (
                      <>
                        <Typography style="body1">
                          {fromDate && fromDate.format('MMM D, YYYY')}
                          {toDate && fromDate !== toDate && ' - '}

                          {toDate && toDate.format('MMM D, YYYY')}
                        </Typography>
                        {!fromDate && !toDate && <>Click to set time</>}
                      </>
                    )}
                  {/* Small */}
                  {outcome && outcome.computedScope === ComputedScope.Small && (
                    <>
                      {targetDate && (
                        <Typography style="body1">
                          {targetDate.format('MMM D, YYYY')}
                        </Typography>
                      )}
                      {!targetDate && <>Click to set time</>}
                    </>
                  )}
                </div>
              </MetadataWithLabel>

              {editingTimeframe &&
                outcome &&
                outcome.computedScope === ComputedScope.Small && (
                  <DatePicker
                    date={targetDate}
                    onClose={() => {
                      setEditingTimeframe(false)
                    }}
                    onSet={onSetDate}
                  />
                )}
              {editingTimeframe &&
                outcome &&
                outcome.computedScope === ComputedScope.Uncertain && (
                  <DateRangePicker
                    fromDate={fromDate}
                    toDate={toDate}
                    onClose={() => setEditingTimeframe(false)}
                    onSet={onSetDate}
                  />
                )}
            </div>
          </div>

          {/* Description */}
          <MarkdownDescription
            isBeingEditedByOther={!!editingDescriptionPeer}
            personEditing={descriptionEditor}
            onBlur={onDescriptionBlur}
            onFocus={onDescriptionFocus}
            onChange={handleOnChangeDescription}
            value={description}
          />
        </div>
      </div>
    </>
  )
}

export default EvDetails
