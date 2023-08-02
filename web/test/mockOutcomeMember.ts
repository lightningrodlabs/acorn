import { WireRecord } from '../src/api/hdkCrud'
import testOutcomeMember from '../src/stories/testData/testOutcomeMember'
import { OutcomeMember } from '../src/types'

const mockOutcomeMember: WireRecord<OutcomeMember> = {
  entry: testOutcomeMember,
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  createdAt: 1234,
  updatedAt: 1234,
}

export default mockOutcomeMember
