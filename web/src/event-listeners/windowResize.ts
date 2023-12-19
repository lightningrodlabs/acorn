import { setScreenDimensions } from '../redux/ephemeral/screensize/actions'

export default function windowResize(store: any, canvas: HTMLCanvasElement) {
  // Get the device pixel ratio, falling back to 1.
  const dpr = window.devicePixelRatio || 1
  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect()
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  store.dispatch(setScreenDimensions(rect.width * dpr, rect.height * dpr))
}
