import { WireRecord } from '../src/api/hdkCrud'
import { OutcomeComment } from '../src/types'

const mockOutcomeComment: WireRecord<OutcomeComment> = {
  entry: {
    outcomeActionHash: 'testOutcomeActionHash',
    content: 'testContent',
    creatorAgentPubKey: 'testAgentAddress',
    unixTimestamp: 1234,
    isImported: false,
  },
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  createdAt: 1234,
  updatedAt: 1234,
}

export default mockOutcomeComment
