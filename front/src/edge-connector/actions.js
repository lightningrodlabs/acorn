const SET_EDGE_CONNECTOR_FROM = 'SET_EDGE_CONNECTOR_FROM'
const SET_EDGE_CONNECTOR_TO = 'SET_EDGE_CONNECTOR_TO'
const RESET_EDGE_CONNECTOR = 'RESET_EDGE_CONNECTOR'

const RELATION_AS_PARENT = 'relation_as_parent'
const RELATION_AS_CHILD = 'relation_as_child'

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
