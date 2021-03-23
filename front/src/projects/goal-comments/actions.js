import { PROJECTS_ZOME_NAME } from '../../holochainConfig'
import { createCrudActionCreators } from '../../crudRedux'

const [
  createGoalComment,
  fetchGoalComments,
  updateGoalComment,
  archiveGoalComment,
] = createCrudActionCreators(PROJECTS_ZOME_NAME, 'goal_comment')

export {
  createGoalComment,
  fetchGoalComments,
  updateGoalComment,
  archiveGoalComment,
}