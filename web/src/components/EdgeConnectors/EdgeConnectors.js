import React, { useState } from 'react'
import { connect } from 'react-redux'
import './EdgeConnectors.css'
import { coordsCanvasToPage } from '../../drawing/coordinateSystems'
import layoutFormula from '../../drawing/layoutFormula'
import { Transition, TransitionGroup } from 'react-transition-group'
import {
  goalWidth,
  getGoalHeight,
  CONNECTOR_VERTICAL_SPACING,
} from '../../drawing/dimensions'
import {
  setEdgeConnectorFrom,
  setEdgeConnectorTo,
  RELATION_AS_CHILD,
  RELATION_AS_PARENT,
} from '../../edge-connector/actions'
import handleEdgeConnectMouseUp from '../../edge-connector/handler'

// checks if 'checkAddress' is an ancestor of 'descendantAddress', by looking through 'edges'
// is relatively easy because each Goal only has ONE parent
// e.g. we can walk straight up the tree to the top
function isAncestor(descendantAddress, checkAddress, edges) {
  const edgeWithParent = edges.find(
    (edge) => edge.child_address === descendantAddress
  )
  if (edgeWithParent) {
    if (edgeWithParent.parent_address === checkAddress) {
      return true
    } else {
      return isAncestor(edgeWithParent.parent_address, checkAddress, edges)
    }
  } else {
    // if node has no ancestors, then checkAddress must not be an ancestor
    return false
  }
}

// as long as there are no cycles in the tree this will work wonderfully
function allDescendants(ancestorAddress, edges, accumulator = []) {
  const children = edges
    .filter((edge) => edge.parent_address === ancestorAddress)
    .map((edge) => edge.child_address)
  return accumulator
    .concat(children.map((address) => allDescendants(address, edges, children)))
    .flat()
}

/*
validate edges that can be created:
relation as child, other node MUST
- not be itself
- not be a descendant of 'from' node, to prevent cycles in the tree
*/
function calculateValidParents(fromAddress, edges, goalAddresses) {
  const descendants = allDescendants(fromAddress, edges)
  return goalAddresses.filter((goalAddress) => {
    return (
      // filter out self-address in the process
      goalAddress !== fromAddress &&
      // filter out any descendants
      !descendants.includes(goalAddress)
    )
  })
}

/*
validate edges that can be created:
relation as parent, other node MUST
- not be itself
- have no parent
- not be the root ancestor of 'from' node, to prevent cycles in the tree
*/
export function calculateValidChildren(fromAddress, edges, goalAddresses) {
  return goalAddresses.filter((goalAddress) => {
    return (
      // filter out self-address in the process
      goalAddress !== fromAddress &&
      // find the Goal objects without parent Goals
      // since they will sit at the top level
      !edges.find((edge) => edge.child_address === goalAddress) &&
      !isAncestor(fromAddress, goalAddress, edges)
    )
  })
}

const EdgeConnectorHtml = ({
  active,
  pixelTop,
  pixelLeft,
  onMouseDown,
  onMouseUp,
  onMouseOver,
  onMouseOut,
}) => {
  return (
    <div
      className={`edge-connector ${active ? 'active' : ''}`}
      style={{ top: `${pixelTop}px`, left: `${pixelLeft}px` }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div className="edge-connector-blue-dot" />
    </div>
  )
}

const EdgeConnector = ({
  activeProject,
  goal,
  hasParent,
  fromAddress,
  relation,
  toAddress,
  address,
  goalCoordinates,
  coordsCanvasToPage,
  canvas,
  setEdgeConnectorFrom,
  setEdgeConnectorTo,
  setHoveredEdgeConnector,
  edges,
  goalAddresses,
  dispatch,
}) => {
  const ctx = canvas.getContext('2d')
  const goalHeight = getGoalHeight(ctx, goal.content)

  // calculate the coordinates on the page, based
  // on what the coordinates on the canvas would be
  const { x: topConnectorLeft, y: topConnectorTop } = coordsCanvasToPage({
    x: goalCoordinates.x + goalWidth / 2,
    y: goalCoordinates.y - CONNECTOR_VERTICAL_SPACING,
  })
  const { x: bottomConnectorLeft, y: bottomConnectorTop } = coordsCanvasToPage({
    x: goalCoordinates.x + goalWidth / 2,
    y: goalCoordinates.y + goalHeight + CONNECTOR_VERTICAL_SPACING,
  })

  const topConnectorActive =
    (address === fromAddress && relation === RELATION_AS_CHILD) ||
    (toAddress && address === toAddress && relation === RELATION_AS_PARENT)
  const bottomConnectorActive =
    (address === fromAddress && relation === RELATION_AS_PARENT) ||
    (toAddress && address === toAddress && relation === RELATION_AS_CHILD)

  // should only show when the Goal has no parent, since it can only have one
  // a connection to this upper port would make this Goal a child of the current 'from' Goal of the edge connector
  // if there is one
  const canShowTopConnector =
    !bottomConnectorActive &&
    !hasParent &&
    (!relation || relation === RELATION_AS_PARENT)

  // a connection to this lower port would make this Goal a parent of the current 'from' Goal of the edge connector
  // if there is one
  const canShowBottomConnector =
    !topConnectorActive && (!relation || relation === RELATION_AS_CHILD)

  // shared code for mouse event handlers
  const edgeConnectMouseDown = (direction, validity) => () => {
    if (!fromAddress) {
      setEdgeConnectorFrom(
        address,
        direction,
        validity(address, edges, goalAddresses)
      )
    }
  }
  const edgeConnectMouseUp = () => {
    handleEdgeConnectMouseUp(
      fromAddress,
      relation,
      toAddress,
      activeProject,
      dispatch
    )
  }
  const topConnectorOnMouseDown = edgeConnectMouseDown(
    RELATION_AS_CHILD,
    calculateValidParents
  )
  const bottomConnectorOnMouseDown = edgeConnectMouseDown(
    RELATION_AS_PARENT,
    calculateValidChildren
  )

  const connectorOnMouseOver = () => {
    setHoveredEdgeConnector(address)
    // cannot set 'to' the very same Goal
    if (fromAddress && address !== fromAddress) setEdgeConnectorTo(address)
  }
  const connectorOnMouseOut = () => {
    setHoveredEdgeConnector(null)
    setEdgeConnectorTo(null)
  }

  return (
    <>
      {/* top connector */}
      {(canShowTopConnector || topConnectorActive) && (
        <EdgeConnectorHtml
          active={topConnectorActive}
          pixelTop={topConnectorTop}
          pixelLeft={topConnectorLeft}
          onMouseDown={topConnectorOnMouseDown}
          onMouseUp={edgeConnectMouseUp}
          onMouseOver={connectorOnMouseOver}
          onMouseOut={connectorOnMouseOut}
        />
      )}

      {/* bottom connector */}
      {(canShowBottomConnector || bottomConnectorActive) && (
        <EdgeConnectorHtml
          active={bottomConnectorActive}
          pixelTop={bottomConnectorTop}
          pixelLeft={bottomConnectorLeft}
          onMouseDown={bottomConnectorOnMouseDown}
          onMouseUp={edgeConnectMouseUp}
          onMouseOver={connectorOnMouseOver}
          onMouseOut={connectorOnMouseOut}
        />
      )}
    </>
  )
}

const EdgeConnectors = ({
  activeProject,
  goals,
  edges,
  goalAddresses,
  coordinates,
  coordsCanvasToPage,
  fromAddress,
  relation,
  toAddress,
  connectorAddresses,
  canvas,
  setEdgeConnectorFrom,
  setEdgeConnectorTo,
  dispatch,
}) => {
  const [hoveredEdgeConnector, setHoveredEdgeConnector] = useState(null)
  // work in the one currently being hovered over, if there is one
  // to the list of edge connectors that are eligible to stay
  connectorAddresses = connectorAddresses.concat(
    hoveredEdgeConnector ? [hoveredEdgeConnector] : []
  )
  return (
    <TransitionGroup>
      {connectorAddresses.map((connectorAddress) => {
        const goalCoordinates = coordinates[connectorAddress]
        const goal = goals[connectorAddress]
        const hasParent = edges.find(
          (edge) => edge.child_address === connectorAddress
        )
        return (
          <Transition key={connectorAddress} timeout={300}>
            {(state) => (
              <EdgeConnector
                state={state}
                activeProject={activeProject}
                goal={goal}
                edges={edges}
                goalAddresses={goalAddresses}
                fromAddress={fromAddress}
                relation={relation}
                toAddress={toAddress}
                hasParent={hasParent}
                address={connectorAddress}
                setEdgeConnectorFrom={setEdgeConnectorFrom}
                setEdgeConnectorTo={setEdgeConnectorTo}
                setHoveredEdgeConnector={setHoveredEdgeConnector}
                goalCoordinates={goalCoordinates}
                coordsCanvasToPage={coordsCanvasToPage}
                canvas={canvas}
                dispatch={dispatch}
              />
            )}
          </Transition>
        )
      })}
    </TransitionGroup>
  )
}

function mapStateToProps(state) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
    },
  } = state
  const goals = state.projects.goals[activeProject] || {}
  const edges = state.projects.edges[activeProject] || {}
  const coordinates = state.ui.layout
  const selectedGoalAddresses = state.ui.selection.selectedGoals
  const hoveredGoalAddress = state.ui.hover.hoveredGoal
  const { fromAddress, relation, toAddress } = state.ui.edgeConnector
  let connectorAddresses
  // only set validToAddresses if we are actually utilizing the edge connector right now
  if (fromAddress) {
    // connector addresses includes the goal we are connecting from
    // to all the possible goals we can connect to validly
    connectorAddresses = [fromAddress].concat(
      state.ui.edgeConnector.validToAddresses
    )
  } else if (hoveredGoalAddress) {
    connectorAddresses = selectedGoalAddresses
      .concat([hoveredGoalAddress])
      // deduplicate
      .filter((v, i, a) => a.indexOf(v) === i)
  } else {
    // fall back is to show the dots on any currently selected goals
    connectorAddresses = selectedGoalAddresses
  }

  return {
    activeProject,
    coordinates,
    coordsCanvasToPage: (coordinate) => {
      return coordsCanvasToPage(coordinate, translate, scale)
    },
    goals,
    edges: Object.values(edges), // convert from object to array
    goalAddresses: Object.keys(goals), // convert from object to array
    fromAddress,
    relation,
    toAddress,
    connectorAddresses,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setEdgeConnectorFrom: (address, relation, validToAddresses) => {
      return dispatch(setEdgeConnectorFrom(address, relation, validToAddresses))
    },
    setEdgeConnectorTo: (address) => {
      return dispatch(setEdgeConnectorTo(address))
    },
    dispatch,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EdgeConnectors)
