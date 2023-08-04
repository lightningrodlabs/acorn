import { WireRecord } from '../src/api/hdkCrud'
import testTags from '../src/stories/testData/testTags'
import { Tag } from '../src/types'

const mockTag: WireRecord<Tag> = {
  entry: testTags[0],
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  createdAt: 1234,
  updatedAt: 1234,
}

export default mockTag
