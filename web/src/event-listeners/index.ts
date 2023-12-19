import { ActionHashB64 } from '../types/shared'
import { ComputedOutcome} from '../types'
import windowResize from './windowResize'
import bodyKeydown from './bodyKeydown'
import bodyKeyup from './bodyKeyup'
import canvasMousemove from './canvasMousemove'
import canvasWheel from './canvasWheel'
import canvasClick from './canvasClick'
import canvasMousedown from './canvasMousedown'
import canvasMouseup from './canvasMouseup'
import canvasDoubleclick from './canvasDoubleclick'
import canvasContextMenu from './canvasContextMenu'

// outcomes is ComputedOutcomes in an object, keyed by their actionHash
export default function setupEventListeners(
  store: any,
  canvas: HTMLCanvasElement,
  outcomes: { [actionHash: ActionHashB64]: ComputedOutcome }
) {
  // prepare the event listeners
  const onWindowResize = windowResize.bind(null, store, canvas)
  const onBodyKeydown = bodyKeydown.bind(null, store)
  const onBodyKeyup = bodyKeyup.bind(null, store)
  const onCanvasMousemove = canvasMousemove.bind(null, store, outcomes)
  const onCanvasWheel = canvasWheel.bind(null, store)
  const onCanvasClick = canvasClick.bind(null, store, outcomes)
  const onCanvasMousedown = canvasMousedown.bind(null, store)
  const onCanvasMouseup = canvasMouseup.bind(null, store)
  const onCanvasDoubleclick = canvasDoubleclick.bind(null, store, outcomes)
  const onCanvasContextMenu = canvasContextMenu.bind(null, store, outcomes)

  // attach the event listeners
  window.addEventListener('resize', onWindowResize)
  document.body.addEventListener('keydown', onBodyKeydown)
  document.body.addEventListener('keyup', onBodyKeyup)
  canvas.addEventListener('mousemove', onCanvasMousemove)
  canvas.addEventListener('wheel', onCanvasWheel)
  canvas.addEventListener('mousedown', onCanvasMousedown)
  canvas.addEventListener('mouseup', onCanvasMouseup)
  canvas.addEventListener('dblclick', onCanvasDoubleclick)
  // This listener is bound to the canvas only so clicks on other parts of
  // the UI like the OutcomeForm won't trigger it.
  canvas.addEventListener('click', onCanvasClick)
  canvas.addEventListener('contextmenu', onCanvasContextMenu)

  // return a function that will remove the event listeners
  return function cleanup() {
    window.removeEventListener('resize', onWindowResize)
    document.body.removeEventListener('keydown', onBodyKeydown)
    document.body.removeEventListener('keyup', onBodyKeyup)
    canvas.removeEventListener('mousemove', onCanvasMousemove)
    canvas.removeEventListener('wheel', onCanvasWheel)
    canvas.removeEventListener('mousedown', onCanvasMousedown)
    canvas.removeEventListener('mouseup', onCanvasMouseup)
    canvas.removeEventListener('dblclick', onCanvasDoubleclick)
    // This listener is bound to the canvas only so clicks on other parts of
    // the UI like the OutcomeForm won't trigger it.
    canvas.removeEventListener('click', onCanvasClick)
    canvas.removeEventListener('contextmenu', onCanvasContextMenu)
  }
}
