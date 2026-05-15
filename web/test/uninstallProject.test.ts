import { AppClient } from '@holochain/client'
import { CellIdString } from '../src/types/shared'
import { uninstallProject } from '../src/projects/uninstallProject'
import { cellIdFromString } from '../src/utils'

let mockAppWs: AppClient
let mockCellId: CellIdString
let dispatch: any
let removeProjectCellIdAction: { type: string; payload: string }

beforeEach(() => {
  // @ts-ignore
  mockAppWs = {
    disableCloneCell: jest.fn(),
  }

  mockCellId =
    '132,45,36,204,129,221,8,19,206,244,229,30,210,95,157,234,241,47,13,85,105,207,55,138,160,87,204,162,244,122,186,195,125,254,5,185,165,224,66[:cell_id_divider:]132,32,36,97,138,27,24,136,8,80,164,189,194,243,82,224,72,205,215,225,2,27,126,146,190,40,102,187,244,75,191,172,155,196,247,226,220,92,1'

  dispatch = jest.fn()

  removeProjectCellIdAction = {
    type: 'REMOVE_PROJECT_CELL_ID',
    payload: mockCellId,
  }
})

describe('uninstallProject()', () => {
  it('should disable the clone cell in holochain and purge project from redux', async () => {
    await uninstallProject(mockCellId, dispatch, mockAppWs)

    expect(mockAppWs.disableCloneCell).toHaveBeenCalledTimes(1)
    expect(mockAppWs.disableCloneCell).toHaveBeenCalledWith({
      clone_cell_id: {
        type: 'dna_hash',
        value: cellIdFromString(mockCellId)[0],
      },
    })

    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(removeProjectCellIdAction)
  })
})
