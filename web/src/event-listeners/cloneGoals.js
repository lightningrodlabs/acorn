import { selectGoal } from '../redux/ephemeral/selection/actions'
import { createGoal } from '../redux/persistent/projects/goals/actions'
import { createGoalMember } from '../redux/persistent/projects/goal-members/actions'
import moment from 'moment'
import ProjectsZomeApi from '../api/projectsApi'
import { getAppWs } from '../hcWebsockets'

export default function cloneGoals(store) {
  const state = store.getState()
  const {
    ui: { activeProject },
  } = state
  const goalsToClone = state.ui.goalClone.goals
  const goals = state.projects.goals[activeProject]
  const goalMembers = state.projects.goalMembers[activeProject]
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  // TODO: convert active project to cellId buffer

  goalsToClone.forEach(value => {
    let members = []
    Object.values(goalMembers).map(_value => {
      _value.goal_address === value ? members.push(_value) : null
    })

    const createdOutcome = projectsZomeApi.outcome.create(cellId, {
      ...goals[value],
      timestamp_created: moment().unix(),
    })
    store
      .dispatch(
        createGoal(activeProject, createdOutcome)
      )
      .then(value => {
        let newGoalAddress = value.goal.headerHash
        store.dispatch(selectGoal(value.goal.headerHash))
        members.map(member => {
          const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
                goal_address: newGoalAddress,
                agent_address: member.agent_address,
                user_edit_hash: member.user_edit_hash,
                unix_timestamp: moment().unix(),
                is_imported: false
              })
          store.dispatch(
            createGoalMember(activeProject, createdOutcomeMember)
          )
        })
      })
  })
}
