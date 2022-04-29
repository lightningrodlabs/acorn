import React from 'react'
import moment from 'moment'
import Avatar from '../Avatar/Avatar'
import './CommentPosted.scss'
import { OutcomeComment, Profile } from '../../types'
import Typography from '../Typography/Typography'

export type CommentPostedProps = {
  creator: Profile
  comment: OutcomeComment
}

const CommentPosted: React.FC<CommentPostedProps> = ({ comment, creator }) => {
  return (
    <div className="comment-posted-wrapper">
      <div className="comment-posted-avatar">
        <Avatar
          firstName={creator.firstName}
          lastName={creator.lastName}
          avatarUrl={creator.avatarUrl}
          imported={creator.isImported}
          size="medium"
          withStatus
          selfAssignedStatus={creator.status}
          withWhiteBorder
        />
      </div>
      <div className="comment-posted-content">
        <div className="comment-posted-info">
          <Typography style="h7">
            <div className="comment-posted-name">
              {creator.firstName + ' ' + creator.lastName}
              {creator.isImported ? ' (Imported)' : ''}
            </div>
          </Typography>
          <Typography style="caption4">
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
          </Typography>
        </div>
        <Typography style="body1">
          <div className="comment-history-text">{comment.content}</div>
        </Typography>
      </div>
    </div>
  )
}

export default CommentPosted
