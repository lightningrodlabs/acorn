import { AdminWebsocket } from '@holochain/client'
import { removeProjectCellId } from '../redux/persistent/cells/actions'
import { CellIdString } from '../types/shared'

export async function deactivateProject(
  appId: string,
  cellId: CellIdString,
  dispatch: any,
  adminWs: AdminWebsocket
) {
  // deactivate it in holochain
  await adminWs.disableApp({
    installed_app_id: appId,
  })
  // remove it from our redux state
  dispatch(removeProjectCellId(cellId))
}
