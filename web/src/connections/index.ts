import _ from 'lodash'
import { ActionHashB64 } from '@holochain/client'
import { RootState } from '../redux/reducer'
import { RightOrLeft, findParentsActionHashes } from '../tree-logic'
import { updateConnection } from '../redux/persistent/projects/connections/actions'
import { getAppWs } from '../hcWebsockets'
import ProjectsZomeApi from '../api/projectsApi'
import { cellIdFromString } from '../utils'

export async function alterSiblingOrder(
  store: any,
  state: RootState,
  selectedOutcome: ActionHashB64,
  targetActionHash: ActionHashB64,
  rightOrLeft: RightOrLeft
) {
  const {
    ui: { activeProject },
  } = state
  // 1. find the common parent
  const selectedOutcomeParentActionHashes = findParentsActionHashes(
    selectedOutcome,
    state
  )
  const targetOutcomeParentActionHashes = findParentsActionHashes(
    targetActionHash,
    state
  )
  const commonParentActionHashes = _.intersection(
    selectedOutcomeParentActionHashes,
    targetOutcomeParentActionHashes
  )
  if (!commonParentActionHashes.length) {
    console.log('no common parent found')
    return
  }
  const commonParentActionHash = commonParentActionHashes[0]
  const connections = state.projects.connections[activeProject] || {}
  // 2. find the Connection that connects the
  // sibling to the parent
  const targetConnection = Object.values(connections).find(
    (connection) =>
      connection.childActionHash === targetActionHash &&
      connection.parentActionHash === commonParentActionHash
  )
  // 3. find the Connection that connects the selectedOutcome
  // to the parent
  const selectedOutcomeConnection = Object.values(connections).find(
    (connection) =>
      connection.childActionHash === selectedOutcome &&
      connection.parentActionHash === commonParentActionHash
  )
  // 4. set the siblingOrder of the latter to a higher value
  // than the former
  if (targetConnection && selectedOutcomeConnection) {
    const appWs = await getAppWs()
    const projectsZomeApi = new ProjectsZomeApi(appWs)
    const cellId = cellIdFromString(activeProject)
    // left go higher, right go lower
    const directionModifier = rightOrLeft === RightOrLeft.Left ? 1 : -1
    const newSelectedSiblingOrder =
      targetConnection.siblingOrder === selectedOutcomeConnection.siblingOrder
        ? targetConnection.siblingOrder + directionModifier
        : targetConnection.siblingOrder
    const updatedSelectedConnection = await projectsZomeApi.connection.update(
      cellId,
      {
        entry: {
          ...selectedOutcomeConnection,
          siblingOrder: newSelectedSiblingOrder,
        },
        actionHash: selectedOutcomeConnection.actionHash,
      }
    )
    const updatedTargetConnection = await projectsZomeApi.connection.update(
      cellId,
      {
        entry: {
          ...targetConnection,
          siblingOrder: selectedOutcomeConnection.siblingOrder,
        },
        actionHash: targetConnection.actionHash,
      }
    )
    // we skip the layout animation on the first of the two
    // since we don't want to redundantly animate the layout
    store.dispatch(updateConnection(activeProject, updatedSelectedConnection, true))
    // we do not skip the layout animation on the second of the two
    store.dispatch(updateConnection(activeProject, updatedTargetConnection))
  } else {
    console.log('could not find connections')
  }
}
