import {
  SET_KEYBOARD_NAVIGATION_PREFERENCE,
  SET_NAVIGATION_PREFERENCE,
} from './actions'

const LOCAL_STORAGE_PREFIX = 'acorn-'
const getLocalItem = (key) => {
  return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
}
const setLocalItem = (key, value) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, value)
}

const KEYBOARD_NAV_KEY = 'keyboardNavigationPreference'
export const COORDINATES = 'coordinates'
export const MODAL = 'modal'
export type KeyboardNavigationPreference = typeof COORDINATES | typeof MODAL

const NAV_KEY = 'navigationPreference'
export const MOUSE = 'mouse'
export const TRACKPAD = 'trackpad'
export type NavigationPreference = typeof MOUSE | typeof TRACKPAD

const defaultState = {
  // default to trackpad navigation
  navigation: getLocalItem(NAV_KEY) || TRACKPAD,
  // default to modal keyboard navigation
  keyboardNavigation: getLocalItem(KEYBOARD_NAV_KEY) || MODAL,
}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_NAVIGATION_PREFERENCE:
      // side effect, which will ensure that on reload
      // we still have the preference
      setLocalItem(NAV_KEY, payload)
      return {
        ...state,
        navigation: payload,
      }

    case SET_KEYBOARD_NAVIGATION_PREFERENCE:
      setLocalItem(KEYBOARD_NAV_KEY, payload)
      return {
        ...state,
        keyboardNavigation: payload,
      }
    default:
      return state
  }
}
