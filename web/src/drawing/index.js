/*
  This file is the entry point for how to render the redux state visually
  onto the screen, using the HTML5 canvas APIs.
  It will iterate through each part of the state that needs rendering
  and use well defined functions for rendering those specific parts
  to the canvas.
*/
import drawOutcomeCard from './drawOutcomeCard'
import drawConnection, { calculateConnectionCoordsByOutcomeCoords } from './drawConnection'
import drawOverlay from './drawOverlay'
import drawSelectBox from '../drawing/drawSelectBox'
import drawEntryPoints from './drawEntryPoints'
import {
  RELATION_AS_PARENT,
  RELATION_AS_CHILD,
} from '../redux/ephemeral/connection-connector/actions'
import { CONNECTOR_VERTICAL_SPACING, firstZoomThreshold } from './dimensions'

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  const dpr = window.devicePixelRatio || 1
  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect()
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  return ctx
}

// Render is responsible for painting all the existing outcomes & connections,
// as well as the yet to be created (pending) ones (For new Outcome / new Connection / edit Connection)
// render the state contained in store onto the canvas
// `store` is a redux store
// `canvas` is a reference to an HTML5 canvas DOM element
function render(store, canvas) {
  // Get the 2 dimensional drawing context of the canvas (there is also 3 dimensional, e.g.)
  const ctx = setupCanvas(canvas)

  // pull the current state from the store
  const state = store.getState()

  // scale x, skew x, skew y, scale y, translate x, and translate y
  const {
    ui: {
      viewport: { translate, scale },
    },
  } = state
  ctx.setTransform(1, 0, 0, 1, 0, 0) // normalize
  // clear the entirety of the canvas
  ctx.clearRect(0, 0, state.ui.screensize.width, state.ui.screensize.height)

  // Scale all drawing operations by the dpr, as well as the zoom, so you
  // don't have to worry about the difference.
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(
    scale * dpr,
    0,
    0,
    scale * dpr,
    translate.x * dpr,
    translate.y * dpr
  )

  const projectId = state.ui.activeProject
  const activeEntryPoints = state.ui.activeEntryPoints
  if (!projectId) return
  const outcomes = state.projects.outcomes[projectId]
  const connections = state.projects.connections[projectId]
  const outcomeMembers = state.projects.outcomeMembers[projectId]
  const entryPoints = state.projects.entryPoints[projectId]
  const projectMeta = state.projects.projectMeta[projectId]

  // draw things relating to the project, if the project has fully loaded
  if (outcomes && connections && outcomeMembers && entryPoints && projectMeta) {
    const topPriorityOutcomes = projectMeta.topPriorityOutcomes
    // converts the outcomes object to an array
    const outcomesAsArray = Object.keys(outcomes).map(headerHash => outcomes[headerHash])
    // convert the connections object to an array
    const connectionsAsArray = Object.keys(connections).map(headerHash => connections[headerHash])

    const coordinates = state.ui.layout

    /*
      DRAW ENTRY POINTS
    */
    const activeEntryPointsObjects = activeEntryPoints.map(
      entryPointAddress => entryPoints[entryPointAddress]
    )
    drawEntryPoints(
      ctx,
      activeEntryPointsObjects,
      outcomes,
      connectionsAsArray,
      coordinates
    )

    /*
      DRAW CONNECTIONS (EXISTING)
    */
    // render each connection to the canvas, basing it off the rendering coordinates of the parent and child nodes
    connectionsAsArray.forEach(function (connection) {

      // if in the pending re-parenting mode for the child card of an existing connection,
      // temporarily omit/hide the existing connection from view
      // ASSUMPTION: one parent
      const pendingReParent = (state.ui.connectionConnector.fromAddress === connection.childHeaderHash && state.ui.connectionConnector.relation === RELATION_AS_CHILD)
        || (state.ui.outcomeForm.isOpen && state.ui.outcomeForm.fromAddress === connection.childHeaderHash && state.ui.outcomeForm.relation === RELATION_AS_CHILD)
      if (pendingReParent) return

      const childCoords = coordinates[connection.childHeaderHash]
      const parentCoords = coordinates[connection.parentHeaderHash]
      const parentOutcomeText = outcomes[connection.parentHeaderHash]
        ? outcomes[connection.parentHeaderHash].content
        : ''
      // we can only render this connection
      // if we know the coordinates of the Outcomes it connects
      if (childCoords && parentCoords) {
        const [connection1port, connection2port] = calculateConnectionCoordsByOutcomeCoords(
          childCoords,
          parentCoords,
          parentOutcomeText,
          ctx
        )
        const isHovered = state.ui.hover.hoveredConnection === connection.headerHash
        const isSelected = state.ui.selection.selectedConnections.includes(
          connection.headerHash
        )
        drawConnection(connection1port, connection2port, ctx, isHovered, isSelected)
      }
    })

    /*
      SEPARATE SELECTED & UNSELECTED OUTCOMES
    */
    // in order to create layers behind and in front of the editing highlight overlay
    const unselectedOutcomes = outcomesAsArray.filter(outcome => {
      return (
        state.ui.selection.selectedOutcomes.indexOf(outcome.headerHash) === -1 &&
        state.ui.outcomeForm.editAddress !== outcome.headerHash
      )
    })
    const selectedOutcomes = outcomesAsArray.filter(outcome => {
      return (
        state.ui.selection.selectedOutcomes.indexOf(outcome.headerHash) > -1 &&
        state.ui.outcomeForm.editAddress !== outcome.headerHash
      )
    })

    /*
      DRAW UNSELECTED OUTCOMES
    */
    // render each unselected outcome to the canvas
    unselectedOutcomes.forEach(outcome => {
      // use the set of coordinates at the same index
      // in the coordinates array
      const isHovered = state.ui.hover.hoveredOutcome === outcome.headerHash
      const isSelected = false
      const isEditing = false
      let editInfoObjects = Object.values(state.ui.realtimeInfo)
        .filter(agentInfo => agentInfo.outcomeBeingEdited !== null && agentInfo.outcomeBeingEdited.outcomeHeaderHash === outcome.headerHash)
      const isBeingEdited = editInfoObjects.length > 0
      const isBeingEditedBy = editInfoObjects.length === 1
        ? state.agents[editInfoObjects[0].agentPubKey].handle
        : editInfoObjects.length > 1
          ? `${editInfoObjects.length} people`
          : null
      // a combination of those editing + those with expanded view open
      const allMembersActiveOnOutcome = Object.values(state.ui.realtimeInfo)
        .filter(agentInfo => agentInfo.outcomeExpandedView === outcome.headerHash || (agentInfo.outcomeBeingEdited !== null && agentInfo.outcomeBeingEdited.outcomeHeaderHash === outcome.headerHash))
        .map(realtimeInfoObject => state.agents[realtimeInfoObject.agentPubKey])

      const membersOfOutcome = Object.keys(outcomeMembers)
        .map(headerHash => outcomeMembers[headerHash])
        .filter(outcomeMember => outcomeMember.outcomeHeaderHash === outcome.headerHash)
        .map(outcomeMember => state.agents[outcomeMember.memberAgentPubKey])
      const isTopPriorityOutcome = !!topPriorityOutcomes.find(headerHash => headerHash === outcome.headerHash)
      drawOutcomeCard({
        scale: scale,
        outcome: outcome,
        members: membersOfOutcome,
        coordinates: coordinates[outcome.headerHash],
        isEditing: isEditing, // self
        editText: '',
        isSelected: isSelected,
        isHovered: isHovered,
        ctx: ctx,
        isBeingEdited: isBeingEdited, // by other
        isBeingEditedBy: isBeingEditedBy, // other
        allMembersActiveOnOutcome: allMembersActiveOnOutcome,
        isTopPriorityOutcome: isTopPriorityOutcome,
      })
    })

    /*
      DRAW SELECT BOX
    */
    if (
      state.ui.keyboard.shiftKeyDown &&
      state.ui.mouse.mousedown &&
      state.ui.mouse.coordinate.x !== 0
    ) {
      drawSelectBox(
        state.ui.mouse.coordinate,
        state.ui.mouse.size,
        canvas.getContext('2d')
      )
    }

    /*
      DRAW EDITING HIGHLIGHT SEMI-TRANSPARENT OVERLAY
    */
    /* if shift key not held down and there are more than 1 Outcomes selected */
    if (
      state.ui.outcomeForm.editAddress ||
      (state.ui.selection.selectedOutcomes.length > 1 &&
        !state.ui.keyboard.shiftKeyDown)
    ) {
      // counteract the translation
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      drawOverlay(
        ctx,
        0,
        0,
        state.ui.screensize.width,
        state.ui.screensize.height
      )
      ctx.restore()
    }

    /*
      DRAW SELECTED OUTCOMES
    */
    selectedOutcomes.forEach(outcome => {
      // use the set of coordinates at the same index
      // in the coordinates array
      const isHovered = state.ui.hover.hoveredOutcome === outcome.headerHash
      const isSelected = true
      const isEditing = false
      let editInfoObjects = Object.values(state.ui.realtimeInfo).filter(agentInfo => agentInfo.outcomeBeingEdited !== null && agentInfo.outcomeBeingEdited.outcomeHeaderHash === outcome.headerHash)
      const isBeingEdited = editInfoObjects.length > 0
      const isBeingEditedBy = editInfoObjects.length === 1
        ? state.agents[editInfoObjects[0].agentPubKey].handle
        : editInfoObjects.length > 1
          ? `${editInfoObjects.length} people`
          : null
      // a combination of those editing + those with expanded view open
      const allMembersActiveOnOutcome = Object.values(state.ui.realtimeInfo)
        .filter(agentInfo => agentInfo.outcomeExpandedView === outcome.headerHash || (agentInfo.outcomeBeingEdited !== null && agentInfo.outcomeBeingEdited.outcomeHeaderHash === outcome.headerHash))
        .map(realtimeInfoObject => state.agents[realtimeInfoObject.agentPubKey])
      const membersOfOutcome = Object.keys(outcomeMembers)
        .map(headerHash => outcomeMembers[headerHash])
        .filter(outcomeMember => outcomeMember.outcomeHeaderHash === outcome.headerHash)
        .map(outcomeMember => state.agents[outcomeMember.memberAgentPubKey])
      const isTopPriorityOutcome = !!topPriorityOutcomes.find(headerHash => headerHash === outcome.headerHash)
      drawOutcomeCard({
        scale: scale,
        outcome: outcome,
        members: membersOfOutcome,
        coordinates: coordinates[outcome.headerHash],
        isEditing: isEditing,
        editText: '',
        isSelected: isSelected,
        isHovered: isHovered,
        ctx: ctx,
        isBeingEdited: isBeingEdited,
        isBeingEditedBy: isBeingEditedBy,
        allMembersActiveOnOutcome: allMembersActiveOnOutcome,
        isTopPriorityOutcome: isTopPriorityOutcome,
      })
    })

    /*
      DRAW PENDING CONNECTION FOR OUTCOME FORM
    */
    // render the connection that is pending to be created to the open outcome form
    if (state.ui.outcomeForm.isOpen && state.ui.outcomeForm.fromAddress) {
      const fromOutcomeCoords = coordinates[state.ui.outcomeForm.fromAddress]
      const newOutcomeCoords = {
        x: state.ui.outcomeForm.leftConnectionXPosition,
        y: state.ui.outcomeForm.topConnectionYPosition,
      }
      const fromOutcomeText = state.projects.outcomes[
        state.ui.outcomeForm.fromAddress
      ]
        ? outcomes[state.ui.outcomeForm.fromAddress].content
        : ''
      let childCoords, parentCoords
      const { relation } = state.ui.outcomeForm
      if (relation === RELATION_AS_CHILD) {
        childCoords = fromOutcomeCoords
        parentCoords = newOutcomeCoords
      } else if (relation === RELATION_AS_PARENT) {
        childCoords = newOutcomeCoords
        parentCoords = fromOutcomeCoords
      }
      const [connection1port, connection2port] = calculateConnectionCoordsByOutcomeCoords(
        childCoords,
        parentCoords,
        fromOutcomeText,
        ctx
      )
      drawConnection(connection1port, connection2port, ctx)
    }

    /*
      DRAW PENDING CONNECTION FOR "CONNECTION CONNECTOR"
    */
    // render the connection that is pending to be created between existing Outcomes
    if (state.ui.connectionConnector.fromAddress) {
      const { fromAddress, relation, toAddress } = state.ui.connectionConnector
      const { liveCoordinate } = state.ui.mouse
      const fromCoords = coordinates[fromAddress]
      const fromContent = outcomes[fromAddress].content
      const [
        fromAsChildCoord,
        fromAsParentCoord,
      ] = calculateConnectionCoordsByOutcomeCoords(
        fromCoords,
        fromCoords,
        fromContent,
        ctx
      )
      // if there's a outcome this is pending
      // as being "to", then we will be drawing the connection to its correct
      // upper or lower port
      // the opposite of whichever the "from" port is connected to
      let toCoords, toContent, toAsChildCoord, toAsParentCoord
      if (toAddress) {
        toCoords = coordinates[toAddress]
        toContent = outcomes[toAddress].content
          ;[toAsChildCoord, toAsParentCoord] = calculateConnectionCoordsByOutcomeCoords(
            toCoords,
            toCoords,
            toContent,
            ctx
          )
      }
      // in drawConnection, it draws at exactly the two coordinates given,
      // so we could pass them in either order/position
      const fromConnectionCoord =
        relation === RELATION_AS_PARENT ? fromAsParentCoord : fromAsChildCoord
      // use the current mouse coordinate position, liveCoordinate, by default
      let toConnectionCoord = liveCoordinate
      // use the coordinates relating to a Outcome which it is pending that
      // this connection will connect the "from" Outcome "to"
      if (toAddress) {
        toConnectionCoord =
          relation === RELATION_AS_PARENT ? toAsChildCoord : toAsParentCoord
      }
      if (relation === RELATION_AS_CHILD) {
        fromConnectionCoord.y = fromConnectionCoord.y - CONNECTOR_VERTICAL_SPACING
        // only modify if we're dealing with an actual outcome being connected to
        if (toAddress)
          toConnectionCoord.y = toConnectionCoord.y + CONNECTOR_VERTICAL_SPACING
      } else if (relation === RELATION_AS_PARENT) {
        fromConnectionCoord.y = fromConnectionCoord.y + CONNECTOR_VERTICAL_SPACING
        // only modify if we're dealing with an actual outcome being connected to
        if (toAddress)
          toConnectionCoord.y = toConnectionCoord.y - CONNECTOR_VERTICAL_SPACING
      }
      drawConnection(fromConnectionCoord, toConnectionCoord, ctx)
    }

    /*
      DRAW OUTCOME BEING EDITED in QUICK EDIT MODE
    */
    // so in front of the overlay as well
    if (state.ui.outcomeForm.editAddress) {
      // editing an existing Outcome
      const editingOutcome = outcomes[state.ui.outcomeForm.editAddress]
      // we only allow this outcome
      // to be edited using 'quickedit'
      // above the first zoom threshold
      const isEditing = scale >= firstZoomThreshold
      const editText = state.ui.outcomeForm.content
      let editInfoObjects = Object.values(state.ui.realtimeInfo)
        .filter(agentInfo => agentInfo.outcomeBeingEdited !== null && agentInfo.outcomeBeingEdited.outcomeHeaderHash === state.ui.outcomeForm.editAddress)
      const isBeingEdited = editInfoObjects.length > 0
      const isBeingEditedBy = editInfoObjects.length === 1
        ? state.agents[editInfoObjects[0].agentPubKey].handle
        : editInfoObjects.length > 1
          ? `${editInfoObjects.length} people`
          : null
      // a combination of those editing + those with expanded view open
      const allMembersActiveOnOutcome = Object.values(state.ui.realtimeInfo)
        .filter(agentInfo => agentInfo.outcomeExpandedView === state.ui.outcomeForm.editAddress || (agentInfo.outcomeBeingEdited !== null && agentInfo.outcomeBeingEdited.outcomeHeaderHash === state.ui.outcomeForm.editAddress))
        .map(realtimeInfoObject => state.agents[realtimeInfoObject.agentPubKey])
      const membersOfOutcome = Object.keys(outcomeMembers)
        .map(headerHash => outcomeMembers[headerHash])
        .filter(outcomeMember => outcomeMember.outcomeHeaderHash === editingOutcome.headerHash)
        .map(outcomeMember => state.agents[outcomeMember.memberAgentPubKey])
      const isTopPriorityOutcome = !!topPriorityOutcomes.find(headerHash => headerHash === state.ui.outcomeForm.editAddress)
      drawOutcomeCard({
        scale: scale,
        outcome: editingOutcome,
        members: membersOfOutcome,
        coordinates: coordinates[editingOutcome.headerHash],
        isEditing: isEditing,
        editText: editText,
        isSelected: false,
        isHovered: false,
        ctx: ctx,
        isBeingEdited: isBeingEdited,
        isBeingEditedBy: isBeingEditedBy,
        allMembersActiveOnOutcome: allMembersActiveOnOutcome,
        isTopPriorityOutcome: isTopPriorityOutcome,
      })
    }
  }

  /*
    DRAW NEW OUTCOME PLACEHOLDER
  */
  // creating a new Outcome
  if (!state.ui.outcomeForm.editAddress && state.ui.outcomeForm.isOpen) {
    const isHovered = false
    const isSelected = false
    const isEditing = true
    const isTopPriorityOutcome = false
    // TODO: fix for new data structure
    drawOutcomeCard({
      scale: scale,
      outcome: { status: 'Uncertain' },
      members: [],
      coordinates: { x: state.ui.outcomeForm.leftConnectionXPosition, y: state.ui.outcomeForm.topConnectionYPosition },
      isEditing: isEditing,
      editText: state.ui.outcomeForm.content,
      isSelected: isSelected,
      isHovered: isHovered,
      ctx: ctx,
      isBeingEdited: false,
      isBeingEditedBy: '',
      isTopPriorityOutcome: isTopPriorityOutcome,
      allMembersActiveOnOutcome: [],
    })
  }
}

export default render
