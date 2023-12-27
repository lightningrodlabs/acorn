import { ProjectComputedOutcomes } from '../context/ComputedOutcomeContext'
import { RenderProps } from '../routes/ProjectView/MapView/selectRenderProps'
import drawOutcome from './drawOutcome'
import { ComputedOutcome } from '../types'
import { ActionHashB64 } from '@holochain/client'

export default function drawOutcomeGroup({
  outcomesAsArray,
  coordinates,
  allOutcomeDimensions,
  projectTags,
  topPriorityOutcomes,
  areSelected,
  zoomLevel,
  ctx,
}: {
  outcomesAsArray: ComputedOutcome[]
  coordinates: RenderProps['coordinates']
  allOutcomeDimensions: RenderProps['dimensions']
  projectTags: RenderProps['projectTags']
  topPriorityOutcomes: ActionHashB64[]
  areSelected: boolean
  zoomLevel: RenderProps['zoomLevel']
  ctx: CanvasRenderingContext2D
}) {
  outcomesAsArray.forEach(function (outcome) {
    const coords = coordinates[outcome.actionHash]
    const outcomeDimensions = allOutcomeDimensions[outcome.actionHash]
    const isTopPriorityOutcome = !!topPriorityOutcomes.find(
      (actionHash) => actionHash === outcome.actionHash
    )
    // we can only render this outcome
    // if we know its coordinates
    if (coords) {
      drawOutcome({
        outcome,
        zoomLevel,
        outcomeLeftX: coords.x,
        outcomeTopY: coords.y,
        outcomeHeight: outcomeDimensions.height,
        outcomeWidth: outcomeDimensions.width,
        projectTags,
        useLineLimit: true,
        isTopPriority: isTopPriorityOutcome,
        isSelected: areSelected,
        ctx,
        // outcomeFocusedMembers: [],
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
}

/*
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
  */
