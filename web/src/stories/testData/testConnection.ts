import { Connection } from '../../types'
import { WithActionHash } from '../../types/shared'

const testConnection: WithActionHash<Connection> = {
  parentActionHash: 'testConnectionParentActionHash',
  childActionHash: 'testConnectionChildActionHash',
  randomizer: 1234, //i64,
  isImported: false,
  actionHash: 'testConnectionActionHash',
}

export default testConnection
