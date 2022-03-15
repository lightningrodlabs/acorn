import { createCrudActionCreators } from '../../crudRedux'

const [[
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE
],[
  createGoalVote,
  fetchGoalVotes,
  updateGoalVote,
  deleteGoalVote,
]] = createCrudActionCreators('GOAL_VOTE')

export {
  CREATE_OUTCOME_VOTE,
  FETCH_OUTCOME_VOTES,
  UPDATE_OUTCOME_VOTE,
  DELETE_OUTCOME_VOTE,
  createGoalVote,
  fetchGoalVotes,
  updateGoalVote,
  deleteGoalVote,
}