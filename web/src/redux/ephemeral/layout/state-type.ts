import { ActionHashB64 } from '../../../types/shared'

export interface LayoutState {
  // the x,y coordinate represents the upper left corner of the
  // Outcome "card" in the Map View
  [outcomeActionHash: ActionHashB64]: {
    x: number
    y: number
  }
}
