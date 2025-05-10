import { CellType, ClonedCell } from '@holochain/client'
import _ from 'lodash'
import { getAppWs } from './hcWebsockets'
import { PROJECTS_ROLE_NAME } from './holochainConfig'
import { cellIdToString } from './utils'

export async function getProjectCellIdStrings() {
  const appWs = await getAppWs()
  const appInfo = await appWs.appInfo()

  // get only the enabled cloned cells
  const clonedProjectCells =
    appInfo?.cell_info[PROJECTS_ROLE_NAME].filter(
      (cellInfo) => CellType.Cloned === cellInfo.type && cellInfo.value.enabled
    ) || []
  return clonedProjectCells.map((cellInfo) =>
    cellIdToString((cellInfo.value as ClonedCell).cell_id)
  )
}
