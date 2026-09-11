import React, { useState } from 'react'
import moment from 'moment'
import TextareaAutosize from 'react-textarea-autosize'
import Avatar from '../Avatar/Avatar'
import './CommentPosted.scss'
import { OutcomeComment, Profile } from '../../types'
import Typography from '../Typography/Typography'

export type CommentPostedProps = {
  creator: Profile
  comment: OutcomeComment
  // edit and delete are offered only when canModify (our own comment)
  canModify?: boolean
  onEdit?: (content: string) => Promise<void>
  onDelete?: () => Promise<void>
}

type Mode = 'view' | 'editing' | 'confirmingDelete'

const CommentPosted: React.FC<CommentPostedProps> = ({
  comment,
  creator,
  canModify = false,
  onEdit,
  onDelete,
}) => {
  const [mode, setMode] = useState<Mode>('view')
  const [draft, setDraft] = useState(comment.content)
  const [busy, setBusy] = useState(false)

  const startEditing = () => {
    setDraft(comment.content)
    setMode('editing')
  }
  const save = async () => {
    if (draft.trim() === '' || draft === comment.content) {
      setMode('view')
      return
    }
    setBusy(true)
    try {
      await onEdit?.(draft)
      setMode('view')
    } catch (e) {
      console.error('Could not save the comment', e)
    } finally {
      setBusy(false)
    }
  }
  const confirmDelete = async () => {
    setBusy(true)
    try {
      await onDelete?.()
    } catch (e) {
      console.error('Could not delete the comment', e)
      setBusy(false)
      setMode('view')
    }
  }
  // same keys as the new-comment input: Enter saves, Cmd/Ctrl+Enter adds a line
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setMode('view')
    } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      save()
    } else if (e.key === 'Enter') {
      setDraft(draft + '\n')
    }
  }

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
        {mode === 'editing' ? (
          <div className="comment-posted-edit">
            <TextareaAutosize
              value={draft}
              autoFocus
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="comment-posted-actions">
              <button onClick={save} disabled={busy || draft.trim() === ''}>
                Save
              </button>
              <button onClick={() => setMode('view')} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <Typography style="body1">
            <div className="comment-history-text">{comment.content}</div>
          </Typography>
        )}
        {canModify && mode === 'view' && (
          <div className="comment-posted-actions comment-posted-actions-on-hover">
            <button onClick={startEditing}>Edit</button>
            <button onClick={() => setMode('confirmingDelete')}>Delete</button>
          </div>
        )}
        {mode === 'confirmingDelete' && (
          <div className="comment-posted-actions">
            <span>Delete this comment?</span>
            <button onClick={confirmDelete} disabled={busy}>
              Delete
            </button>
            <button onClick={() => setMode('view')} disabled={busy}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentPosted
