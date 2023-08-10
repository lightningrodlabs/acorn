import { WireRecord } from '../src/api/hdkCrud'
import { EntryPoint } from '../src/types'

const mockEntryPoint: WireRecord<EntryPoint> = {
  entry: {
    color: 'testColor',
    creatorAgentPubKey: 'testAgentAddress',
    createdAt: 1234,
    outcomeActionHash: 'testOutcomeActionHash',
    isImported: false,
  },
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  createdAt: 1234,
  updatedAt: 1234,
}

export default mockEntryPoint
