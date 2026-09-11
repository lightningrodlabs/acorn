/**
 * Whether a scrolling list is at, or within `threshold` px of, its bottom --
 * i.e. the reader is following the newest items rather than reading back.
 * A list whose content fits without scrolling counts as at the bottom.
 */
export function isNearBottom(
  el: { scrollTop: number; scrollHeight: number; clientHeight: number },
  threshold = 40
): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
}
