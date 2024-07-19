import React, { useState, useRef, useEffect } from 'react'
import moment from 'moment'

import {
  AgentPubKeyB64,
  CellIdString,
  ActionHashB64,
  WithActionHash,
} from '../../../../../types/shared'
import { OutcomeComment, Profile } from '../../../../../types'
import CommentInput from '../../../../CommentInput/CommentInput'
import CommentPosted from '../../../../CommentPosted/CommentPosted'
import './EvComments.scss'
import EvReadOnlyHeading from '../../../../EvReadOnlyHeading/EvReadOnlyHeading'
import Icon from '../../../../Icon/Icon'
import { AppClient } from '@holochain/client'

export type EvCommentsOwnProps = {
  projectId: CellIdString
  outcomeContent: string
  appWebsocket: AppClient
}

export type EvCommentsConnectorStateProps = {
  outcomeActionHash: ActionHashB64
  profiles: { [agentPubKey: AgentPubKeyB64]: Profile }
  comments: WithActionHash<OutcomeComment>[]
  activeAgentPubKey: AgentPubKeyB64
}

export type EvCommentsConnectorDispatchProps = {
  createOutcomeComment: (outcomeComment: OutcomeComment) => Promise<void>
}

export type EvCommentsProps = EvCommentsOwnProps &
  EvCommentsConnectorStateProps &
  EvCommentsConnectorDispatchProps

const EvComments: React.FC<EvCommentsProps> = ({
  outcomeActionHash,
  outcomeContent,
  profiles,
  comments,
  createOutcomeComment,
  activeAgentPubKey,
}) => {
  const commentHistoryRef = useRef<HTMLDivElement>(null)

  // the state for capturing the
  // user input of the new comment
  const [value, setValue] = useState('')

  useEffect(() => {
    // .current is on any ref,
    // its whatever the ref is right now,
    // which in this case a reference
    // to the .comments-posted-wrapper div
    setTimeout(() => {
      if (commentHistoryRef.current) {
        commentHistoryRef.current.scrollTop =
          commentHistoryRef.current.scrollHeight
      }
    }, 10)
  }, [])

  const submitComment = async () => {
    if (value === '') {
      return
    }
    try {
      // when new comment created
      await createOutcomeComment({
        outcomeActionHash: outcomeActionHash,
        content: value,
        creatorAgentPubKey: activeAgentPubKey,
        unixTimestamp: moment().unix(),
        isImported: false,
      })
      // then scroll to bottom
      if (commentHistoryRef.current) {
        commentHistoryRef.current.scrollTop =
          commentHistoryRef.current.scrollHeight
      }
      // then reset the typing input
      setValue('')
    } catch (e) {
      console.log(e)
    }
  }

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

  return (
    <>
      <EvReadOnlyHeading
        headingText={outcomeContent}
        overviewIcon={
          <Icon name="chats-circle.svg" className="not-hoverable" />
        }
        overviewText={`${comments.length} comment${
          comments.length !== 1 ? 's' : ''
        }`}
      />
      <div className="comments-posted-wrapper" ref={commentHistoryRef}>
        {comments.length === 0 && (
          <div className="comments-posted-list-item">
            <div className="comments-posted-list-item-empty">
              There are no comments on this outcome yet.
            </div>
          </div>
        )}
        {comments
          // just in case we don't have someones profile, don't show them for now
          // so only keep ones whose profiles we have
          .filter((comment) => profiles[comment.creatorAgentPubKey])
          // order the comments by most recent, to least recent
          .sort((a, b) => (a.unixTimestamp < b.unixTimestamp ? -1 : 1))
          .map((comment) => {
            return (
              <div
                key={comment.actionHash}
                className="comments-posted-list-item"
              >
                <CommentPosted
                  comment={comment}
                  creator={profiles[comment.creatorAgentPubKey]}
                />
              </div>
            )
          })}
      </div>
      <div className="comments-view-input-wrapper">
        <CommentInput
          value={value}
          setValue={setValue}
          onKeyDown={onKeyDown}
          submitComment={submitComment}
        />
      </div>
    </>
  )
}

export default EvComments
