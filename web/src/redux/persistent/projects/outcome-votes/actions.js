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
]] = createCrudActionCreators('OUTCOME_VOTE')

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