import { installProject } from '../src/projects/installProject'
import { internalJoinProject } from '../src/projects/joinProject'
import mockWhoami from './mockWhoami'

let passphrase: string
let dispatch: any
let iInstallProject: typeof installProject
let iFetchProjectProfiles: jest.Mock
let mockCellIdString: string
const peerProfile = {
  ...mockWhoami.entry,
  agentPubKey: 'uhCAkPeerAgentPubKey',
  firstName: 'Peer',
}

beforeEach(() => {
  passphrase = 'testPassphrase'
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  dispatch = jest.fn()
  iInstallProject = jest
    .fn()
    .mockResolvedValue({ cellIdString: mockCellIdString, whoami: mockWhoami })
  iFetchProjectProfiles = jest.fn().mockResolvedValue([peerProfile])
})

describe('joinProject()', () => {
  it('installs the project, loads its members profiles, and dispatches appropriate actions', async () => {
    await internalJoinProject(
      passphrase,
      dispatch,
      iInstallProject,
      iFetchProjectProfiles
    )

    expect(iInstallProject).toHaveBeenCalledTimes(1)
    expect(iInstallProject).toHaveBeenCalledWith(passphrase)
    expect(iFetchProjectProfiles).toHaveBeenCalledTimes(1)
    expect(iFetchProjectProfiles).toHaveBeenCalledWith(mockCellIdString)

    expect(dispatch).toHaveBeenCalledTimes(4)
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: 'JOIN_PROJECT_CELL_ID',
      payload: mockCellIdString,
    })
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: 'SET_PROJECT_WHOAMI',
      payload: {
        cellIdString: mockCellIdString,
        whoami: mockWhoami,
      },
    })
    // the profiles of the members already in the project, so that anything
    // showing who is doing what (e.g. who is editing a card) can find them
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      type: 'FETCH_PROJECT_PROFILES',
      payload: {
        cellIdString: mockCellIdString,
        profiles: [peerProfile],
      },
    })
    // our own profile last, so it is present even if the fetch missed it
    expect(dispatch).toHaveBeenNthCalledWith(4, {
      type: 'SET_PROJECT_MEMBER_PROFILE',
      payload: {
        cellIdString: mockCellIdString,
        profile: mockWhoami.entry,
      },
    })
  })

  it('still joins when loading the members profiles fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    iFetchProjectProfiles = jest.fn().mockRejectedValue(new Error('offline'))

    await expect(
      internalJoinProject(
        passphrase,
        dispatch,
        iInstallProject,
        iFetchProjectProfiles
      )
    ).resolves.toBe(mockCellIdString)

    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      'JOIN_PROJECT_CELL_ID',
      'SET_PROJECT_WHOAMI',
      'SET_PROJECT_MEMBER_PROFILE',
    ])
    consoleError.mockRestore()
  })
})
