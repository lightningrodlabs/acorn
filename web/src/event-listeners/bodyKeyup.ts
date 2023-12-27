import { unsetShiftKeyDown } from '../redux/ephemeral/keyboard/actions'

export default function bodyKeyup(store: any, event: KeyboardEvent) {
  // there are event.code and event.key ...
  // event.key is keyboard layout independent, so works for Dvorak users
  switch (event.key) {
    case 'Shift':
      store.dispatch(unsetShiftKeyDown())
      break
    default:
      // console.log(event)
      break
  }
}
