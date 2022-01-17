/*
  This file is the entry point for how to render the redux state visually
  onto the screen, using the HTML5 canvas APIs.
  It will iterate through each part of the state that needs rendering
  and use well defined functions for rendering those specific parts
  to the canvas.
*/
import drawGoalCard from './drawGoalCard'
import drawEdge, { calculateEdgeCoordsByGoalCoords } from './drawEdge'
import drawOverlay from './drawOverlay'
import drawSelectBox from '../drawing/drawSelectBox'
import drawEntryPoints from './drawEntryPoints'
import {
  RELATION_AS_PARENT,
  RELATION_AS_CHILD,
} from '../edge-connector/actions'
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

// Render is responsible for painting all the existing goals & edges,
// as well as the yet to be created (pending) ones (For new Goal / new Edge / edit Edge)
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
  const goals = state.projects.goals[projectId]
  const edges = state.projects.edges[projectId]
  const goalMembers = state.projects.goalMembers[projectId]
  const entryPoints = state.projects.entryPoints[projectId]
  const projectMeta = state.projects.projectMeta[projectId]

  // draw things relating to the project, if the project has fully loaded
  if (goals && edges && goalMembers && entryPoints && projectMeta) {
    const topPriorityGoals = projectMeta.top_priority_goals
    // converts the goals object to an array
    const goalsAsArray = Object.keys(goals).map(headerHash => goals[headerHash])
    // convert the edges object to an array
    const edgesAsArray = Object.keys(edges).map(headerHash => edges[headerHash])

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
      goals,
      edgesAsArray,
      coordinates
    )

    /*
      DRAW EDGES (EXISTING)
    */
    // render each edge to the canvas, basing it off the rendering coordinates of the parent and child nodes
    edgesAsArray.forEach(function (edge) {

      // if in the pending re-parenting mode for the child card of an existing edge,
      // temporarily omit/hide the existing edge from view
      // ASSUMPTION: one parent
      const pendingReParent = (state.ui.edgeConnector.fromAddress === edge.child_address && state.ui.edgeConnector.relation === RELATION_AS_CHILD)
        || (state.ui.goalForm.isOpen && state.ui.goalForm.fromAddress === edge.child_address && state.ui.goalForm.relation === RELATION_AS_CHILD)
      if (pendingReParent) return

      const childCoords = coordinates[edge.child_address]
      const parentCoords = coordinates[edge.parent_address]
      const parentGoalText = goals[edge.parent_address]
        ? goals[edge.parent_address].content
        : ''
      // we can only render this edge
      // if we know the coordinates of the Goals it connects
      if (childCoords && parentCoords) {
        const [edge1port, edge2port] = calculateEdgeCoordsByGoalCoords(
          childCoords,
          parentCoords,
          parentGoalText,
          ctx
        )
        const isHovered = state.ui.hover.hoveredEdge === edge.headerHash
        const isSelected = state.ui.selection.selectedEdges.includes(
          edge.headerHash
        )
        drawEdge(edge1port, edge2port, ctx, isHovered, isSelected)
      }
    })

    /*
      SEPARATE SELECTED & UNSELECTED GOALS
    */
    // in order to create layers behind and in front of the editing highlight overlay
    const unselectedGoals = goalsAsArray.filter(goal => {
      return (
        state.ui.selection.selectedGoals.indexOf(goal.headerHash) === -1 &&
        state.ui.goalForm.editAddress !== goal.headerHash
      )
    })
    const selectedGoals = goalsAsArray.filter(goal => {
      return (
        state.ui.selection.selectedGoals.indexOf(goal.headerHash) > -1 &&
        state.ui.goalForm.editAddress !== goal.headerHash
      )
    })

    /*
      DRAW UNSELECTED GOALS
    */
    // render each unselected goal to the canvas
    unselectedGoals.forEach(goal => {
      // use the set of coordinates at the same index
      // in the coordinates array
      const isHovered = state.ui.hover.hoveredGoal === goal.headerHash
      const isSelected = false
      const isEditing = false
      const editInfoObject = null //state.ui.goalEditing.find(item => item.goal === goal.headerHash)
      const isBeingEdited = Boolean(editInfoObject)
      const isBeingEditedBy = isBeingEdited ? state.agents[editInfoObject.editor].handle : null
      const membersOfGoal = Object.keys(goalMembers)
        .map(headerHash => goalMembers[headerHash])
        .filter(goalMember => goalMember.goal_address === goal.headerHash)
        .map(goalMember => state.agents[goalMember.agent_address])
      const isTopPriorityGoal = !!topPriorityGoals.find(headerHash => headerHash === goal.headerHash)
      drawGoalCard({
        scale: scale,
        goal: goal,
        members: membersOfGoal,
        coordinates: coordinates[goal.headerHash],
        isEditing: isEditing,
        editText: '',
        isSelected: isSelected,
        isHovered: isHovered,
        ctx: ctx,
        isBeingEdited: isBeingEdited,
        isTopPriorityGoal: isTopPriorityGoal,
        isBeingEditedBy: isBeingEditedBy
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
    /* if shift key not held down and there are more than 1 Goals selected */
    if (
      state.ui.goalForm.editAddress ||
      (state.ui.selection.selectedGoals.length > 1 &&
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
      DRAW SELECTED GOALS
    */
    selectedGoals.forEach(goal => {
      // use the set of coordinates at the same index
      // in the coordinates array
      const isHovered = state.ui.hover.hoveredGoal === goal.headerHash
      const isSelected = true
      const isEditing = false
      const editInfoObject = null //state.ui.goalEditing.find(item => item.goal === goal.headerHash)
      const isBeingEdited = Boolean(editInfoObject)
      const isBeingEditedBy = isBeingEdited ? state.agents[editInfoObject.editor].handle : null
      const membersOfGoal = Object.keys(goalMembers)
        .map(headerHash => goalMembers[headerHash])
        .filter(goalMember => goalMember.goal_address === goal.headerHash)
        .map(goalMember => state.agents[goalMember.agent_address])
      const isTopPriorityGoal = !!topPriorityGoals.find(headerHash => headerHash === goal.headerHash)
      drawGoalCard({
        scale: scale,
        goal: goal,
        members: membersOfGoal,
        coordinates: coordinates[goal.headerHash],
        isEditing: isEditing,
        editText: '',
        isSelected: isSelected,
        isHovered: isHovered,
        ctx: ctx,
        isBeingEdited: isBeingEdited,
        isTopPriorityGoal: isTopPriorityGoal,
        isBeingEditedBy: isBeingEditedBy
      })
    })

    /*
      DRAW PENDING EDGE FOR GOAL FORM
    */
    // render the edge that is pending to be created to the open goal form
    if (state.ui.goalForm.isOpen && state.ui.goalForm.fromAddress) {
      const fromGoalCoords = coordinates[state.ui.goalForm.fromAddress]
      const newGoalCoords = {
        x: state.ui.goalForm.leftEdgeXPosition,
        y: state.ui.goalForm.topEdgeYPosition,
      }
      const fromGoalText = state.projects.goals[
        state.ui.goalForm.fromAddress
      ]
        ? goals[state.ui.goalForm.fromAddress].content
        : ''
      let childCoords, parentCoords
      const { relation } = state.ui.goalForm
      if (relation === RELATION_AS_CHILD) {
        childCoords = fromGoalCoords
        parentCoords = newGoalCoords
      } else if (relation === RELATION_AS_PARENT) {
        childCoords = newGoalCoords
        parentCoords = fromGoalCoords
      }
      const [edge1port, edge2port] = calculateEdgeCoordsByGoalCoords(
        childCoords,
        parentCoords,
        fromGoalText,
        ctx
      )
      drawEdge(edge1port, edge2port, ctx)
    }

    /*
      DRAW PENDING EDGE FOR "EDGE CONNECTOR"
    */
    // render the edge that is pending to be created between existing Goals
    if (state.ui.edgeConnector.fromAddress) {
      const { fromAddress, relation, toAddress } = state.ui.edgeConnector
      const { liveCoordinate } = state.ui.mouse
      const fromCoords = coordinates[fromAddress]
      const fromContent = goals[fromAddress].content
      const [
        fromAsChildCoord,
        fromAsParentCoord,
      ] = calculateEdgeCoordsByGoalCoords(
        fromCoords,
        fromCoords,
        fromContent,
        ctx
      )
      // if there's a goal this is pending
      // as being "to", then we will be drawing the edge to its correct
      // upper or lower port
      // the opposite of whichever the "from" port is connected to
      let toCoords, toContent, toAsChildCoord, toAsParentCoord
      if (toAddress) {
        toCoords = coordinates[toAddress]
        toContent = goals[toAddress].content
          ;[toAsChildCoord, toAsParentCoord] = calculateEdgeCoordsByGoalCoords(
            toCoords,
            toCoords,
            toContent,
            ctx
          )
      }
      // in drawEdge, it draws at exactly the two coordinates given,
      // so we could pass them in either order/position
      const fromEdgeCoord =
        relation === RELATION_AS_PARENT ? fromAsParentCoord : fromAsChildCoord
      // use the current mouse coordinate position, liveCoordinate, by default
      let toEdgeCoord = liveCoordinate
      // use the coordinates relating to a Goal which it is pending that
      // this edge will connect the "from" Goal "to"
      if (toAddress) {
        toEdgeCoord =
          relation === RELATION_AS_PARENT ? toAsChildCoord : toAsParentCoord
      }
      if (relation === RELATION_AS_CHILD) {
        fromEdgeCoord.y = fromEdgeCoord.y - CONNECTOR_VERTICAL_SPACING
        // only modify if we're dealing with an actual goal being connected to
        if (toAddress)
          toEdgeCoord.y = toEdgeCoord.y + CONNECTOR_VERTICAL_SPACING
      } else if (relation === RELATION_AS_PARENT) {
        fromEdgeCoord.y = fromEdgeCoord.y + CONNECTOR_VERTICAL_SPACING
        // only modify if we're dealing with an actual goal being connected to
        if (toAddress)
          toEdgeCoord.y = toEdgeCoord.y - CONNECTOR_VERTICAL_SPACING
      }
      drawEdge(fromEdgeCoord, toEdgeCoord, ctx)
    }

    /*
      DRAW GOAL BEING EDITED in QUICK EDIT MODE
    */
    // so in front of the overlay as well
    if (state.ui.goalForm.editAddress) {
      // editing an existing Goal
      const editingGoal = goals[state.ui.goalForm.editAddress]
      // we only allow this goal
      // to be edited using 'quickedit'
      // above the first zoom threshold
      const isEditing = scale >= firstZoomThreshold
      const editText = state.ui.goalForm.content
      const membersOfGoal = Object.keys(goalMembers)
        .map(headerHash => goalMembers[headerHash])
        .filter(goalMember => goalMember.goal_address === editingGoal.headerHash)
        .map(goalMember => state.agents[goalMember.agent_address])
      const isTopPriorityGoal = !!topPriorityGoals.find(headerHash => headerHash === state.ui.goalForm.editAddress)
      drawGoalCard({
        scale: scale,
        goal: editingGoal,
        members: membersOfGoal,
        coordinates: coordinates[editingGoal.headerHash],
        isEditing: isEditing,
        editText: editText,
        isSelected: false,
        isHovered: false,
        ctx: ctx,
        isBeingEdited: false, 
        isTopPriorityGoal: isTopPriorityGoal
      })
    }
  }

  /*
    DRAW NEW GOAL PLACEHOLDER
  */
  // creating a new Goal
  if (!state.ui.goalForm.editAddress && state.ui.goalForm.isOpen) {
    const isHovered = false
    const isSelected = false
    const isEditing = true
    const isTopPriorityGoal = false
    drawGoalCard({
      scale: scale,
      goal: { status: 'Uncertain' },
      members: [],
      coordinates: { x: state.ui.goalForm.leftEdgeXPosition, y: state.ui.goalForm.topEdgeYPosition },
      isEditing: isEditing,
      editText: state.ui.goalForm.content,
      isSelected: isSelected,
      isHovered: isHovered,
      ctx: ctx,
      isBeingEdited: false, 
      isTopPriorityGoal: isTopPriorityGoal
    })
  }
}

export default render
