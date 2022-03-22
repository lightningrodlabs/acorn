import {
  SET_NAVIGATION_PREFERENCE,
  SET_HAS_ACCESSED_GUIDEBOOK
} from './actions'

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

const HAS_ACCESSED_GUIDEBOOK_KEY = 'hasAccessedGuidebook'

const defaultState = {
  navigation: getLocalItem(NAV_KEY) || TRACKPAD,
  hasAccessedGuidebook: JSON.parse(getLocalItem(HAS_ACCESSED_GUIDEBOOK_KEY))
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
        navigation: payload
      }
    case SET_HAS_ACCESSED_GUIDEBOOK:
      // persist this knowlconnection to localStorage
      // so that we remember beyond page refreshes
      setLocalItem(HAS_ACCESSED_GUIDEBOOK_KEY, payload)
      return {
        // keep the rest of the state the same
        ...state,
        // while updating/modifying the hasAccessedGuidebook value
        hasAccessedGuidebook: payload
      }
    default:
      return state
  }
}
