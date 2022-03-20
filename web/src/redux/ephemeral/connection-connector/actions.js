const SET_CONNECTION_CONNECTOR_FROM = 'SET_CONNECTION_CONNECTOR_FROM'
const SET_CONNECTION_CONNECTOR_TO = 'SET_CONNECTION_CONNECTOR_TO'
const RESET_CONNECTION_CONNECTOR = 'RESET_CONNECTION_CONNECTOR'

// these need to match the RelationInput enum
// struct and its serialization design
const RELATION_AS_PARENT = 'ExistingOutcomeAsParent'
const RELATION_AS_CHILD = 'ExistingOutcomeAsChild'

// relation should be RELATION_AS_PARENT or RELATION_AS_CHILD
// existingParentConnectionAddress is optional
function setConnectionConnectorFrom(address, relation, validToAddresses, existingParentConnectionAddress) {
  return {
    type: SET_CONNECTION_CONNECTOR_FROM,
    payload: {
      address,
      relation,
      validToAddresses,
      existingParentConnectionAddress
    },
  }
}

function setConnectionConnectorTo(address) {
  return {
    type: SET_CONNECTION_CONNECTOR_TO,
    payload: address,
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
