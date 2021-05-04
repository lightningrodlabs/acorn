import { cellIdToString } from 'connoropolous-hc-redux-middleware/build/main/lib/actionCreator'
import { getAppWs, getAdminWs } from './hcWebsockets'
import { PROJECT_APP_PREFIX } from './holochainConfig'

export async function getAllApps() {
  const adminWs = await getAdminWs()
  const appWs = await getAppWs()
  const appIds = await adminWs.listActiveApps()
  // this function assumes a one-dna-per-app
  // which could become wrong at some point
  console.log(appIds)
  const appProjects = await Promise.all(
    appIds.map(async installed_app_id => {
      const appInfo = await appWs.appInfo({ installed_app_id })
      return {
        ...appInfo,
        cellIdString: cellIdToString(appInfo.cell_data[0].cell_id)
      }
    })
  )
  return _.keyBy(appProjects,'installed_app_id')
}

export async function getProjectCellIdStrings() {
  const allApps = await getAllApps()
  return Object
    .keys(allApps)
    .filter(appId => appId.startsWith(PROJECT_APP_PREFIX))
    .map(appId => allApps[appId].cellIdString)
}


