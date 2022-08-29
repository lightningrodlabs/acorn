/*
  This file is the entry point for how to render the redux state visually
  onto the screen, using the HTML5 canvas APIs.
  It will iterate through each part of the state that needs rendering
  and use well defined functions for rendering those specific parts
  to the canvas.
*/
import drawOutcomeCard from './drawOutcome'
import drawConnection, {
  calculateConnectionCoordsByOutcomeCoords,
} from './drawConnection'
import drawOverlay from './drawOverlay'
import drawSelectBox from './drawSelectBox'
import drawEntryPoints from './drawEntryPoints'
import {
  RELATION_AS_PARENT,
  RELATION_AS_CHILD,
} from '../redux/ephemeral/connection-connector/actions'
import {
  CONNECTOR_VERTICAL_SPACING,
  firstZoomThreshold,
  getOutcomeHeight,
  outcomeHeight,
  outcomeWidth,
} from './dimensions'
import {
  ComputedOutcome,
  ComputedScope,
  ComputedSimpleAchievementStatus,
  ProjectMeta,
  RelationInput,
  Tag,
} from '../types'
import { ActionHashB64, WithActionHash } from '../types/shared'
import { ProjectConnectionsState } from '../redux/persistent/projects/connections/reducer'
import { ProjectEntryPointsState } from '../redux/persistent/projects/entry-points/reducer'
import { ProjectOutcomeMembersState } from '../redux/persistent/projects/outcome-members/reducer'

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

export type renderProps = {
  projectTags: WithActionHash<Tag>[]
  screenWidth: number
  screenHeight: number
  zoomLevel: number
  translate: {
    x: number
    y: number
  }
  activeEntryPoints: ActionHashB64[]
  projectMeta: WithActionHash<ProjectMeta>
  entryPoints: ProjectEntryPointsState
  outcomeMembers: ProjectOutcomeMembersState
  connections: ProjectConnectionsState
  connectionConnectorFromAddress: ActionHashB64
  connectionConnectorRelation: RelationInput
  outcomeFormIsOpen: boolean
  outcomeFormFromActionHash: ActionHashB64
  outcomeFormRelation: RelationInput
  hoveredConnectionActionHash: ActionHashB64
  selectedConnections: ActionHashB64[]
  selectedOutcomes: ActionHashB64[]
  connectionConnectorToAddress: ActionHashB64
  mouseLiveCoordinate: {
    x: number
    y: number
  }
  shiftKeyDown: boolean
  outcomeFormLeftConnectionX: number
  outcomeFormTopConnectionY: number
  startedSelection: boolean
  startedSelectionCoordinate: {
    x: number
    y: number
  }
  currentSelectionBoxSize: {
    w: number
    h: number
  }
  coordinates: {
    [outcomeActionHash: ActionHashB64]: {
      x: number
      y: number
    }
  }
  computedOutcomesKeyed: {
    [actionHash: string]: ComputedOutcome
  }
}

// Render is responsible for painting all the existing outcomes & connections,
// as well as the yet to be created (pending) ones (For new Outcome / new Connection / edit Connection)
// render the state contained in store onto the canvas
// `store` is a redux store
// `canvas` is a reference to an HTML5 canvas DOM element
function render(
  {
    projectTags,
    screenWidth,
    screenHeight,
    zoomLevel,
    coordinates,
    translate,
    activeEntryPoints,
    computedOutcomesKeyed,
    connections,
    outcomeMembers,
    entryPoints,
    projectMeta,
    connectionConnectorFromAddress,
    connectionConnectorRelation,
    outcomeFormIsOpen,
    outcomeFormFromActionHash,
    outcomeFormRelation,
    hoveredConnectionActionHash,
    selectedConnections,
    selectedOutcomes,
    connectionConnectorToAddress,
    mouseLiveCoordinate,
    shiftKeyDown,
    outcomeFormLeftConnectionX,
    outcomeFormTopConnectionY,
    startedSelection,
    startedSelectionCoordinate,
  }: renderProps,
  canvas: HTMLCanvasElement
) {
  // Get the 2 dimensional drawing context of the canvas (there is also 3 dimensional, e.g.)
  const ctx = setupCanvas(canvas)

  // zoomLevel x, skew x, skew y, zoomLevel y, translate x, and translate y
  ctx.setTransform(1, 0, 0, 1, 0, 0) // normalize
  // clear the entirety of the canvas
  ctx.clearRect(0, 0, screenWidth, screenHeight)

  // zoomLevel all drawing operations by the dpr, as well as the zoom, so you
  // don't have to worry about the difference.
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(
    zoomLevel * dpr,
    0,
    0,
    zoomLevel * dpr,
    translate.x * dpr,
    translate.y * dpr
  )

  const outcomes = computedOutcomesKeyed

  // draw things relating to the project, if the project has fully loaded
  if (outcomes && connections && outcomeMembers && entryPoints && projectMeta) {
    const topPriorityOutcomes = projectMeta.topPriorityOutcomes
    // converts the outcomes object to an array
    const outcomesAsArray = Object.keys(outcomes).map(
      (actionHash) => outcomes[actionHash]
    )
    // convert the connections object to an array
    const connectionsAsArray = Object.keys(connections).map(
      (actionHash) => connections[actionHash]
    )

    /*
      DRAW ENTRY POINTS
    */
    const activeEntryPointsObjects = activeEntryPoints.map(
      (entryPointAddress) => entryPoints[entryPointAddress]
    )
    drawEntryPoints(
      ctx,
      activeEntryPointsObjects,
      outcomes,
      connectionsAsArray,
      coordinates,
      zoomLevel,
      projectTags
    )

    /*
      DRAW CONNECTIONS (EXISTING)
    */
    // render each connection to the canvas, basing it off the rendering coordinates of the parent and child nodes
    connectionsAsArray.forEach(function (connection) {
      // if in the pending re-parenting mode for the child card of an existing connection,
      // temporarily omit/hide the existing connection from view
      // ASSUMPTION: one parent
      const pendingReParent =
        (connectionConnectorFromAddress === connection.childActionHash &&
          connectionConnectorRelation === RELATION_AS_CHILD) ||
        (outcomeFormIsOpen &&
          outcomeFormFromActionHash === connection.childActionHash &&
          outcomeFormRelation === RELATION_AS_CHILD)
      if (pendingReParent) return

      const childCoords = coordinates[connection.childActionHash]
      const parentCoords = coordinates[connection.parentActionHash]
      const childOutcome = outcomes[connection.childActionHash]
      const parentOutcome = outcomes[connection.parentActionHash]
      // we can only render this connection
      // if we know the coordinates of the Outcomes it connects
      if (childCoords && parentCoords && parentOutcome && childOutcome) {
        const [
          connection1port,
          connection2port,
        ] = calculateConnectionCoordsByOutcomeCoords(
          childCoords,
          parentCoords,
          parentOutcome,
          projectTags,
          zoomLevel,
          ctx
        )
        const isHovered = hoveredConnectionActionHash === connection.actionHash
        const isSelected = selectedConnections.includes(connection.actionHash)
        drawConnection({
          connection1port,
          connection2port,
          ctx,
          isAchieved:
            childOutcome.computedAchievementStatus.simple ===
            ComputedSimpleAchievementStatus.Achieved,
          isHovered,
          isSelected,
        })
      }
    })

    /*
      SEPARATE SELECTED & UNSELECTED OUTCOMES
    */
    // in order to create layers behind and in front of the editing highlight overlay
    const unselectedOutcomes = outcomesAsArray.filter((outcome) => {
      return selectedOutcomes.indexOf(outcome.actionHash) === -1
    })
    const selectedOutcomesActual = outcomesAsArray.filter((outcome) => {
      return selectedOutcomes.indexOf(outcome.actionHash) > -1
    })

    /*
      DRAW UNSELECTED OUTCOMES
    */
    // render each unselected outcome to the canvas
    unselectedOutcomes.forEach((outcome) => {
      // use the set of coordinates at the same index
      // in the coordinates array
      const isSelected = false
      // const isHovered = state.ui.hover.hoveredOutcome === outcome.actionHash
      // const isEditing = false
      // let editInfoObjects = Object.values(state.ui.realtimeInfo).filter(
      //   (agentInfo) =>
      //     agentInfo.outcomeBeingEdited !== null &&
      //     agentInfo.outcomeBeingEdited.outcomeActionHash === outcome.actionHash
      // )
      // const isBeingEdited = editInfoObjects.length > 0
      // const isBeingEditedBy =
      //   editInfoObjects.length === 1
      //     ? state.agents[editInfoObjects[0].agentPubKey].handle
      //     : editInfoObjects.length > 1
      //     ? `${editInfoObjects.length} people`
      //     : null
      // a combination of those editing + those with expanded view open
      // const allMembersActiveOnOutcome = Object.values(state.ui.realtimeInfo)
      //   .filter(
      //     (agentInfo) =>
      //       agentInfo.outcomeExpandedView === outcome.actionHash ||
      //       (agentInfo.outcomeBeingEdited !== null &&
      //         agentInfo.outcomeBeingEdited.outcomeActionHash ===
      //           outcome.actionHash)
      //   )
      //   .map(
      //     (realtimeInfoObject) => state.agents[realtimeInfoObject.agentPubKey]
      //   )

      // const membersOfOutcome = Object.keys(outcomeMembers)
      //   .map(actionHash => outcomeMembers[actionHash])
      //   .filter(outcomeMember => outcomeMember.outcomeActionHash === outcome.actionHash)
      //   .map(outcomeMember => state.agents[outcomeMember.memberAgentPubKey])
      const isTopPriorityOutcome = !!topPriorityOutcomes.find(
        (actionHash) => actionHash === outcome.actionHash
      )
      if (coordinates[outcome.actionHash]) {
        drawOutcomeCard({
          zoomLevel: zoomLevel,
          outcome: outcome,
          outcomeLeftX: coordinates[outcome.actionHash].x,
          outcomeTopY: coordinates[outcome.actionHash].y,
          isSelected: isSelected,
          ctx: ctx,
          isTopPriority: isTopPriorityOutcome,
          outcomeHeight: getOutcomeHeight({
            ctx,
            outcome,
            projectTags,
            zoomLevel: zoomLevel,
            width: outcomeWidth,
          }),
          outcomeWidth: outcomeWidth,
          projectTags,
          // members: membersOfOutcome,
          // isEditing: isEditing, // self
          // editText: '',
          // isHovered: isHovered,
          // isBeingEdited: isBeingEdited, // by other
          // isBeingEditedBy: isBeingEditedBy, // other
          // allMembersActiveOnOutcome: allMembersActiveOnOutcome,
        })
      }
    })

    /*
      DRAW SELECT BOX
    */
    if (
      shiftKeyDown &&
      startedSelection &&
      startedSelectionCoordinate.x !== 0
    ) {
      drawSelectBox(
        startedSelectionCoordinate,
        mouseLiveCoordinate,
        canvas.getContext('2d')
      )
    }

    /*
      DRAW EDITING HIGHLIGHT SEMI-TRANSPARENT OVERLAY
    */
    /* if shift key not held down and there are more than 1 Outcomes selected */
    if (selectedOutcomes.length > 1 && !shiftKeyDown) {
      // counteract the translation
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      drawOverlay(ctx, 0, 0, screenWidth, screenHeight)
      ctx.restore()
    }

    /*
      DRAW SELECTED OUTCOMES
    */
    selectedOutcomesActual.forEach((outcome) => {
      // use the set of coordinates at the same index
      // in the coordinates array
      const isSelected = true
      // const isHovered = state.ui.hover.hoveredOutcome === outcome.actionHash
      // const isEditing = false
      // let editInfoObjects = Object.values(state.ui.realtimeInfo).filter(
      //   (agentInfo) =>
      //     agentInfo.outcomeBeingEdited !== null &&
      //     agentInfo.outcomeBeingEdited.outcomeActionHash === outcome.actionHash
      // )
      // const isBeingEdited = editInfoObjects.length > 0
      // const isBeingEditedBy =
      //   editInfoObjects.length === 1
      //     ? state.agents[editInfoObjects[0].agentPubKey].handle
      //     : editInfoObjects.length > 1
      //     ? `${editInfoObjects.length} people`
      //     : null
      // a combination of those editing + those with expanded view open
      // const allMembersActiveOnOutcome = Object.values(state.ui.realtimeInfo)
      //   .filter(
      //     (agentInfo) =>
      //       agentInfo.outcomeExpandedView === outcome.actionHash ||
      //       (agentInfo.outcomeBeingEdited !== null &&
      //         agentInfo.outcomeBeingEdited.outcomeActionHash ===
      //           outcome.actionHash)
      //   )
      //   .map(
      //     (realtimeInfoObject) => state.agents[realtimeInfoObject.agentPubKey]
      //   )
      // const membersOfOutcome = Object.keys(outcomeMembers)
      //   .map((actionHash) => outcomeMembers[actionHash])
      //   .filter(
      //     (outcomeMember) =>
      //       outcomeMember.outcomeActionHash === outcome.actionHash
      //   )
      //   .map((outcomeMember) => state.agents[outcomeMember.memberAgentPubKey])
      const isTopPriorityOutcome = !!topPriorityOutcomes.find(
        (actionHash) => actionHash === outcome.actionHash
      )
      if (coordinates[outcome.actionHash]) {
        drawOutcomeCard({
          zoomLevel: zoomLevel,
          outcome: outcome,
          outcomeLeftX: coordinates[outcome.actionHash].x,
          outcomeTopY: coordinates[outcome.actionHash].y,
          isSelected: isSelected,
          ctx: ctx,
          isTopPriority: isTopPriorityOutcome,
          outcomeHeight: getOutcomeHeight({
            ctx,
            outcome,
            projectTags,
            zoomLevel: zoomLevel,
            width: outcomeWidth,
          }),
          outcomeWidth,
          projectTags,
          // members: membersOfOutcome,
          // isEditing: isEditing,
          // editText: '',
          // isHovered: isHovered,
          // isBeingEdited: isBeingEdited,
          // isBeingEditedBy: isBeingEditedBy,
          // allMembersActiveOnOutcome: allMembersActiveOnOutcome,
        })
      }
    })

    /*
      DRAW PENDING CONNECTION FOR OUTCOME FORM
    */
    // render the connection that is pending to be created to the open outcome form
    if (outcomeFormIsOpen && outcomeFormFromActionHash) {
      const fromOutcomeCoords = coordinates[outcomeFormFromActionHash]
      const newOutcomeCoords = {
        x: outcomeFormLeftConnectionX,
        y: outcomeFormTopConnectionY,
      }
      const fromOutcome = outcomes[outcomeFormFromActionHash]
      let childCoords, parentCoords
      if (outcomeFormRelation === RELATION_AS_CHILD) {
        childCoords = fromOutcomeCoords
        parentCoords = newOutcomeCoords
      } else if (outcomeFormRelation === RELATION_AS_PARENT) {
        childCoords = newOutcomeCoords
        parentCoords = fromOutcomeCoords
      }
      if (childCoords && parentCoords && fromOutcome) {
        const [
          connection1port,
          connection2port,
        ] = calculateConnectionCoordsByOutcomeCoords(
          childCoords,
          parentCoords,
          fromOutcome,
          projectTags,
          zoomLevel,
          ctx
        )
        drawConnection({
          connection1port,
          connection2port,
          ctx,
          isAchieved: false,
          isSelected: false,
          isHovered: false,
        })
      }
    }

    /*
      DRAW PENDING CONNECTION FOR "CONNECTION CONNECTOR"
    */
    // render the connection that is pending to be created between existing Outcomes
    if (connectionConnectorFromAddress) {
      const fromCoords = coordinates[connectionConnectorFromAddress]
      const fromOutcome = outcomes[connectionConnectorFromAddress]
      const [
        fromAsChildCoord,
        fromAsParentCoord,
      ] = calculateConnectionCoordsByOutcomeCoords(
        fromCoords,
        fromCoords,
        fromOutcome,
        projectTags,
        zoomLevel,
        ctx
      )
      // if there's an Outcome this is pending
      // as being "to", then we will be drawing the connection to its correct
      // upper or lower port
      // the opposite of whichever the "from" port is connected to
      let toCoords, toOutcome, toAsChildCoord, toAsParentCoord
      if (connectionConnectorToAddress) {
        toCoords = coordinates[connectionConnectorToAddress]
        toOutcome = outcomes[connectionConnectorToAddress]
        ;[
          toAsChildCoord,
          toAsParentCoord,
        ] = calculateConnectionCoordsByOutcomeCoords(
          toCoords,
          toCoords,
          toOutcome,
          projectTags,
          zoomLevel,
          ctx
        )
      }
      // in drawConnection, it draws at exactly the two coordinates given,
      // so we could pass them in either order/position
      const fromConnectionCoord =
        connectionConnectorRelation === RELATION_AS_PARENT
          ? fromAsParentCoord
          : fromAsChildCoord
      // use the current mouse coordinate position, liveCoordinate, by default
      let toConnectionCoord = mouseLiveCoordinate
      // use the coordinates relating to an Outcome which it is pending that
      // this connection will connect the "from" Outcome "to"
      if (connectionConnectorToAddress) {
        toConnectionCoord =
          connectionConnectorRelation === RELATION_AS_PARENT
            ? toAsChildCoord
            : toAsParentCoord
      }
      if (connectionConnectorRelation === RELATION_AS_CHILD) {
        fromConnectionCoord.y =
          fromConnectionCoord.y - CONNECTOR_VERTICAL_SPACING
        // only modify if we're dealing with an actual outcome being connected to
        if (connectionConnectorToAddress)
          toConnectionCoord.y = toConnectionCoord.y + CONNECTOR_VERTICAL_SPACING
      } else if (connectionConnectorRelation === RELATION_AS_PARENT) {
        fromConnectionCoord.y =
          fromConnectionCoord.y + CONNECTOR_VERTICAL_SPACING
        // only modify if we're dealing with an actual outcome being connected to
        if (connectionConnectorToAddress)
          toConnectionCoord.y = toConnectionCoord.y - CONNECTOR_VERTICAL_SPACING
      }
      drawConnection({
        connection1port: fromConnectionCoord,
        connection2port: toConnectionCoord,
        ctx,
        isAchieved: false,
        isHovered: false,
        isSelected: false,
      })
    }
  }

  /*
    DRAW NEW OUTCOME PLACEHOLDER
  */
  // creating a new Outcome
  if (outcomeFormIsOpen) {
    const isHovered = false
    const isSelected = false
    const isEditing = true
    const isTopPriorityOutcome = false
    drawOutcomeCard({
      zoomLevel: zoomLevel,
      outcome: {
        actionHash: '',
        content: '',
        creatorAgentPubKey: '',
        editorAgentPubKey: '',
        timestampCreated: Date.now(),
        timestampUpdated: Date.now(),
        scope: {
          Uncertain: { smallsEstimate: 0, timeFrame: null, inBreakdown: false },
        },
        tags: [],
        description: '',
        isImported: false,
        githubLink: '',
        computedScope: ComputedScope.Uncertain,
        computedAchievementStatus: {
          simple: ComputedSimpleAchievementStatus.NotAchieved,
          smallsAchieved: 0,
          smallsTotal: 0,
          tasksAchieved: 0,
          tasksTotal: 0,
          uncertains: 0,
        },
        children: [],
      },
      outcomeHeight: outcomeHeight,
      outcomeWidth,
      projectTags,
      outcomeLeftX: outcomeFormLeftConnectionX,
      outcomeTopY: outcomeFormTopConnectionY,
      isSelected: isSelected,
      ctx: ctx,
      isTopPriority: isTopPriorityOutcome,
      // members: [],
      // isEditing: isEditing,
      // editText: state.ui.outcomeForm.content,
      // isHovered: isHovered,
      // isBeingEdited: false,
      // isBeingEditedBy: '',
      // allMembersActiveOnOutcome: [],
    })
  }
}

export default render
