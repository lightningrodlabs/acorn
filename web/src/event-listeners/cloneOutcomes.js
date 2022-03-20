import { selectOutcome } from '../redux/ephemeral/selection/actions'
import { createOutcome } from '../redux/persistent/projects/outcomes/actions'
import { createOutcomeMember } from '../redux/persistent/projects/outcome-members/actions'
import moment from 'moment'
import ProjectsZomeApi from '../api/projectsApi'
import { getAppWs } from '../hcWebsockets'
import { cellIdFromString } from '../utils'

export default async function cloneOutcomes(store) {
  const state = store.getState()
  const {
    ui: { activeProject },
  } = state
  const outcomesToClone = state.ui.outcomeClone.outcomes
  const outcomes = state.projects.outcomes[activeProject]
  const outcomeMembers = state.projects.outcomeMembers[activeProject]
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  const cellId = cellIdFromString(activeProject)

  outcomesToClone.forEach(value => {
    let members = []
    Object.values(outcomeMembers).map(_value => {
      _value.outcome_address === value ? members.push(_value) : null
    })

    // @ts-ignore
    const createdOutcome = projectsZomeApi.outcome.create(cellId, {
      ...outcomes[value],
      timestamp_created: moment().unix(),
    })
    store
      .dispatch(
        createOutcome(activeProject, createdOutcome)
      )
      .then(value => {
        let newOutcomeAddress = value.outcome.headerHash
        store.dispatch(selectOutcome(value.outcome.headerHash))
        members.map(async member => {
          // @ts-ignore
          const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
                outcome_address: newOutcomeAddress,
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
