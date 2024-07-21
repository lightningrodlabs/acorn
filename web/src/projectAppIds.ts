import { AppStatusFilter, CellType } from '@holochain/client'
import _ from 'lodash'
import { getAppWs, getAdminWs } from './hcWebsockets'
import { PROJECT_APP_PREFIX } from './holochainConfig'
import { cellIdToString } from './utils'

export async function getProjectCellIdStrings() {
  const appWs = await getAppWs()
  const appInfo = await appWs.appInfo()
  const clonedProjectCells = appInfo.cell_info['projects'].filter(
    (cellInfo) => CellType.Cloned in cellInfo
  )
  return clonedProjectCells.map((cellInfo) =>
    cellIdToString(cellInfo[CellType.Cloned].cell_id)
  )
}
