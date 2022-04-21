import { connect } from 'react-redux'
import { RootState } from '../../redux/reducer'
import {
  createOutcomeWithConnection,
} from '../../redux/persistent/projects/outcomes/actions'
import { affectLayoutDeleteConnection } from '../../redux/persistent/projects/connections/actions'
import {
  closeOutcomeForm,
  updateContent,
} from '../../redux/ephemeral/outcome-form/actions'
import MapViewOutcomeTitleForm from './MapViewOutcomeTitleForm.component'
import ProjectsZomeApi from '../../api/projectsApi'
import { getAppWs } from '../../hcWebsockets'
import { cellIdFromString } from '../../utils'

// https://react-redux.js.org/using-react-redux/connect-mapstate
// Designed to grab selective data off of a redux state tree in order
// to pass it to a component for rendering, as specific properties that
// that component expects

function mapStateToProps(state: RootState) {
  const {
    ui: {
      viewport: { scale },
      // all the state for this component is store under state->ui->outcomeForm
      outcomeForm: {
        content,
        leftConnectionXPosition,
        topConnectionYPosition,
        // these three go together
        fromAddress,
        relation,
        // ASSUMPTION: one parent
        existingParentConnectionAddress, // this is optional though
      },
    },
  } = state

  return {
    activeAgentPubKey: state.agentAddress,
    whoami: state.whoami,
    scale,
    // optional, the address of the Outcome that we are relating this to
    fromAddress,
    // optional, the relation (relation_as_{child|parent})
    // between the potential fromAddress Outcome
    // and a new Outcome to be created
    relation,
    // optional, the address of an existing connection that
    // indicates this Outcome as the child of another (a.k.a has a parent)
    // ASSUMPTION: one parent
    existingParentConnectionAddress,
    content,
    leftConnectionXPosition: leftConnectionXPosition,
    topConnectionYPosition: topConnectionYPosition,
  }
}

// https://react-redux.js.org/using-react-redux/connect-mapdispatch
// Designed to pass functions into components which are already wrapped as
// action dispatchers for redux action types

function mapDispatchToProps(dispatch, ownProps) {
  const { projectId: cellIdString } = ownProps
  const cellId = cellIdFromString(cellIdString)
  return {
    updateContent: (content) => {
      dispatch(updateContent(content))
    },
    deleteConnection: async (address) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      // false because we will only be archiving
      // an connection here in the context of immediately replacing
      // it with another during a createOutcomeWithConnection
      // thus we don't want a glitchy animation
      const affectLayout = false
      const layoutAction = await affectLayoutDeleteConnection(
        cellIdString,
        address,
        affectLayout
      )
      return dispatch(layoutAction)
    },
    createOutcomeWithConnection: async (entry, maybeLinkedOutcome) => {
      const appWebsocket = await getAppWs()
      const projectsZomeApi = new ProjectsZomeApi(appWebsocket)
      // this api function is not being picked up by intellisense
      const outcomeWithConnection = await projectsZomeApi.outcome.createOutcomeWithConnection(
        cellId,
        {
          entry,
          maybeLinkedOutcome,
        }
      )
      return dispatch(
        createOutcomeWithConnection(cellIdString, outcomeWithConnection)
      )
    },
    closeOutcomeForm: () => {
      dispatch(closeOutcomeForm())
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapViewOutcomeTitleForm)