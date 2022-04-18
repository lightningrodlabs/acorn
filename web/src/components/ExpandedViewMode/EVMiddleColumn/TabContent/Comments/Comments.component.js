import React, { useState, useRef, useEffect } from 'react'
import moment from 'moment'
import Comment from '../../../../CommentPosted/CommentPosted'

import './Comments.scss'
import CommentInput from '../../../../CommentInput/CommentInput'

export default function Comments({
  outcomeHeaderHash,
  agents,
  comments,
  createOutcomeComment,
  avatarAddress,
}) {
  const commentHistoryRef = useRef()

  // the state for capturing the
  // user input of the new comment
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
      await createOutcomeComment({
        outcomeHeaderHash: outcomeHeaderHash,
        content: value,
        creatorAgentPubKey: avatarAddress,
        unixTimestamp: moment().unix(),
        isImported: false,
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

  console.log(agents)
  console.log(comments)

  return (
    <>
      <div className="comments">
        <div className="comment-history-container" ref={commentHistoryRef}>
          {Object.keys(comments)
            .map((key) => comments[key])
            // order the comments by most recent, to least recent
            .sort((a, b) => (a.unixTimestamp < b.unixTimestamp ? -1 : 1))
            .map((comment) => (
              <Comment
                key={comment.headerHash}
                comment={comment}
                agent={agents[comment.creatorAgentPubKey]}
              />
            ))}
        </div>
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
