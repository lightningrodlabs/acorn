import { AppClient } from '@holochain/client'
import { removeProjectCellId } from '../redux/persistent/cells/actions'
import { CellIdString } from '../types/shared'
import { cellIdFromString } from '../utils'

export async function uninstallProject(
  cellId: CellIdString,
  dispatch: any,
  appWs: AppClient
) {
  await appWs.disableCloneCell({
    clone_cell_id: { type: 'dna_hash', value: cellIdFromString(cellId)[0] },
  })
  // remove it from our redux state
  dispatch(removeProjectCellId(cellId))
}
