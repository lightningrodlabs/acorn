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
          {squirrel.first_name} {squirrel.last_name}
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
        remove from goal
      </div>
    </div>
  )
}

export default function ExpandedViewModeContent({
  projectId,
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
}) {
  // 0 is details
  // 1 is comments
  // 2 is history
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="expanded_view_content">
      <ExpandedViewNavBar
        activeTab={activeTab}
        onChange={(newTab) => setActiveTab(newTab)}
        commentCount={comments.length}
      />
      <div className="expanded-view-tabs">
        {activeTab === 0 && (
          <Details
            projectId={projectId}
            {...{
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

  const updateContent = () => {
    updateGoal(
      {
        ...goal,
        timestamp_updated: moment().unix(),
        content,
        description,
      },
      goalAddress
    )
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

  return (
    <>
      <div className="expanded-view-scroll-content">
        <div className="expanded_view_title">
          <TextareaAutosize
            value={content}
            onBlur={updateContent}
            onChange={handleOnChangeTitle}
            onKeyPress={handleOnChangeTitle}
            placeholder="Add a title..."
          />
        </div>

        <div className="squirrels_timeframe_row">
          <div className="expanded_view_squirrels_wrapper">
            <div className="expanded_view_squirrels_title">squirrels</div>
            <div className="expanded_view_squirrels_content">
              {squirrels.map((squirrel, index) => {
                const highlighted = squirrelInfoPopup
                  ? squirrelInfoPopup.address === squirrel.address
                  : false
                return (
                  <Avatar
                    key={index}
                    first_name={squirrel.first_name}
                    last_name={squirrel.last_name}
                    avatar_url={squirrel.avatar_url}
                    medium
                    clickable
                    onClick={() =>
                      setSquirrelInfoPopup(squirrelInfoPopup ? null : squirrel)
                    }
                    highlighted={highlighted}
                  />
                )
              })}
              {squirrelInfoPopup && (
                <SquirrelInfoPopup
                  onClose={() => setSquirrelInfoPopup(null)}
                  squirrel={squirrelInfoPopup}
                  archiveGoalMember={archiveGoalMember}
                />
              )}
              <div className="expanded_view_squirrels_add_wrapper">
                <Icon
                  className="add_squirrel_plus_icon"
                  name="plus.svg"
                  size="medium"
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
          <div className="timeframe_wrapper">
            <div className="expanded_view_timeframe_title">timeframe</div>
            <div
              className="expanded_view_timeframe_display"
              onClick={() => setEditTimeframe(!editTimeframe)}
            >
              {fromDate && fromDate.format('MMM D, YYYY')}
              {toDate && ' - '}
              {toDate && toDate.format('MMM D, YYYY')}
              {!fromDate && !toDate && 'not set'}
            </div>

          </div>
        </div>
        <div className="expanded_view_description">
          <TextareaAutosize
            placeholder="Add description here"
            value={description}
            onBlur={updateContent}
            onChange={handleOnChangeDescription}
          />
        </div>
      </div>
    </>
  )
}
