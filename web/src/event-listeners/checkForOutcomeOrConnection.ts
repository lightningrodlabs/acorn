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
  extraVerticalPadding?: number
) {
  const {
    ui: {
      activeProject,
      viewport: { translate, scale },
    },
  } = state
  const connections = state.projects.connections[activeProject] || {}
  const outcomesCoordinates = state.ui.layout.coordinates
  const outcomesDimensions = state.ui.layout.dimensions

  const doCheckOutcomes =
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Both ||
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Outcome
  const doCheckConnections =
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Both ||
    outcomeConnectionOrBoth === OutcomeConnectionOrBoth.Connection

  return {
    outcomeActionHash: doCheckOutcomes
      ? checkForOutcomeAtCoordinates(
          translate,
          scale,
          outcomesCoordinates,
          outcomesDimensions,
          x,
          y,
          outcomes,
          extraVerticalPadding
        )
      : null,
    connectionActionHash: doCheckConnections
      ? checkForConnectionAtCoordinates(
          translate,
          scale,
          outcomesCoordinates,
          outcomesDimensions,
          connections,
          x,
          y,
          outcomes
        )
      : null,
  }
}
