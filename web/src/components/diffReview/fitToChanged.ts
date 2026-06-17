import { Store } from 'redux'
import { changeAllDirect } from '../../redux/ephemeral/viewport/actions'

// Fit the viewport to the bounding box of a SET of changed nodes (no node
// selected), so "what changed" is framed automatically. Mirrors the transform
// math in panZoomToFrame (screen_pos = coord*scale + translate, dpr-adjusted)
// but for a set of nodes rather than one. Reads the settled layout, so call it
// after the layout animation rather than synchronously on apply.
//
// Lifted out of AgentDiffTools (clarity-tree branch I, i3c) so the draft-overlay
// pipeline (L2/L4) can reuse the exact same framing path.
export function fitToChanged(store: Store, touched: string[]): void {
  if (!touched.length) return
  const s: any = store.getState()
  const coords = s.ui.layout.coordinates || {}
  const dims = s.ui.layout.dimensions || {}
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  let found = false
  for (const h of touched) {
    const c = coords[h]
    const d = dims[h]
    if (!c || !d) continue
    found = true
    minX = Math.min(minX, c.x)
    minY = Math.min(minY, c.y)
    maxX = Math.max(maxX, c.x + d.width)
    maxY = Math.max(maxY, c.y + d.height)
  }
  if (!found) return
  const dpr = window.devicePixelRatio || 1
  const screenW = s.ui.screensize.width / dpr
  const screenH = s.ui.screensize.height / dpr
  const bboxW = Math.max((maxX - minX) * 1.3, 1) // 30% margin
  const bboxH = Math.max((maxY - minY) * 1.3, 1)
  let scale = Math.min(screenW / bboxW, screenH / bboxH)
  scale = Math.max(0.1, Math.min(scale, 0.7)) // don't over-zoom a lone node
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  store.dispatch(
    changeAllDirect({
      scale,
      translate: { x: screenW / 2 - cx * scale, y: screenH / 2 - cy * scale },
    })
  )
}

export default fitToChanged
