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

  outcomesToClone.forEach(async (value) => {
    let members = []
    Object.values(outcomeMembers).map(_value => {
      _value.outcomeActionHash === value ? members.push(_value) : null
    })

    const createdOutcome = await projectsZomeApi.outcome.create(cellId, {
      ...outcomes[value],
      timestampCreated: moment().unix(),
    })
    store
      .dispatch(
        createOutcome(activeProject, createdOutcome)
      )
      .then(value => {
        let newOutcomeAddress = value.outcome.actionHash
        store.dispatch(selectOutcome(value.outcome.actionHash))
        members.map(async member => {
          const createdOutcomeMember = await projectsZomeApi.outcomeMember.create(cellId, {
                outcomeActionHash: newOutcomeAddress,
                memberAgentPubKey: member.memberAgentPubKey,
                creatorAgentPubKey: member.creatorAgentPubKey,
                unixTimestamp: moment().unix(),
                isImported: false
              })
          store.dispatch(
            createOutcomeMember(activeProject, createdOutcomeMember)
          )
        })
      })
  })
}
