import { createEnsurePeerProfile } from '../src/projects/ensurePeerProfile'
import mockWhoami from './mockWhoami'

const CELL = 'dna[:cell_id_divider:]me'
const me = { ...mockWhoami.entry, agentPubKey: 'uhCAkMe', firstName: 'Me' }
const peer = { ...mockWhoami.entry, agentPubKey: 'uhCAkPeer', firstName: 'Peer' }

function storeWith(profiles: any[]) {
  const dispatch = jest.fn()
  return {
    dispatch,
    getState: () => ({
      projects: {
        members: { [CELL]: { members: {}, profiles, whoami: null } },
      },
    }),
  }
}

describe('ensurePeerProfile()', () => {
  it('does nothing when the peer profile is already known', async () => {
    const fetchProfiles = jest.fn()
    const ensurePeerProfile = createEnsurePeerProfile(fetchProfiles)
    const store = storeWith([me, peer])

    await ensurePeerProfile(store, CELL, peer.agentPubKey)

    expect(fetchProfiles).not.toHaveBeenCalled()
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('fetches the project profiles when the peer is unknown, keeping the ones already known', async () => {
    const fetchProfiles = jest.fn().mockResolvedValue([peer])
    const ensurePeerProfile = createEnsurePeerProfile(fetchProfiles)
    const store = storeWith([me])

    await ensurePeerProfile(store, CELL, peer.agentPubKey)

    expect(fetchProfiles).toHaveBeenCalledWith(CELL)
    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'FETCH_PROJECT_PROFILES',
      payload: { cellIdString: CELL, profiles: [me, peer] },
    })
  })

  it('prefers the fetched copy of a profile it already had', async () => {
    const updatedMe = { ...me, firstName: 'Me Again' }
    const fetchProfiles = jest.fn().mockResolvedValue([updatedMe, peer])
    const ensurePeerProfile = createEnsurePeerProfile(fetchProfiles)
    const store = storeWith([me])

    await ensurePeerProfile(store, CELL, peer.agentPubKey)

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'FETCH_PROJECT_PROFILES',
      payload: { cellIdString: CELL, profiles: [updatedMe, peer] },
    })
  })

  it('fetches at most once at a time per project', async () => {
    let resolveFetch: (profiles: any[]) => void = () => {}
    const fetchProfiles = jest.fn(
      () => new Promise<any[]>((resolve) => (resolveFetch = resolve))
    )
    const ensurePeerProfile = createEnsurePeerProfile(fetchProfiles)
    const store = storeWith([me])

    const first = ensurePeerProfile(store, CELL, peer.agentPubKey)
    const second = ensurePeerProfile(store, CELL, peer.agentPubKey)
    resolveFetch([peer])
    await Promise.all([first, second])

    expect(fetchProfiles).toHaveBeenCalledTimes(1)
  })

  it('does not throw when the fetch fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const fetchProfiles = jest.fn().mockRejectedValue(new Error('offline'))
    const ensurePeerProfile = createEnsurePeerProfile(fetchProfiles)
    const store = storeWith([me])

    await expect(
      ensurePeerProfile(store, CELL, peer.agentPubKey)
    ).resolves.toBeUndefined()
    expect(store.dispatch).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
