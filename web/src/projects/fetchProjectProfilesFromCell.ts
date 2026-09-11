import ProfilesZomeApi from '../api/profilesApi'
import { getAppWs } from '../hcWebsockets'
import { Profile } from '../types'
import { CellIdString } from '../types/shared'
import { cellIdFromString } from '../utils'

/**
 * The profiles of a project's members, read from the project cell -- the same
 * source startup uses, so members using Acorn Desktop are included too.
 */
export async function fetchProjectProfilesFromCell(
  cellIdString: CellIdString
): Promise<Profile[]> {
  const appWs = await getAppWs()
  const profilesZomeApi = new ProfilesZomeApi(appWs, cellIdFromString(cellIdString))
  return profilesZomeApi.profile.fetchAgents()
}
