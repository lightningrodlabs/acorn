import { ActionHashB64 } from '../../../types/shared'
import { DetailBandsState } from '../../../drawing/detailBands'

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
  // present when focus+context (Degree-of-Interest based) rendering
  // is active, it maps each Outcome to its level of rendered detail
  detailBands?: DetailBandsState
}
