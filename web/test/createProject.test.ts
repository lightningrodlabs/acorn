import ProjectsZomeApi from '../src/api/projectsApi'
import {
  finalizeCreateProject,
  internalCreateProject,
} from '../src/projects/createProject'
import { installProject } from '../src/projects/installProject'
import mockUnmigratedProjectMeta from './mockProjectMeta'

let dispatch: any
let mockCellIdString: string
let mockAgentAddress: string
let mockPassphrase: string
let projectsZomeApi: ProjectsZomeApi
let _installProject: typeof installProject
let _finalizeCreateProject: typeof finalizeCreateProject

beforeEach(() => {
  dispatch = jest.fn()
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'
  mockAgentAddress = 'testAgentAddress'
  mockPassphrase = 'testPassphrase'

  projectsZomeApi = {
    //@ts-ignore
    projectMeta: {
      simpleCreateProjectMeta: jest
        .fn()
        .mockResolvedValue(mockUnmigratedProjectMeta),
    },
  }

  _installProject = jest.fn().mockResolvedValue([mockCellIdString])
  _finalizeCreateProject = jest.fn()
})

describe('finalizeCreateProject()', () => {
  it('should dispatch actions', async () => {
    await finalizeCreateProject(
      mockCellIdString,
      mockUnmigratedProjectMeta.entry,
      mockAgentAddress,
      dispatch,
      projectsZomeApi
    )

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: 'SIMPLE_CREATE_PROJECT_META',
      payload: mockUnmigratedProjectMeta,
      meta: { cellIdString: mockCellIdString },
    })

    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: 'SET_MEMBER',
      payload: {
        cellIdString: mockCellIdString,
        member: {
          agentPubKey: 'testAgentAddress',
        },
      },
    })
  })
})

describe('internalCreateProject()', () => {
  it('should install project and finalize creation of the project', async () => {
    const result = await internalCreateProject(
      mockPassphrase,
      mockUnmigratedProjectMeta.entry,
      mockAgentAddress,
      dispatch,
      _installProject,
      _finalizeCreateProject,
      projectsZomeApi
    )

    expect(result).toEqual(mockCellIdString)

    expect(_installProject).toHaveBeenCalledTimes(1)
    expect(_installProject).toHaveBeenCalledWith(mockPassphrase)

    expect(_finalizeCreateProject).toHaveBeenCalledTimes(1)
    expect(_finalizeCreateProject).toHaveBeenCalledWith(
      mockCellIdString,
      mockUnmigratedProjectMeta.entry,
      mockAgentAddress,
      dispatch,
      projectsZomeApi
    )
  })
})
