import { WireRecord } from '../src/api/hdkCrud'
import { testBigAchievedOutcome } from '../src/stories/testData/testOutcomes'
import { Outcome } from '../src/types'

const mockOutcome: WireRecord<Outcome> = {
  entry: testBigAchievedOutcome,
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  createdAt: 1234,
  updatedAt: 1234,
}

export default mockOutcome
