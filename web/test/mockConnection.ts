import { WireRecord } from '../src/api/hdkCrud'
import testConnection from '../src/stories/testData/testConnection'
import { Connection } from '../src/types'

const mockConnection: WireRecord<Connection> = {
  entry: testConnection,
  actionHash: 'testActionHash',
  entryHash: 'testEntryHash',
  createdAt: 1234,
  updatedAt: 1234,
}

export default mockConnection
