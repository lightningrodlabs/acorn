import React from 'react'
import moment from 'moment'
import Avatar from '../Avatar/Avatar'
import './Comment.scss'

export default function Comment({ comment, agent }) {
  return (
    <div className="comment-history-item">
      <div className="comment-history-avatar">
        <Avatar
          firstName={agent.firstName}
          lastName={agent.lastName}
          avatarUrl={agent.avatarUrl}
          imported={agent.isImported}
          medium
          withStatus
          selfAssignedStatus={agent.status}
        />
      </div>
      <div className="comment-history-content">
        <div className="comment-history-info">
          <div className="comment-history-name">
            {agent.firstName + ' ' + agent.lastName}
            {agent.isImported ? ' (Imported)' : ''}
          </div>
          <div className="comment-history-date">
            {moment.unix(comment.unixTimestamp).calendar(null, {
              lastDay: '[Yesterday at] LT',
              sameDay: '[Today at] LT',
              nextDay: '[Tomorrow at] LT',
              lastWeek: '[last] dddd [at] LT',
              nextWeek: 'dddd [at] LT',
              sameElse: 'MMM Do YYYY [at] LT',
            })}
          </div>
        </div>
        <div className="comment-history-text">{comment.content}</div>
      </div>
    </div>
  )
}
