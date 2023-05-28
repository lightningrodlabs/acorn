import { SET_NAVIGATION_PREFERENCE, SET_COLOR_PREFERENCE } from './actions'

const LOCAL_STORAGE_PREFIX = 'acorn-'
const getLocalItem = (key) => {
  return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
}
const setLocalItem = (key, value) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, value)
}

const NAV_KEY = 'navigationPreference'
export const MOUSE = 'mouse'
export const TRACKPAD = 'trackpad'

const COLOR_KEY = 'colorPreference'
export const LIGHT = 'light'
export const DARK = 'dark'

const defaultState = {
  navigation: getLocalItem(NAV_KEY) || TRACKPAD,
  color: getLocalItem(COLOR_KEY) || LIGHT,
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
    case SET_COLOR_PREFERENCE:
      setLocalItem(COLOR_KEY, payload)
      return {
        ...state,
        color: payload
      }
    default:
      return state
  }
}
