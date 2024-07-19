import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  deleteOutcomeFully,
  updateOutcome,
} from '../../redux/persistent/projects/outcomes/actions'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'
import MultiEditBar, { MultiEditBarOwnProps } from './MultiEditBar.component'
import { CellId } from '@holochain/client'
import { ActionHashB64 } from '../../types/shared'
import { Outcome } from 'zod-models'

function mapStateToProps(state: RootState) {
  const {
    ui: { activeProject },
  } = state
  const outcomes = state.projects.outcomes[activeProject] || {}
  const selectedOutcomes = state.ui.selection.selectedOutcomes.map(
    (actionHash) => {
      const outcome = outcomes[actionHash]
      return outcome
    }
  )
  return {
    agentAddress: state.agentAddress,
    selectedOutcomes,
  }
}

function mapDispatchToProps(dispatch: any, ownProps: MultiEditBarOwnProps) {
  const { projectId: cellIdString, appWebsocket: _appWebsocket } = ownProps
  let cellId: CellId
  if (cellIdString) {
    cellId = cellIdFromString(cellIdString)
  }
  return {
    updateOutcome: async (entry: Outcome, outcomeActionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const updatedOutcome = await projectsZomeApi.outcome.update(cellId, {
        actionHash: outcomeActionHash,
        entry,
      })
      return dispatch(updateOutcome(cellIdString, updatedOutcome))
    },
    deleteOutcomeFully: async (outcomeActionHash: ActionHashB64) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const deleteOutcomeFullyResponse = await projectsZomeApi.outcome.deleteOutcomeFully(
        cellId,
        outcomeActionHash
      )
      return dispatch(
        deleteOutcomeFully(cellIdString, deleteOutcomeFullyResponse)
      )
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiEditBar)
