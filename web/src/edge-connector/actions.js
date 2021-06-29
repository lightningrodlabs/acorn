const SET_EDGE_CONNECTOR_FROM = 'SET_EDGE_CONNECTOR_FROM'
const SET_EDGE_CONNECTOR_TO = 'SET_EDGE_CONNECTOR_TO'
const RESET_EDGE_CONNECTOR = 'RESET_EDGE_CONNECTOR'

// these need to match the RelationInput enum
// struct and its serialization design
const RELATION_AS_PARENT = 'ExistingGoalAsParent'
const RELATION_AS_CHILD = 'ExistingGoalAsChild'

// relation should be RELATION_AS_PARENT or RELATION_AS_CHILD
function setEdgeConnectorFrom(address, relation, validToAddresses) {
  return {
    type: SET_EDGE_CONNECTOR_FROM,
    payload: {
      address,
      relation,
      validToAddresses,
    },
  }
}

function setEdgeConnectorTo(address) {
  return {
    type: SET_EDGE_CONNECTOR_TO,
    payload: address,
  }
}

function resetEdgeConnector() {
  return {
    type: RESET_EDGE_CONNECTOR,
  }
}

export {
  RELATION_AS_PARENT,
  RELATION_AS_CHILD,
  SET_EDGE_CONNECTOR_FROM,
  SET_EDGE_CONNECTOR_TO,
  RESET_EDGE_CONNECTOR,
  setEdgeConnectorFrom,
  setEdgeConnectorTo,
  resetEdgeConnector,
}
