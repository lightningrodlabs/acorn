import { AdminWebsocket } from '@holochain/client/lib/api/admin/websocket'
import { CellIdString } from '../src/types/shared'
import { deactivateProject } from '../src/projects/deactivateProject'

let mockAdminWs: AdminWebsocket
let mockAppId: string
let mockCellId: CellIdString
let dispatch: any
let removeProjectCellIdAction: { type: string; payload: string }

beforeEach(() => {
  // @ts-ignore
  mockAdminWs = {
    disableApp: jest.fn(),
  }

  mockAppId = 'testAppId'
  mockCellId = 'testCellId'

  dispatch = jest.fn()

  removeProjectCellIdAction = {
    type: 'REMOVE_PROJECT_CELL_ID',
    payload: mockCellId,
  }
})

describe('deactivateProject()', () => {
  it('should disable project in holochain and purge project from redux', async () => {
    await deactivateProject(mockAppId, mockCellId, dispatch, mockAdminWs)

    expect(mockAdminWs.disableApp).toHaveBeenCalledTimes(1)
    expect(mockAdminWs.disableApp).toHaveBeenCalledWith({
      installed_app_id: mockAppId,
    })

    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(removeProjectCellIdAction)
  })
})
