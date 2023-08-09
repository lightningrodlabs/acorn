import {
  internalExportProjectsData,
  updateProjectMeta as iUpdateProjectMeta,
  collectExportProjectData as iCollectExportProjectData,
} from '../src/migrating/export'
import mockBaseRootState, { mockPopulatedState } from './mockRootState'
import iConstructProjectDataFetchers from '../src/api/projectDataFetchers'
import mockProjectData from './mockProjectData'

let projectDataFetchers: ReturnType<typeof constructProjectDataFetchers>
let baseRootState: typeof mockBaseRootState
let getState: typeof store.getState

let constructProjectDataFetchers: typeof iConstructProjectDataFetchers
let updateProjectMeta: typeof iUpdateProjectMeta
let collectExportProjectData: typeof iCollectExportProjectData
let store: any
let toVersion: string
let onStep: Parameters<typeof internalExportProjectsData>[5]
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

    baseRootState = mockBaseRootState

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

    onStep = jest.fn()
    toVersion = 'test'
  })

  it('should return null when state.whoami is undefined', async () => {
    getState = jest.fn().mockReturnValue({
      ...baseRootState,
      whoami: undefined,
    })
    store.getState = getState

    const result = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      updateProjectMeta,
      store,
      toVersion,
      onStep,
      integrityVersion
    )

    expect(result).toBeNull()
  })

  it('should return projects data when state.whoami is defined', async () => {
    const result = await internalExportProjectsData(
      constructProjectDataFetchers,
      collectExportProjectData,
      updateProjectMeta,
      store,
      toVersion,
      onStep,
      integrityVersion
    )

    expect(result.myProfile).toEqual(baseRootState.whoami.entry)
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
