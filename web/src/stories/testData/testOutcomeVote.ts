import { OutcomeVote } from '../../types'
import { WithActionHash } from '../../types/shared'

const testOutcomeVote: WithActionHash<OutcomeVote> = {
  outcomeActionHash: 'testOutcomeActionHash',
  urgency: 1,
  importance: 1,
  impact: 1,
  effort: 1,
  creatorAgentPubKey: 'testCreatorAgentPubKey',
  unixTimestamp: 1234,
  isImported: false,
  actionHash: 'testOutcomeVoteActionHash',
}

export default testOutcomeVote
