import { EntryPoint } from '../../types'
import { WithActionHash } from '../../types/shared'

const testEntryPoint: WithActionHash<EntryPoint> = {
  color: '#000000',
  creatorAgentPubKey: 'testCreatorAgentPubKey',
  createdAt: 1234,
  outcomeActionHash: 'testOutcomeActionHash',
  isImported: false,
  actionHash: 'testEntryPointActionHash',
}

export default testEntryPoint
