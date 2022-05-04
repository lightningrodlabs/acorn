import { RelationInput } from '../../../types'
import { HeaderHashB64 } from '../../../types/shared'

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
  headerHash: HeaderHashB64,
  relation: RelationInput,
  validToHeaderHashes: Array<HeaderHashB64>,
  existingParentConnectionHeaderHash: HeaderHashB64
) {
  return {
    type: SET_CONNECTION_CONNECTOR_FROM,
    payload: {
      address: headerHash, // TODO: rename
      relation,
      validToAddresses: validToHeaderHashes,
      existingParentConnectionAddress: existingParentConnectionHeaderHash,
    },
  }
}

function setConnectionConnectorTo(headerHash: HeaderHashB64) {
  return {
    type: SET_CONNECTION_CONNECTOR_TO,
    payload: headerHash,
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
