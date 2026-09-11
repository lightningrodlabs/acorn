import { fetchProjectProfiles } from '../redux/persistent/projects/members/actions'
import { Profile } from '../types'
import { CellIdString } from '../types/shared'

type ProfilesStore = {
  getState: () => any
  dispatch: (action: any) => any
}

/**
 * Makes sure a project's profiles include an agent we have just heard from.
 *
 * Profiles are loaded per project at startup, and a project created or joined
 * later starts with only our own. A peer can then reach us through a realtime
 * signal -- starting to edit a card we have open, say -- before we have their
 * profile, and anything that shows who is doing what needs it. Refetching the
 * project's profiles fills the gap. At most one fetch runs per project at a
 * time, and profiles we already had but the fetch did not return are kept.
 */
export function createEnsurePeerProfile(
  fetchProfiles: (cellIdString: CellIdString) => Promise<Profile[]>
) {
  const inFlight = new Set<CellIdString>()
  return async function ensurePeerProfile(
    store: ProfilesStore,
    cellIdString: CellIdString,
    agentPubKey: string
  ): Promise<void> {
    const known: Profile[] =
      store.getState().projects.members[cellIdString]?.profiles ?? []
    if (known.some((profile) => profile.agentPubKey === agentPubKey)) return
    if (inFlight.has(cellIdString)) return
    inFlight.add(cellIdString)
    try {
      const fetched = await fetchProfiles(cellIdString)
      const current: Profile[] =
        store.getState().projects.members[cellIdString]?.profiles ?? []
      const fetchedKeys = new Set(fetched.map((profile) => profile.agentPubKey))
      const merged = [
        ...current.filter((profile) => !fetchedKeys.has(profile.agentPubKey)),
        ...fetched,
      ]
      store.dispatch(fetchProjectProfiles(cellIdString, merged))
    } catch (e) {
      console.error('Could not fetch the profiles of project', cellIdString, e)
    } finally {
      inFlight.delete(cellIdString)
    }
  }
}
