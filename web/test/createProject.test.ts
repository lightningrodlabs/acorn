import { finalizeCreateProject } from '../src/projects/createProject'
import mockUnmigratedProjectMeta from './mockProjectMeta'


describe('finalizeCreateProject', () => {
  it('should dispatch actions', () => {

    const dispatch = jest.fn()
    // const cellIdString = 'testCellIdString'
    // await finalizeCreateProject()
    
    // expect(dispatch).toHaveBeenCalledTimes(2)
    // expect(dispatch).toHaveBeenNthCalledWith(1, {
    //   type: 'SIMPLE_CREATE_PROJECT_META',
    //   payload: mockUnmigratedProjectMeta,
    //   meta: { cellIdString: mockCellIdString },
    // })
    // expect(dispatch).toHaveBeenNthCalledWith(2, {
    //   type: 'SET_MEMBER',
    //   payload: {
    //     cellIdString: mockCellIdString,
    //     member: {
    //       agentPubKey: 'testAgentAddress',
    //     },
    //   },
    // })
  })
})