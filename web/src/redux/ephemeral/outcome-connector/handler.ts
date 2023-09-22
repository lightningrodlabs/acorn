import { resetOutcomeConnector } from './actions'
import {
  createConnection,
  deleteConnection,
} from '../../persistent/projects/connections/actions'
import ProjectsZomeApi from '../../../api/projectsApi'
import { getAppWs } from '../../../hcWebsockets'
import { cellIdFromString } from '../../../utils'
import { ActionHashB64 } from '@holochain/client'
import { LinkedOutcomeDetails, RelationInput } from '../../../types'
import { CellIdString, Option } from '../../../types/shared'

export default async function handleConnectionConnectMouseUp(
  maybeLinkedOutcome: Option<LinkedOutcomeDetails>,
  toAddress: ActionHashB64,
  existingParentConnectionAddress: ActionHashB64,
  activeProject: CellIdString,
  dispatch: any
) {
  const cellId = cellIdFromString(activeProject)
  const appWebsocket = await getAppWs()
  const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
  if (maybeLinkedOutcome && toAddress) {
    // if we are replacing a Connection with this one
    // delete the existing Connection first
    if (existingParentConnectionAddress) {
      // don't trigger TRIGGER_LAYOUT_UPDATE here
      // because we will only be archiving
      // a Connection here in the context of immediately replacing
      // it with another
      await projectsZomeApi.connection.delete(
        cellId,
        existingParentConnectionAddress
      )
      dispatch(deleteConnection(activeProject, existingParentConnectionAddress))
    }

    const fromAsParent =
      maybeLinkedOutcome.relation === RelationInput.ExistingOutcomeAsParent
    const createdConnection = await projectsZomeApi.connection.create(cellId, {
      parentActionHash: fromAsParent
        ? maybeLinkedOutcome.outcomeActionHash
        : toAddress,
      childActionHash: fromAsParent
        ? toAddress
        : maybeLinkedOutcome.outcomeActionHash,
      siblingOrder: maybeLinkedOutcome.siblingOrder,
      randomizer: Date.now(),
      isImported: false,
    })
    const createConnectionAction = createConnection(
      activeProject,
      createdConnection
    )
    dispatch(createConnectionAction)
  }
  dispatch(resetOutcomeConnector())
}
