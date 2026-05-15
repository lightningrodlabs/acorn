import { AppClient } from '@holochain/client'
import {
  internalExportProjectsData,
  updateProjectMeta as iUpdateProjectMeta,
  collectExportProjectData as iCollectExportProjectData,
} from '../src/migrating/export'
import mockBaseRootState, { mockPopulatedState } from './mockRootState'
import iConstructProjectDataFetchers from '../src/api/projectDataFetchers'
import mockProjectData from './mockProjectData'
import mockWhoami from './mockWhoami'

let projectDataFetchers: ReturnType<typeof constructProjectDataFetchers>
let baseRootState: typeof mockBaseRootState & { myLocalProfile: any }
let getState: typeof store.getState

let constructProjectDataFetchers: typeof iConstructProjectDataFetchers
let updateProjectMeta: typeof iUpdateProjectMeta
let collectExportProjectData: typeof iCollectExportProjectData
let store: any
let appWebsocket: AppClient
let toVersion: string
let onStep: Parameters<typeof internalExportProjectsData>[6]
let integrityVersion: number

describe('test export functionality', () => {
  beforeEach(() => {
    integrityVersion = 1

    projectDataFetchers = {
      fetchProjectMeta: jest.fn(),
      fetchEntryPoints: jest.fn(),
      fetchOutcomeComments: jest.fn(),
      fetchOutcomeMembers: jest.fn(),
      fetchTags: jest.fn(),
      fetchOutcomes: jest.fn(),
      fetchConnections: jest.fn(),
      // fetchMembers: jest.fn(), // including this line will cause the test to fail, but satisfies the type
    } as any // this is needed because the real implementation does not inclue fetchMembers()

    // the export flow reads the current user's profile from state.myLocalProfile
    baseRootState = { ...mockBaseRootState, myLocalProfile: mockWhoami.entry }

    getState = jest
      .fn()
      .mockReturnValueOnce(baseRootState)
      .mockReturnValueOnce(mockPopulatedState)

    constructProjectDataFetchers = jest
      .fn()
      .mockReturnValue(projectDataFetchers)

    updateProjectMeta = jest.fn()

    collectExportProjectData = jest.fn().mockReturnValue(mockProjectData)
    store = {
      dispatch: jest.fn(),
      getState: getState,
    }

    // @ts-ignore
    appWebsocket = {}

    onStep = jest.fn()
    toVersion = 'test'
  })

  it('should return null when state.myLocalProfile is undefined', async () => {
    getState = jest.fn().mockReturnValue({
      ...baseRootState,
      myLocalProfile: undefined,
    })
    store.getState = getState

    const result = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      updateProjectMeta,
      appWebsocket,
      store,
      toVersion,
      onStep,
      integrityVersion
    )

    expect(result).toBeNull()
  })

  it('should return projects data when state.myLocalProfile is defined', async () => {
    const result = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      updateProjectMeta,
      appWebsocket,
      store,
      toVersion,
      onStep,
      integrityVersion
    )

    expect(result.myProfile).toEqual(baseRootState.myLocalProfile)
    expect(result.projects).toEqual([mockProjectData])

    const numProjects = result.projects.length

    expect(store.getState).toHaveBeenCalledTimes(numProjects + 1)

    expect(constructProjectDataFetchers).toHaveBeenCalledTimes(numProjects)
    expect(constructProjectDataFetchers).toHaveBeenCalledWith(
      store.dispatch,
      baseRootState.cells.projects[0]
    )

    expect(collectExportProjectData).toHaveBeenCalledTimes(numProjects)
    expect(collectExportProjectData).toHaveBeenCalledWith(
      mockPopulatedState,
      baseRootState.cells.projects[0]
    )

    expect(updateProjectMeta).toHaveBeenCalledTimes(numProjects)
    expect(updateProjectMeta).toHaveBeenCalledWith(
      appWebsocket,
      {
        ...mockProjectData.projectMeta,
        actionHash: undefined, // need to remove actionHash to make the type the same
        isMigrated: toVersion,
      },
      mockProjectData.projectMeta.actionHash,
      baseRootState.cells.projects[0]
    )

    expect(onStep).toHaveBeenCalledTimes(numProjects)

    Object.keys(projectDataFetchers).forEach((key) => {
      expect(projectDataFetchers[key]).toHaveBeenCalledTimes(numProjects)
    })
  })
})
