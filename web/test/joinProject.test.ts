import { installProject } from '../src/projects/installProject'
import { internalJoinProject } from '../src/projects/joinProject'

let passphrase: string
let dispatch: any
let iInstallProject: typeof installProject
let mockCellIdString: string

beforeEach(() => {
  passphrase = 'testPassphrase'
  mockCellIdString =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  dispatch = jest.fn()
  iInstallProject = jest.fn().mockResolvedValue({cellIdString: mockCellIdString})
})

describe('joinProject()', () => {
  it('installs project and dispatches appropriate action', async () => {
    await internalJoinProject(passphrase, dispatch, iInstallProject)

    expect(iInstallProject).toHaveBeenCalledTimes(1)
    expect(iInstallProject).toHaveBeenCalledWith(passphrase)

    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith({
      type: 'JOIN_PROJECT_CELL_ID',
      payload: mockCellIdString,
    })
  })
})
