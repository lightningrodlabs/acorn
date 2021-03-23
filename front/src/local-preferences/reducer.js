

import { SET_NAVIGATION_PREFERENCE } from './actions'

const LOCAL_STORAGE_PREFIX = 'acorn-'
const getLocalItem = key => {
  return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
}
const setLocalItem = (key, value) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, value)
}

const NAV_KEY = 'navigationPreference'
export const MOUSE = 'mouse'
export const TRACKPAD = 'trackpad'

const defaultState = {
  navigation: getLocalItem(NAV_KEY) || TRACKPAD,
}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
    case SET_NAVIGATION_PREFERENCE:
      //side effect, which will ensure that on reload
      // we still have the preference
      setLocalItem(NAV_KEY, payload)
      return {
        ...state,
        navigation: payload,
      }
    default:
      return state
  }
}
