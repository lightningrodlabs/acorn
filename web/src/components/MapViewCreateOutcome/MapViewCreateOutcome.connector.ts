import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  createOutcomeWithConnection,
} from '../../redux/persistent/projects/outcomes/actions'
import { deleteConnection } from '../../redux/persistent/projects/connections/actions'
import {
  closeOutcomeForm,
  updateContent,
} from '../../redux/ephemeral/outcome-form/actions'
import MapViewCreateOutcome, { MapViewCreateOutcomeConnectorDispatchProps, MapViewCreateOutcomeConnectorStateProps, MapViewCreateOutcomeOwnProps } from './MapViewCreateOutcome.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { cellIdFromString } from '../../utils'
import { ActionHashB64, Option } from '../../types/shared'
import { LinkedOutcomeDetails, Outcome } from '../../types'
import { selectOutcome, unselectAll } from '../../redux/ephemeral/selection/actions'
import { animatePanAndZoom } from '../../redux/ephemeral/viewport/actions'
import { LAYOUT_ANIMATION_TYPICAL_MS } from '../../constants'

// https://react-redux.js.org/using-react-redux/connect-mapstate
// Designed to grab selective data off of a redux state tree in order
// to pass it to a component for rendering, as specific properties that
// that component expects

function mapStateToProps(state: RootState): MapViewCreateOutcomeConnectorStateProps {
  const {
    ui: {
      viewport: { scale, translate },
      // all the state for this component is store under state->ui->outcomeForm
      outcomeForm: {
        content,
        leftConnectionXPosition,
        topConnectionYPosition,
        maybeLinkedOutcome,
        existingParentConnectionAddress,
      },
    },
  } = state

  return {
    maybeLinkedOutcome, 
    activeAgentPubKey: state.agentAddress,
    scale,
    translate,
    existingParentConnectionAddress,
    content,
    leftConnectionXPosition: leftConnectionXPosition,
    topConnectionYPosition: topConnectionYPosition,
  }
}

// https://react-redux.js.org/using-react-redux/connect-mapdispatch
// Designed to pass functions into components which are already wrapped as
// action dispatchers for redux action types

function mapDispatchToProps(dispatch: any, ownProps: MapViewCreateOutcomeOwnProps): MapViewCreateOutcomeConnectorDispatchProps {
  const { projectId: cellIdString, appWebsocket } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    updateContent: (content: string) => {
      return dispatch(updateContent(content))
    },
    deleteConnection: async (actionHash: ActionHashB64) => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      // we will only be archiving
      // an connection here in the context of immediately replacing
      // it with another during a createOutcomeWithConnection
      // thus we don't want a glitchy animation
      // so we DON'T call TRIGGER_UPDATE_LAYOUT
      await projectsZomeApi.connection.delete(cellId, actionHash)
      return dispatch(deleteConnection(cellIdString, actionHash))
    },
    createOutcomeWithConnection: async (entry: Outcome, maybeLinkedOutcome: Option<LinkedOutcomeDetails>) => {
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      const outcomeWithConnection = await projectsZomeApi.outcome.createOutcomeWithConnection(
        cellId,
        {
          entry,
          maybeLinkedOutcome,
        }
      )
      dispatch(
        createOutcomeWithConnection(cellIdString, outcomeWithConnection)
      )
      // Re. the timeout...
      // it is necessary because an animation
      // runs in layout.ts that initially moves the position
      // of the Outcome itself. Before animating to the 
      const ADDITIONAL_WAIT_BUFFER_MS = 40
      setTimeout(() => {
        dispatch(unselectAll())
        dispatch(selectOutcome(outcomeWithConnection.outcome.actionHash))
        // `false` here means DONT change the scale, only the translate
        dispatch(animatePanAndZoom(outcomeWithConnection.outcome.actionHash, false))
      }, LAYOUT_ANIMATION_TYPICAL_MS + ADDITIONAL_WAIT_BUFFER_MS)
    },
    closeOutcomeForm: () => {
      return dispatch(closeOutcomeForm())
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapViewCreateOutcome)