import { ProjectComputedOutcomes } from '../context/ComputedOutcomeContext'
import { RenderProps } from '../routes/ProjectView/MapView/selectRenderProps'
import drawOutcome from './drawOutcome'
import { ComputedOutcome, ComputedScope } from '../types'
import { ActionHashB64 } from '@holochain/client'
import {
  bandCanvasScale,
  bandEffectiveZoom,
  DetailBand,
} from './detailBands'

export default function drawOutcomeGroup({
  outcomesAsArray,
  coordinates,
  allOutcomeDimensions,
  detailBands,
  projectTags,
  topPriorityOutcomes,
  areSelected,
  zoomLevel,
  ctx,
  attachmentCounts = {},
}: {
  outcomesAsArray: ComputedOutcome[]
  coordinates: RenderProps['coordinates']
  allOutcomeDimensions: RenderProps['dimensions']
  detailBands?: RenderProps['detailBands']
  projectTags: RenderProps['projectTags']
  topPriorityOutcomes: ActionHashB64[]
  areSelected: boolean
  zoomLevel: RenderProps['zoomLevel']
  ctx: CanvasRenderingContext2D
  attachmentCounts?: Record<ActionHashB64, number>
}) {
  outcomesAsArray.forEach(function (outcome) {
    const coords = coordinates[outcome.actionHash]
    const outcomeDimensions = allOutcomeDimensions[outcome.actionHash]
    const isTopPriorityOutcome = !!topPriorityOutcomes.find(
      (actionHash) => actionHash === outcome.actionHash
    )
    // when focus+context rendering is active, each Outcome renders its
    // content AS IF the canvas were at the effective zoom level of its
    // detail band, carrying more detail near the focus and less detail
    // (but kept readable) further away. Hidden ones aren't drawn at all.
    // when zoomed out, cards are also scaled up in canvas space (the
    // layout has allocated them that extra room) so they hold a
    // band-dependent minimum readable on-screen size: the card is drawn
    // at its base size under a canvas scale transform
    const band = detailBands ? detailBands[outcome.actionHash] : undefined
    if (band === DetailBand.Hidden) {
      return
    }
    const effectiveZoomLevel = detailBands
      ? bandEffectiveZoom(
          band,
          zoomLevel,
          outcome.computedScope === ComputedScope.Small
        )
      : zoomLevel
    const canvasScale = detailBands ? bandCanvasScale(band, zoomLevel) : 1
    // we can only render this outcome
    // if we know its coordinates
    if (coords) {
      if (canvasScale !== 1) {
        ctx.save()
        ctx.translate(coords.x, coords.y)
        ctx.scale(canvasScale, canvasScale)
      }
      drawOutcome({
        outcome,
        zoomLevel: effectiveZoomLevel,
        outcomeLeftX: canvasScale !== 1 ? 0 : coords.x,
        outcomeTopY: canvasScale !== 1 ? 0 : coords.y,
        outcomeHeight: outcomeDimensions.height / canvasScale,
        outcomeWidth: outcomeDimensions.width / canvasScale,
        projectTags,
        useLineLimit: true,
        noStatementPlaceholder: !!detailBands,
        isTopPriority: isTopPriorityOutcome,
        isSelected: areSelected,
        ctx,
        // attachmentsCount: attachmentCounts[outcome.actionHash] || 0,
        // outcomeFocusedMembers: [],
        // members: membersOfOutcome,
        // isEditing: isEditing, // self
        // editText: '',
        // isHovered: isHovered,
        // isBeingEdited: isBeingEdited, // by other
        // isBeingEditedBy: isBeingEditedBy, // other
        // allMembersActiveOnOutcome: allMembersActiveOnOutcome,
      })
      if (canvasScale !== 1) {
        ctx.restore()
      }
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
