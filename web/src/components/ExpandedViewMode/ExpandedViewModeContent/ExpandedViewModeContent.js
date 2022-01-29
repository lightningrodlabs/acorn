import React, { useState, useRef, useEffect } from 'react'
import moment from 'moment'
import useOnClickOutside from 'use-onclickoutside'
import TextareaAutosize from 'react-textarea-autosize'

import './ExpandedViewModeContent.css'
import Avatar from '../../Avatar/Avatar'
import Icon from '../../Icon/Icon'
import PeoplePicker from '../../PeoplePicker/PeoplePicker'
import Comments from '../../Comments/Comments'
import ActivityHistory from './ActivityHistory/ActivityHistory'
import ExpandedViewNavBar from './ExpandedViewNavBar/ExpandedViewNavBar'

function SquirrelInfoPopup({ squirrel, onClose, archiveGoalMember }) {
  const ref = useRef()
  useOnClickOutside(ref, onClose)

  // TODO : connect "squirrel-info-popup-name" div to the member's profile page
  // TODO : connect "remove from goal" button to holochain
  return (
    <div className="squirrel-info-popup-wrapper" ref={ref}>
      <div className="squirrel-info-popup-nameANDhandle">
        <div className="squirrel-info-popup-name">
          {squirrel.first_name} {squirrel.last_name}{' '}
          {squirrel.is_imported ? <div>(Imported)</div> : ''}
        </div>
        <div className="squirrel-info-popup-handle">{squirrel.handle}</div>
      </div>
      <div
        className="remove-squirrel-btn"
        onClick={(e) => {
          onClose()
          archiveGoalMember(squirrel.goalMemberAddress)
        }}
      >
        Remove from goal
      </div>
    </div>
  )
}

export default function ExpandedViewModeContent({
  projectId,
  agentAddress,
  goalAddress,
  goal,
  goalContent,
  goalDescription,
  editTimeframe,
  setEditTimeframe,
  updateGoal,
  squirrels,
  comments,
  archiveGoalMember,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) {
  // 0 is details
  // 1 is comments
  // 2 is history
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="expanded-view-content">
      <ExpandedViewNavBar
        activeTab={activeTab}
        onChange={(newTab) => setActiveTab(newTab)}
        commentCount={comments.length}
      />
      <div className="expanded-view-inner-content">
        {activeTab === 0 && (
          <Details
            {...{
              projectId,
              agentAddress,
              setActiveTab,
              editTimeframe,
              setEditTimeframe,
              goalAddress,
              goal,
              goalContent,
              goalDescription,
              updateGoal,
              squirrels,
              archiveGoalMember,
              startTitleEdit,
              endTitleEdit,
              startDescriptionEdit,
              endDescriptionEdit,
              editingPeers,
            }}
          />
        )}
        {activeTab === 1 && (
          <Comments projectId={projectId} comments={comments} />
        )}
        {activeTab === 2 && <ActivityHistory projectId={projectId} />}
      </div>
    </div>
  )
}

function Details({
  projectId,
  agentAddress,
  setActiveTab,
  editTimeframe,
  setEditTimeframe,
  goalAddress,
  goal,
  goalContent,
  goalDescription,
  updateGoal,
  squirrels,
  archiveGoalMember,
  startTitleEdit,
  endTitleEdit,
  startDescriptionEdit,
  endDescriptionEdit,
  editingPeers,
}) {
  // you can use these as values for
  // testing/ development, instead of `squirrels`
  const testSquirrels = [
    { avatar_url: 'img/profile.png' },
    { avatar_url: 'img/profile.png' },
    { avatar_url: 'img/profile.png' },
  ]

  const [editSquirrels, setEditSquirrels] = useState(false)
  const [squirrelInfoPopup, setSquirrelInfoPopup] = useState(null)

  const [content, setContent] = useState(goalContent)
  const [description, setDescription] = useState(goalDescription)

  // reset
  useEffect(() => {
    if (!goalAddress) {
      setActiveTab(0)
      setEditSquirrels(false)
      setSquirrelInfoPopup(null)
      setEditTimeframe(false)
    }
  }, [goalAddress])

  // handle change of goal
  useEffect(() => {
    setContent(goalContent)
  }, [goalContent])
  useEffect(() => {
    setDescription(goalDescription)
  }, [goalDescription])

  const onTitleBlur = () => {
    updateGoal(
      {
        ...goal,
        user_edit_hash: agentAddress,
        timestamp_updated: moment().unix(),
        content,
        description,
      },
      goalAddress
    )
    endTitleEdit(goalAddress)
  }
  const onDescriptionBlur = () => {
    updateGoal(
      {
        ...goal,
        user_edit_hash: agentAddress,
        timestamp_updated: moment().unix(),
        content,
        description,
      },
      goalAddress
    )
    endDescriptionEdit(goalAddress)
  }
  const onTitleFocus = () => {
    startTitleEdit(goalAddress)
  }
  const onDescriptionFocus = () => {
    startDescriptionEdit(goalAddress)
  }
  const handleOnChangeTitle = ({ target }) => {
    setContent(target.value)
  }
  const handleOnChangeDescription = ({ target }) => {
    setDescription(target.value)
  }

  const fromDate = goal.time_frame
    ? moment.unix(goal.time_frame.from_date)
    : null
  const toDate = goal.time_frame ? moment.unix(goal.time_frame.to_date) : null

  // const isBeingEdited = false


  const member =
  {
    first_name: 'Pegah',
    last_name: 'Vaezi',
    avatar_url:
      'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.fouladiprojects.com%2Fwp-content%2Fuploads%2F2015%2F10%2FBarbourshow1.jpg&f=1&nofb=1',
    is_imported: false,
    headerHash: 'riusry3764yiud',
    connectionStatus: 'connected',
    status: 'online',
  }

  // find out if any of the peers is editing title, then take the agent key from that and use to feed into avatar

  const editingTitlePeer = editingPeers.find((peerInfo) => peerInfo.goalBeingEdited.isTitle)
  const editingDescriptionPeer = editingPeers.find((peerInfo) => !peerInfo.goalBeingEdited.isTitle)
  const titleEditor = editingTitlePeer ? editingTitlePeer.profileInfo : {}
  const descriptionEditor = editingDescriptionPeer ? editingDescriptionPeer.profileInfo : {}


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
                  first_name={titleEditor.first_name}
                  last_name={titleEditor.last_name}
                  avatar_url={titleEditor.avatar_url}
                  is_imported={titleEditor.is_imported}
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

        <div className="squirrels-timeframe-row">
          <div className="expanded-view-squirrels-wrapper">
            <div className="expanded-view-squirrels-title">Squirrels</div>
            <div className="expanded-view-squirrels-content">
              {squirrels.map((squirrel, index) => {
                // TODO: fix the highlight for avatars showing all at once
                // instead of only highlighting the selected avatar
                const highlighted = squirrelInfoPopup
                  ? squirrelInfoPopup.headerHash === squirrel.headerHash
                  : false
                return (
                  <div className="expanded-view-squirrel-wrapper">
                    <Avatar
                      withWhiteBorder
                      key={index}
                      first_name={squirrel.first_name}
                      last_name={squirrel.last_name}
                      avatar_url={squirrel.avatar_url}
                      imported={squirrel.is_imported}
                      medium
                      withWhiteBorder
                      withStatus
                      selfAssignedStatus={squirrel.status}
                      clickable
                      onClick={() =>
                        setSquirrelInfoPopup(squirrelInfoPopup ? null : squirrel)
                      }
                      highlighted={highlighted}
                    />
                  </div>
                )
              })}
              {squirrelInfoPopup && (
                <SquirrelInfoPopup
                  onClose={() => setSquirrelInfoPopup(null)}
                  squirrel={squirrelInfoPopup}
                  archiveGoalMember={archiveGoalMember}
                />
              )}
              <div className="expanded-view-squirrels-add-wrapper">
                <Icon
                  className="add-squirrel-plus-icon"
                  name="plus.svg"
                  size="small"
                  onClick={() => setEditSquirrels(!editSquirrels)}
                />
                {editSquirrels && (
                  <PeoplePicker
                    projectId={projectId}
                    onClose={() => setEditSquirrels(false)}
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
                  first_name={descriptionEditor.first_name}
                  last_name={descriptionEditor.last_name}
                  avatar_url={descriptionEditor.avatar_url}
                  is_imported={descriptionEditor.is_imported}
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
