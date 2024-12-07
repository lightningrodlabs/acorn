import { AppStatusFilter, CellType } from '@holochain/client'
import _ from 'lodash'
import { getAppWs, getAdminWs } from './hcWebsockets'
import { PROJECT_APP_PREFIX, PROJECTS_ROLE_NAME } from './holochainConfig'
import { cellIdToString } from './utils'

export async function getProjectCellIdStrings() {
  const appWs = await getAppWs()
  const appInfo = await appWs.appInfo()

  // get only the enabled cloned cells
  const clonedProjectCells = appInfo.cell_info[PROJECTS_ROLE_NAME].filter(
    (cellInfo) =>
      CellType.Cloned in cellInfo && cellInfo[CellType.Cloned].enabled
  )
  return clonedProjectCells.map((cellInfo) =>
    cellIdToString(cellInfo[CellType.Cloned].cell_id)
  )
}
