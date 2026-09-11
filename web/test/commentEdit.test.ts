import {
  canModifyComment,
  commentWithContent,
} from '../src/components/CommentPosted/commentEdit'

const comment = {
  actionHash: 'uhCkkComment',
  outcomeActionHash: 'uhCkkOutcome',
  content: 'first draft',
  creatorAgentPubKey: 'uhCAkMe',
  unixTimestamp: 1789000000,
  isImported: false,
}

describe('canModifyComment()', () => {
  it('allows the author', () => {
    expect(canModifyComment(comment, 'uhCAkMe')).toBe(true)
  })

  it('does not allow anyone else', () => {
    expect(canModifyComment(comment, 'uhCAkSomeoneElse')).toBe(false)
  })

  it('does not allow imported comments, whose author is not an agent here', () => {
    expect(canModifyComment({ ...comment, isImported: true }, 'uhCAkMe')).toBe(
      false
    )
  })
})

describe('commentWithContent()', () => {
  it('changes only the text, keeping author, card and time, and drops the actionHash', () => {
    expect(commentWithContent(comment, 'second draft')).toEqual({
      outcomeActionHash: 'uhCkkOutcome',
      content: 'second draft',
      creatorAgentPubKey: 'uhCAkMe',
      unixTimestamp: 1789000000,
      isImported: false,
    })
  })
})
