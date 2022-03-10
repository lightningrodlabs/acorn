import { PROJECTS_ZOME_NAME } from '../../../../holochainConfig'
import { createCrudActionCreators } from '../../crudRedux'

const [[
  CREATE_OUTCOME_COMMENT,
  FETCH_OUTCOME_COMMENTS,
  UPDATE_OUTCOME_COMMENT,
  DELETE_OUTCOME_COMMENT
],[
  createOutcomeComment,
  fetchOutcomeComments,
  updateOutcomeComment,
  deleteOutcomeComment
]] = createCrudActionCreators('OUTCOME_COMMENT')

export {
  CREATE_OUTCOME_COMMENT,
  FETCH_OUTCOME_COMMENTS,
  UPDATE_OUTCOME_COMMENT,
  DELETE_OUTCOME_COMMENT,
  createOutcomeComment,
  fetchOutcomeComments,
  updateOutcomeComment,
  deleteOutcomeComment
}