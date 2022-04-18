import React, { useState, useEffect } from 'react'
import moment from 'moment'
import TextareaAutosize from 'react-textarea-autosize'
import Avatar from '../../../../Avatar/Avatar'
import PeopleInfoPopup from '../../../../PeopleInfoPopup/PeopleInfoPopup'
import PeoplePicker from '../../../../PeoplePicker/PeoplePicker.component'
import Icon from '../../../../Icon/Icon'

import './Details.scss'
import { ExpandedViewTab } from '../../../NavEnum'
import { AssigneeWithHeaderHash } from '../../../../../types'


/*
testing data
*/

// you can use these as values for
// testing/ development, instead of `assignees`
const testAssignees = [
  { avatarUrl: 'img/profile.png' },
  { avatarUrl: 'img/profile.png' },
  { avatarUrl: 'img/profile.png' },
]

const member = {
  firstName: 'Pegah',
  lastName: 'Vaezi',
  avatarUrl:
  'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.fouladiprojects.com%2Fwp-content%2Fuploads%2F2015%2F10%2FBarbourshow1.jpg&f=1&nofb=1',
  isImported: false,
  headerHash: 'riusry3764yiud',
  connectionStatus: 'connected',
  status: 'online',
}

// TODO: fix these types
export type DetailsProps = {
  projectId: any
  agentAddress: any
  setActiveTab: any
  editTimeframe: any
  setEditTimeframe: any
  outcomeHeaderHash: any
  outcome: any
  outcomeContent: any
  outcomeDescription: any
  updateOutcome: any
  assignees: AssigneeWithHeaderHash[]
  deleteOutcomeMember: any
  startTitleEdit: any
  endTitleEdit: any
  startDescriptionEdit: any
  endDescriptionEdit: any
  editingPeers: any
}

/* end testing data */

const Details: React.FC<DetailsProps> = ({
  projectId,
  agentAddress,
  setActiveTab,
  editTimeframe,
  setEditTimeframe,
  outcomeHeaderHash,
  outcome,
  outcomeContent,
  outcomeDescription,
  updateOutcome,
  assignees,
  deleteOutcomeMember,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) => {
  const [editAssignees, setEditAssignees] = useState(false)
  const [peopleInfoPopup, setPeopleInfoPopup] = useState<AssigneeWithHeaderHash>(null)

  const [content, setContent] = useState(outcomeContent)
  const [description, setDescription] = useState(outcomeDescription)

  // reset
  useEffect(() => {
    if (!outcomeHeaderHash) {
      setActiveTab(ExpandedViewTab.Details)
      setEditAssignees(false)
      setPeopleInfoPopup(null)
      setEditTimeframe(false)
    }
  }, [outcomeHeaderHash])

  // handle change of outcome
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
        editorAgentPubKey: agentAddress,
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
        editorAgentPubKey: agentAddress,
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

  const fromDate = outcome.timeFrame
    ? moment.unix(outcome.timeFrame.fromDate)
    : null
  const toDate = outcome.timeFrame
    ? moment.unix(outcome.timeFrame.toDate)
    : null

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
                  smallMedium
                  firstName={titleEditor.firstName}
                  lastName={titleEditor.lastName}
                  avatarUrl={titleEditor.avatarUrl}
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
                const highlighted = peopleInfoPopup
                  ? peopleInfoPopup.outcomeMemberHeaderHash === assignee.outcomeMemberHeaderHash
                  : false
                return (
                  <div className="expanded-view-squirrel-wrapper">
                    <Avatar
                      withWhiteBorder
                      key={index}
                      firstName={assignee.profile.firstName}
                      lastName={assignee.profile.lastName}
                      avatarUrl={assignee.profile.avatarUrl}
                      imported={assignee.profile.isImported}
                      medium
                      withWhiteBorder
                      withStatus
                      selfAssignedStatus={assignee.profile.status}
                      clickable
                      onClick={() =>
                        setPeopleInfoPopup(peopleInfoPopup ? null : assignee)
                      }
                      highlighted={highlighted}
                    />
                  </div>
                )
              })}
              {peopleInfoPopup && (
                <PeopleInfoPopup
                  onClose={() => setPeopleInfoPopup(null)}
                  squirrel={peopleInfoPopup}
                  deleteOutcomeMember={deleteOutcomeMember}
                />
              )}
              <div className="expanded-view-squirrels-add-wrapper">
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
              onClick={() => setEditTimeframe(!editTimeframe)}
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
                  smallMedium
                  firstName={descriptionEditor.firstName}
                  lastName={descriptionEditor.lastName}
                  avatarUrl={descriptionEditor.avatarUrl}
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

export default Details
