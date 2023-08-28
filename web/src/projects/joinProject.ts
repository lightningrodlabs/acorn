import { AppWebsocket, CellId } from '@holochain/client'
import { installProject } from './installProject'
import { PROJECTS_ZOME_NAME } from '../holochainConfig'
import { getAgentPubKey } from '../hcWebsockets'
import { joinProjectCellId } from '../redux/persistent/cells/actions'
import { CellIdString } from '../types/shared'

export async function internalJoinProject(
  passphrase: string,
  dispatch: any,
  iInstallProject: typeof installProject
) {
  const { cellIdString } = await iInstallProject(passphrase)
  // this will trigger the fetching of project meta
  // checks and other things
  dispatch(joinProjectCellId(cellIdString))
  return cellIdString
}

export async function joinProject(
  passphrase: string,
  dispatch: any
): Promise<CellIdString> {
  return internalJoinProject(passphrase, dispatch, installProject)
}

export function triggerJoinSignal(cellId: CellId, appWs: AppWebsocket) {
  // trigger a side effect...
  // this will let other project members know you're here
  // without 'blocking' the thread or the UX
  appWs
    .callZome(
      {
        cap_secret: null,
        cell_id: cellId,
        zome_name: PROJECTS_ZOME_NAME,
        fn_name: 'init_signal',
        payload: null,
        provenance: getAgentPubKey(), // FIXME: this will need correcting after holochain changes this
      },
      50000
    )
    .then(() => console.log('succesfully triggered init_signal'))
    .catch((e) => console.error('failed while triggering init_signal: ', e))
}
