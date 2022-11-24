import {
  checkForOutcomeAtCoordinates,
  checkForConnectionAtCoordinates,
} from '../drawing/eventDetection'
import { RootState } from '../redux/reducer'
import { ComputedOutcome } from '../types'
import { ActionHashB64 } from '../types/shared'

export enum OutcomeConnectionOrBoth {
  Both,
  Outcome,
  Connection,
}

export default function checkForOutcomeOrConnection(
  outcomeConnectionOrBoth: OutcomeConnectionOrBoth,
  state: RootState,
  x: number,
  y: number,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome },
  ctx: CanvasRenderingContext2D,
  extraVerticalPadding?: number
) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
    },
  } = state
  const projectTags = Object.values(state.projects.tags[activeProject] || {})
  const connections = state.projects.connections[activeProject] || {}
  const outcomeCoordinates = state.ui.layout

  const doCheckOutcomes =
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Both ||
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Outcome
  const doCheckConnections =
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Both ||
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Connection

  return {
    outcomeActionHash: doCheckOutcomes
      ? checkForOutcomeAtCoordinates(
          ctx,
          translate,
          scale,
          outcomeCoordinates,
          projectTags,
          x,
          y,
          outcomes,
          extraVerticalPadding
        )
      : null,
    connectionActionHash: doCheckConnections
      ? checkForConnectionAtCoordinates(
          ctx,
          translate,
          scale,
          outcomeCoordinates,
          projectTags,
          connections,
          x,
          y,
          outcomes
        )
      : null,
  }
}
