import { AppClient } from '@holochain/client'
import { getAgentPubKey } from '../src/hcWebsockets'
import { internalInstallProject } from '../src/projects/installProject'
import { cellIdFromString } from '../src/utils'
import { writeMyLocalProfile } from '../src/utils'
import { passphraseToUid } from '../src/secrets'
import { PROJECTS_ROLE_NAME } from '../src/holochainConfig'
import mockWhoami from './mockWhoami'

let mockPassphrase: string
let mockAgentPubKey: string
let appWs: AppClient
let iGetAgentPubKey: typeof getAgentPubKey
let mockCellIdString: string

beforeEach(() => {
  localStorage.clear()
  mockPassphrase = 'testPassphrase'
  mockAgentPubKey = 'testAgentPubKey'
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  // installProject requires a local profile to exist before cloning the cell
  writeMyLocalProfile(mockWhoami.entry)

  //@ts-ignore
  appWs = {
    createCloneCell: jest.fn().mockResolvedValue({
      cell_id: cellIdFromString(mockCellIdString),
    }),
    callZome: jest.fn().mockResolvedValue(mockWhoami),
  }

  iGetAgentPubKey = jest.fn().mockReturnValueOnce(mockAgentPubKey)
})

describe('installProject()', () => {
  it('clones the project cell and creates a whoami', async () => {
    const result = await internalInstallProject(
      mockPassphrase,
      appWs,
      iGetAgentPubKey
    )

    expect(result.cellIdString).toEqual(mockCellIdString)
    expect(result.cellId).toEqual(cellIdFromString(mockCellIdString))
    expect(result.whoami).toEqual(mockWhoami)

    expect(appWs.createCloneCell).toHaveBeenCalledTimes(1)
    expect(appWs.createCloneCell).toHaveBeenCalledWith({
      role_name: PROJECTS_ROLE_NAME,
      modifiers: {
        network_seed: passphraseToUid(mockPassphrase),
      },
    })

    expect(appWs.callZome).toHaveBeenCalledTimes(1)
  })

  it('throws error when agent_key is undefined', async () => {
    iGetAgentPubKey = jest.fn().mockReturnValue(undefined)
    try {
      await internalInstallProject(mockPassphrase, appWs, iGetAgentPubKey)
    } catch (e) {
      expect(e.message).toEqual(
        'Cannot install a new project because no AgentPubKey is known locally'
      )
    }

    expect(iGetAgentPubKey).toHaveBeenCalledTimes(1)
    expect(iGetAgentPubKey).toHaveReturnedWith(undefined)
  })
})
