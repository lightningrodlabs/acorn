import {
  CoordinatesState,
  DimensionsState,
} from '../redux/ephemeral/layout/state-type'
import { ViewportState } from '../redux/ephemeral/viewport/state-type'

/**
 * Compute the {scale, translate} that frames a set of nodes within the screen,
 * centered, with a margin. Returns null when none of the hashes have a settled
 * layout yet. Mirrors the transform convention used everywhere else
 * (screen_pos = coord * scale + translate, dpr-adjusted) — extracted so both the
 * "fit to changed nodes" diff view and the zoom widget's "fit to screen" button
 * share one implementation.
 */
export function fitViewportToNodes(
  hashes: string[],
  coordinates: CoordinatesState,
  dimensions: DimensionsState,
  screensize: { width: number; height: number },
  opts: { margin?: number; minScale?: number; maxScale?: number } = {}
): ViewportState | null {
  const { margin = 1.1, minScale = 0.1, maxScale = 1 } = opts
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let found = false
  for (const h of hashes) {
    const c = coordinates[h]
    const d = dimensions[h]
    if (!c || !d) continue
    found = true
    minX = Math.min(minX, c.x)
    minY = Math.min(minY, c.y)
    maxX = Math.max(maxX, c.x + d.width)
    maxY = Math.max(maxY, c.y + d.height)
  }
  if (!found) return null
  const dpr = window.devicePixelRatio || 1
  const screenW = screensize.width / dpr
  const screenH = screensize.height / dpr
  const bboxW = Math.max((maxX - minX) * margin, 1)
  const bboxH = Math.max((maxY - minY) * margin, 1)
  let scale = Math.min(screenW / bboxW, screenH / bboxH)
  scale = Math.max(minScale, Math.min(scale, maxScale))
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return {
    scale,
    translate: { x: screenW / 2 - cx * scale, y: screenH / 2 - cy * scale },
  }
}
