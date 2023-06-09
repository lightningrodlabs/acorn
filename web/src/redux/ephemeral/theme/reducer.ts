import { SET_COLOR_PREFERENCE } from './actions'

const LOCAL_STORAGE_PREFIX = 'acorn-'
const getLocalItem = (key) => {
  return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
}
const setLocalItem = (key, value) => {
  localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, value)
}

const COLOR_KEY = 'colorPreference'
export const LIGHT = 'light'
export const DARK = 'dark'

const defaultState = {
  color: getLocalItem(COLOR_KEY) || LIGHT,
}

export default function (state = defaultState, action) {
  const { payload, type } = action
  switch (type) {
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
