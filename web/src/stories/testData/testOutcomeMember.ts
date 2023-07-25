import { WithActionHash } from '../../types/shared'
import { OutcomeMember } from '../../types'

const testOutcomeMember: WithActionHash<OutcomeMember> = {
  outcomeActionHash: 'testOutcomeActionHash',
  memberAgentPubKey: 'testMemberAgentPubKey',
  creatorAgentPubKey: 'testCreatorAgentPubKey',
  unixTimestamp: 1234,
  isImported: false,
  actionHash: 'testOutcomeMemberActionHash',
}

export default testOutcomeMember
