import { selectGoal } from '../selection/actions'
import { createGoal } from '../projects/goals/actions'
import { createGoalMember } from '../projects/goal-members/actions'
import moment from 'moment'

export default function cloneGoals(store) {
  const state = store.getState()
  const {
    ui: { activeProject },
  } = state
  const goalsToClone = state.ui.goalClone.goals
  const goals = state.projects.goals[activeProject]
  const goalMembers = state.projects.goalMembers[activeProject]

  goalsToClone.forEach(value => {
    let members = []
    Object.values(goalMembers).map(_value => {
      _value.goal_address === value ? members.push(_value) : null
    })

    store
      .dispatch(
        createGoal.create({
          cellIdString: activeProject,
          payload: {
            ...goals[value],
            timestamp_created: moment().unix(),
          },
        })
      )
      .then(value => {
        let newGoalAddress = value.goal.headerHash
        store.dispatch(selectGoal(value.goal.headerHash))
        members.map(member => {
          store.dispatch(
            createGoalMember.create({
              cellIdString: activeProject,
              payload: {
                goal_address: newGoalAddress,
                agent_address: member.agent_address,
                user_edit_hash: member.user_edit_hash,
                unix_timestamp: moment().unix(),
                is_imported: false
              },
            })
          )
        })
      })
  })
}
