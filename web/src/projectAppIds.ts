import { AppStatusFilter, CellType } from '@holochain/client'
import _ from 'lodash'
import { getAppWs, getAdminWs } from './hcWebsockets'
import { PROJECT_APP_PREFIX } from './holochainConfig'
import { cellIdToString } from './utils'

export async function getAllApps() {
  const adminWs = await getAdminWs()
  const appIds = await adminWs.listApps({})

  // this function assumes a one-dna-per-app
  // which could become wrong at some point
  const appProjects = appIds.filter(appInfo => {
    return AppStatusFilter.Running in appInfo.status
  }).map((appInfo) => {
    const cellInfo = Object.values(appInfo.cell_info)[0][0]
    const cellId =
      CellType.Provisioned in cellInfo
        ? cellInfo[CellType.Provisioned].cell_id
        : undefined

    return {
      ...appInfo,
      cellIdString: cellIdToString(cellId),
    }
  })
  return _.keyBy(appProjects, 'installed_app_id')
}

export async function getProjectCellIdStrings() {
  const allApps = await getAllApps()
  return Object.keys(allApps)
    .filter((appId) => appId.startsWith(PROJECT_APP_PREFIX))
    .map((appId) => allApps[appId].cellIdString)
}
