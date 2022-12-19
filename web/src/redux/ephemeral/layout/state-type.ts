import { ActionHashB64 } from '../../../types/shared'

export interface CoordinatesState {
  // the x,y coordinate represents the upper left corner of the
  // Outcome "card" in the Map View
  [outcomeActionHash: ActionHashB64]: {
    x: number
    y: number
  }
}

export interface DimensionsState {
  [outcomeActionHash: ActionHashB64]: {
    width: number
    height: number
  }
}

export interface LayoutState {
  coordinates: CoordinatesState
  dimensions: DimensionsState
}
