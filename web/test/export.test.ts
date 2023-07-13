import { WireRecord } from '../src/api/hdkCrud'
import { internalExportProjectsData } from '../src/migrating/export'
import { Profile } from '../src/types'

describe('test export functionality', () => {
  let whoami: WireRecord<Profile>

  beforeEach(() => {
    whoami = {
      actionHash: 'testActionHash',
      entryHash: 'testEntryHash',
      createdAt: 1234, // nanoseconds
      updatedAt: 1234, // nanoseconds
      entry: {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        handle: 'testHandle',
        status: 'Online',
        avatarUrl: 'testAvatarUrl',
        agentPubKey: 'testAgentPubKey',
        isImported: false,
      },
    }
  })
  it('should return projects data', async () => {
    const constructProjectDataFetchers = jest.fn()
    const collectExportProjectData = jest.fn()
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({ whoami }),
    }
    const toVersion = 'test'
    const onStep = jest.fn()

    const result = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      store,
      toVersion,
      onStep
    )

    expect(onStep).toHaveBeenCalled()
  })
})
