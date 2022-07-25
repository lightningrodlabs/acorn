import { RelationInput } from '../../../types'
import { ActionHashB64 } from '../../../types/shared'

const SET_CONNECTION_CONNECTOR_FROM = 'SET_CONNECTION_CONNECTOR_FROM'
const SET_CONNECTION_CONNECTOR_TO = 'SET_CONNECTION_CONNECTOR_TO'
const RESET_CONNECTION_CONNECTOR = 'RESET_CONNECTION_CONNECTOR'

// these need to match the RelationInput enum
// struct and its serialization design
const RELATION_AS_PARENT = RelationInput.ExistingOutcomeAsParent
const RELATION_AS_CHILD = RelationInput.ExistingOutcomeAsChild

// relation should be RELATION_AS_PARENT or RELATION_AS_CHILD
// existingParentConnectionAddress is optional
function setConnectionConnectorFrom(
  actionHash: ActionHashB64,
  relation: RelationInput,
  validToActionHashes: Array<ActionHashB64>,
  existingParentConnectionActionHash: ActionHashB64
) {
  return {
    type: SET_CONNECTION_CONNECTOR_FROM,
    payload: {
      address: actionHash, // TODO: rename
      relation,
      validToAddresses: validToActionHashes,
      existingParentConnectionAddress: existingParentConnectionActionHash,
    },
  }
}

function setConnectionConnectorTo(actionHash: ActionHashB64) {
  return {
    type: SET_CONNECTION_CONNECTOR_TO,
    payload: actionHash,
  }
}

function resetConnectionConnector() {
  return {
    type: RESET_CONNECTION_CONNECTOR,
  }
}

export {
  RELATION_AS_PARENT,
  RELATION_AS_CHILD,
  SET_CONNECTION_CONNECTOR_FROM,
  SET_CONNECTION_CONNECTOR_TO,
  RESET_CONNECTION_CONNECTOR,
  setConnectionConnectorFrom,
  setConnectionConnectorTo,
  resetConnectionConnector,
}
