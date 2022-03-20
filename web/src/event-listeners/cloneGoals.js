import { selectGoal } from '../redux/ephemeral/selection/actions'
import { createOutcome } from '../redux/persistent/projects/goals/actions'
import { createOutcomeMember } from '../redux/persistent/projects/goal-members/actions'
import moment from 'moment'
import ProjectsZomeApi from '../api/projectsApi'
import { getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'

export default async function cloneGoals(store) {
  const state = store.getState()
  const {
    ui: { activeProject },
  } = state
  const goalsToClone = state.ui.goalClone.goals
  const goals = state.projects.goals[activeProject]
  const goalMembers = state.projects.goalMembers[activeProject]
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  const cellId = cellIdFromString(activeProject)

  goalsToClone.forEach(value => {
    let members = []
    Object.values(goalMembers).map(_value => {
      _value.goal_address === value ? members.push(_value) : null
    })

    // @ts-ignore
    const createdOutcome = projectsZomeApi.outcome.create(cellId, {
      ...goals[value],
      timestamp_created: moment().unix(),
    })
    store
      .dispatch(
        createOutcome(activeProject, createdOutcome)
      )
      .then(value => {
        let newGoalAddress = value.goal.headerHash
        store.dispatch(selectGoal(value.goal.headerHash))
        members.map(async member => {
          // @ts-ignore
          const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
                goal_address: newGoalAddress,
                agent_address: member.agent_address,
                user_edit_hash: member.user_edit_hash,
                unix_timestamp: moment().unix(),
                is_imported: false
              })
          store.dispatch(
            createOutcomeMember(activeProject, createdOutcomeMember)
          )
        })
      })
  })
}
