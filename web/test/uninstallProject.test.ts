import { AdminWebsocket } from '@holochain/client/lib/api/admin/websocket'
import { CellIdString } from '../src/types/shared'
import { uninstallProject } from '../src/projects/uninstallProject'

let mockAdminWs: AdminWebsocket
let mockAppId: string
let mockCellId: CellIdString
let dispatch: any
let removeProjectCellIdAction: { type: string; payload: string }

beforeEach(() => {
  // @ts-ignore
  mockAdminWs = {
    uninstallApp: jest.fn(),
  }

  mockAppId = 'testAppId'
  mockCellId = 'testCellId'

  dispatch = jest.fn()

  removeProjectCellIdAction = {
    type: 'REMOVE_PROJECT_CELL_ID',
    payload: mockCellId,
  }
})

describe('uninstallProject()', () => {
  it('should uninstall app in holochain and purge project from redux', async () => {
    await uninstallProject(mockAppId, mockCellId, dispatch, mockAdminWs)

    expect(mockAdminWs.uninstallApp).toHaveBeenCalledTimes(1)
    expect(mockAdminWs.uninstallApp).toHaveBeenCalledWith({
      installed_app_id: mockAppId,
    })

    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(removeProjectCellIdAction)
  })
})
