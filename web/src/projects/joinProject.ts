import { AppClient, CellId } from '@holochain/client'
import { installProject } from './installProject'
import { PROJECTS_ZOME_NAME } from '../holochainConfig'
import { joinProjectCellId } from '../redux/persistent/cells/actions'
import { CellIdString } from '../types/shared'
import { fetchProjectProfiles, setProjectMemberProfile, setProjectWhoami } from '../redux/persistent/projects/members/actions'
import { Profile } from '../types'
import { fetchProjectProfilesFromCell } from './fetchProjectProfilesFromCell'
import { fetchMyLocalProfile } from '../utils'

export async function internalJoinProject(
  passphrase: string,
  dispatch: any,
  iInstallProject: typeof installProject,
  iFetchProjectProfiles: (cellIdString: CellIdString) => Promise<Profile[]>
) {
  const { cellIdString, whoami } = await iInstallProject(passphrase)
  // this will trigger the fetching of project meta
  // checks and other things
  dispatch(joinProjectCellId(cellIdString))
  dispatch(setProjectWhoami(cellIdString, whoami));
  // the members who were here before us: without their profiles, anything that
  // shows who is doing what (who is editing a card, who is present) has no one
  // to show until the next startup
  try {
    dispatch(fetchProjectProfiles(cellIdString, await iFetchProjectProfiles(cellIdString)))
  } catch (e) {
    console.error('Could not fetch the profiles of the joined project', e)
  }
  dispatch(setProjectMemberProfile(cellIdString, whoami ? whoami.entry : await fetchMyLocalProfile()));
  return cellIdString
}

export async function joinProject(
  passphrase: string,
  dispatch: any
): Promise<CellIdString> {
  return internalJoinProject(
    passphrase,
    dispatch,
    installProject,
    fetchProjectProfilesFromCell
  )
}

export function triggerJoinSignal(cellId: CellId, appWs: AppClient) {
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
      },
      50000
    )
    .then(() => console.log('succesfully triggered init_signal'))
    .catch((e) => console.error('failed while triggering init_signal: ', e))
}
