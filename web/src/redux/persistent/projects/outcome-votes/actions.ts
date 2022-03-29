import { OutcomeVote } from '../../../../types'
import { createCrudActionCreators } from '../../crudRedux'

const [[
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE
],[
  createOutcomeVote,
  fetchOutcomeVotes,
  updateOutcomeVote,
  deleteOutcomeVote,
]] = createCrudActionCreators<OutcomeVote>('OUTCOME_VOTE')

export {
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE,
  createOutcomeVote,
  fetchOutcomeVotes,
  updateOutcomeVote,
  deleteOutcomeVote,
}