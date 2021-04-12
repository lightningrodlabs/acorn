import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
  createGoalComment,
  fetchGoalComments,
  archiveGoalComment,
  updateGoalComment,
} from '../../projects/goal-comments/actions'

import TextareaAutosize from 'react-textarea-autosize'

import moment from 'moment'
import './Comments.css'

import Icon from '../Icon/Icon'
import Avatar from '../Avatar/Avatar'
import Button from '../Button/Button'

function Comment({ comment, agent }) {
  return (
    <div className='comment_history_item'>
      <div className='avatar_comment_container'>
        <Avatar
          first_name={agent.first_name}
          last_name={agent.last_name}
          avatar_url={agent.avatar_url}
          medium
        />
      </div>
      <div className='comment_history_content'>
        <div className='comment_history_info'>
          <div className='comment_history_name'>
            {agent.first_name + ' ' + agent.last_name}
          </div>
          <div className='comment_history_date'>
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
        <div className='comment_history_text'>{comment.content}</div>
      </div>
    </div>
  )
}

function Comments({
  goalAddress,
  avatarUrl,
  firstName,
  lastName,
  agents,
  comments,
  createGoalComment,
  avatarAddress,
}) {
  const [value, setValue] = useState('')

  const sendClick = e => {
    if (value === '') {
      return
    }
    createGoalComment({
      goal_address: goalAddress,
      content: value,
      agent_address: avatarAddress,
      unix_timestamp: moment().unix(),
    })
    setValue('')
  }

  return (
    <div className='comments'>
      <div className='comments_avatarANDInput_wrapper'>
        {/* <div className='avatar_comment_container'>
         <Avatar
            first_name={firstName}
            last_name={lastName}
            avatar_url={avatarUrl}
            mediumLarge
          />
        </div> */}
        <div className='input_comment_row'>
          <div className='input_comment_wrapper'>
            <TextareaAutosize
              type='text'
              value={value}
              placeholder='Write your comment here'
              onChange={e => setValue(e.target.value)}
            />
            <div className='comment_save_button'>
              <Icon name='send.svg' onClick={sendClick} />
            </div>
          </div>
        </div>
      </div>
      <div className='comment_history_container_scrollable'>
        {Object.keys(comments)
          .map(key => comments[key])
          // order the comments by most recent, to least recent
          .sort((a, b) => (a.unix_timestamp > b.unix_timestamp ? -1 : 1))
          .map(comment => (
            <Comment
              key={comment.address}
              comment={comment}
              agent={agents[comment.agent_address]}
            />
          ))}
      </div>
    </div>
  )
}

function mapStateToProps(state, ownProps) {
  const { projectId } = ownProps
  const goalAddress = state.ui.expandedView.goalAddress
  const goalComments = state.projects.goalComments[projectId] || {}
  return {
    comments: Object.values(goalComments).filter(
      goalComment => goalComment.goal_address === goalAddress
    ),
    goalAddress,
    avatarAddress: state.whoami.entry.address,
    avatarUrl: state.whoami.entry.avatar_url,
    firstName: state.whoami.entry.first_name,
    lastName: state.whoami.entry.last_name,
    agents: state.agents,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  return {
    createGoalComment: payload => {
      return dispatch(createGoalComment.create({ cellIdString, payload }))
    },
    archiveGoalComment: payload => {
      return dispatch(archiveGoalComment.create({ cellIdString, payload }))
    },
    updateGoalComment: (entry, address) => {
      return dispatch(
        updateGoalComment.create({ cellIdString, payload: { entry, address } })
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments)
