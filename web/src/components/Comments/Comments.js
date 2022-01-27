import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  createGoalComment,
  archiveGoalComment,
  updateGoalComment,
} from '../../projects/goal-comments/actions'

import TextareaAutosize from 'react-textarea-autosize'

import moment from 'moment'
import './Comments.css'

import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'

function Comment({ comment, agent }) {
  return (
    <div className="comment_history_item">
      <div className="avatar_comment_container">
        <Avatar
          first_name={agent.first_name}
          last_name={agent.last_name}
          avatar_url={agent.avatar_url}
          imported={agent.is_imported}
          medium
          withStatus
        />
      </div>
      <div className="comment_history_content">
        <div className="comment_history_info">
          <div className="comment_history_name">
            {agent.first_name + ' ' + agent.last_name}
            {agent.is_imported ? ' (Imported)' : ''}
          </div>
          <div className="comment_history_date">
            {moment.unix(comment.unix_timestamp).calendar(null, {
              lastDay: '[Yesterday at] LT',
              sameDay: '[Today at] LT',
              nextDay: '[Tomorrow at] LT',
              lastWeek: '[last] dddd [at] LT',
              nextWeek: 'dddd [at] LT',
              sameElse: 'MMM Do YYYY [at] LT',
            })}
          </div>
        </div>
        <div className="comment_history_text">{comment.content}</div>
      </div>
    </div>
  )
}

function Comments({
  goalAddress,
  agents,
  comments,
  createGoalComment,
  avatarAddress,
}) {
  const commentHistoryRef = useRef()
  const [value, setValue] = useState('')

  useEffect(() => {
    // .current is on any ref,
    // its whatever the ref is right now,
    // which in this case a reference
    // to the .comment-history-container div
    setTimeout(() => {
      commentHistoryRef.current.scrollTop =
        commentHistoryRef.current.scrollHeight
    }, 10)
  }, [])

  const onKeyDown = (e) => {
    // 13 is key code for Enter/Return
    const ENTER_KEY_CODE = 13
    // metaKey is Cmd on Mac, and Ctrl on Windows & Linux
    if (e.keyCode === ENTER_KEY_CODE && !e.metaKey) {
      // if you press Enter without holding
      // the "meta" key for your platform, then the comment
      // will submit
      submitComment()
    } else if (e.keyCode === ENTER_KEY_CODE) {
      setValue(value + '\n')
    }
  }

  const submitComment = async (e) => {
    if (value === '') {
      return
    }
    try {
      // when new comment created
      await createGoalComment({
        goal_address: goalAddress,
        content: value,
        agent_address: avatarAddress,
        unix_timestamp: moment().unix(),
        is_imported: false
      })
      // then scroll to bottom
      commentHistoryRef.current.scrollTop =
        commentHistoryRef.current.scrollHeight
      // then reset the typing input
      setValue('')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <div className="comments">
        <div className="comment-history-container" ref={commentHistoryRef}>
          {Object.keys(comments)
            .map((key) => comments[key])
            // order the comments by most recent, to least recent
            .sort((a, b) => (a.unix_timestamp < b.unix_timestamp ? -1 : 1))
            .map((comment) => (
              <Comment
                key={comment.headerHash}
                comment={comment}
                agent={agents[comment.agent_address]}
              />
            ))}
        </div>
        <div className="input_comment_row">
          <div className="input_comment_wrapper">
            <TextareaAutosize
              type="text"
              value={value}
              placeholder="Write your comment here"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="comment_save_button">
              <Icon
                name="chevron-right.svg"
                className="medium white not-hoverable"
                onClick={submitComment}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function mapStateToProps(state) {
  const goalAddress = state.ui.expandedView.goalAddress
  return {
    goalAddress,
    avatarAddress: state.whoami.entry.address,
    agents: state.agents,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createGoalComment: (payload) => {
      return dispatch(createGoalComment.create({ cellIdString, payload }))
    },
    archiveGoalComment: (payload) => {
      return dispatch(archiveGoalComment.create({ cellIdString, payload }))
    },
    updateGoalComment: (entry, headerHash) => {
      return dispatch(
        updateGoalComment.create({ cellIdString, payload: { entry, headerHash } })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments)
