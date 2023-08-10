import {
  SET_USE_KEYBOARD_NAVIGATION as SET_USE_COORDS_NAVIGATION,
  SET_USE_MODAL_NAVIGATION,
} from './actions'

export enum NavigationPreference {
  UseModal,
  UseCoords,
}
type NavigationPreferenceState = {
  navigationPreference: NavigationPreference
}
const defaultState: NavigationPreferenceState = {
  navigationPreference: NavigationPreference.UseModal,
}

export default function (
  state = defaultState,
  action: any
): typeof defaultState {
  const { type } = action
  switch (type) {
    case SET_USE_COORDS_NAVIGATION:
      return {
        ...state,
        navigationPreference: NavigationPreference.UseCoords,
      }
    case SET_USE_MODAL_NAVIGATION:
      return {
        ...state,
        navigationPreference: NavigationPreference.UseModal,
      }
    default:
      return state
  }
}
