import { AdminWebsocket } from '@holochain/client'
import { getAgentPubKey } from '../src/hcWebsockets'
import { internalInstallProject } from '../src/projects/installProject'
import { cellIdFromString, cellIdToString } from '../src/utils'
import { passphraseToUid } from '../src/secrets'

let mockPassphrase: string
let mockAgentPubKey: string
let adminWs: AdminWebsocket
let iGetAgentPubKey: typeof getAgentPubKey
let mockHappPath: string
let mockCellIdString: string
const regex = /acorn-project-\d{6}-\w+/

beforeEach(() => {
  mockPassphrase = 'testPassphrase'
  mockAgentPubKey = 'testAgentPubKey'
  mockHappPath = './happ/workdir/projects/projects.happ'
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  //@ts-ignore
  adminWs = {
    installApp: jest.fn().mockResolvedValue({
      cell_info: {
        testRoleName: [
          {
            provisioned: {
              name: 'testCellInfo',
              cell_id: cellIdFromString(mockCellIdString),
              dna_modifiers: {},
            },
          },
        ],
      },
    }),
    enableApp: jest.fn(),
    authorizeSigningCredentials: jest.fn(),
  }

  iGetAgentPubKey = jest.fn().mockReturnValueOnce(mockAgentPubKey)
})

describe('installProject()', () => {
  it('installs and enables the project', async () => {
    const result = await internalInstallProject(
      mockPassphrase,
      adminWs,
      iGetAgentPubKey
    )

    expect(result.cellIdString).toEqual(
      mockCellIdString
    )
    expect(result.cellId).toEqual(cellIdFromString(mockCellIdString))
    expect(result.appId).toMatch(regex)

    expect(adminWs.installApp).toHaveBeenCalledTimes(1)
    expect(adminWs.installApp).toHaveBeenNthCalledWith(1, {
      agent_key: mockAgentPubKey,
      installed_app_id: expect.stringMatching(regex),
      membrane_proofs: {},
      path: mockHappPath,
      network_seed: passphraseToUid(mockPassphrase),
    })

    expect(adminWs.enableApp).toHaveBeenCalledTimes(1)
    expect(adminWs.enableApp).toHaveBeenNthCalledWith(1, {
      installed_app_id: expect.stringMatching(regex),
    })

    expect(adminWs.authorizeSigningCredentials).toHaveBeenCalledTimes(1)
    expect(adminWs.authorizeSigningCredentials).toHaveBeenNthCalledWith(
      1,
      cellIdFromString(mockCellIdString)
    )
  })

  it('throws error when agent_key is undefined', async () => {
    iGetAgentPubKey = jest.fn().mockReturnValue(undefined)
    try {
      await internalInstallProject(mockPassphrase, adminWs, iGetAgentPubKey)
    } catch (e) {
      expect(e.message).toEqual(
        'Cannot install a new project because no AgentPubKey is known locally'
      )
    }

    expect(iGetAgentPubKey).toHaveBeenCalledTimes(1)
    expect(iGetAgentPubKey).toHaveReturnedWith(undefined)
  })
})
