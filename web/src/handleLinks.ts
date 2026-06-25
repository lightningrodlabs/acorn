/**
 * handleLinks — detect in-text node references written as `[[handle]]` and turn
 * them into navigable links.
 *
 * A node's handle (an author-assigned slug, see nodeRef.ts) can be mentioned in
 * any rendered prose — an outcome/spec markdown field, a completion criterion, a
 * chat message — by wrapping it in double square brackets: `[[work-loop]]`. This
 * module owns the PURE half of the feature:
 *   • splitHandleTokens — split a string into plain-text and handle tokens
 *   • parseHandleLinks   — the same split, with each handle resolved to a node
 *                          (actionHash) or null for an unknown handle
 *   • remarkHandleLinks  — a remark (mdast) plugin that rewrites `[[handle]]`
 *                          text into link nodes for react-markdown to render
 *
 * It is intentionally free of React, redux, and react-markdown imports so it is
 * unit-testable on its own. Resolution is injected (a `resolve` callback, wired
 * to nodeRef.resolveRef by the caller), and the decision to render an unresolved
 * handle as plain text (never a broken link) lives in the renderer.
 */

/** URL scheme used to carry a handle through react-markdown to the link renderer. */
export const HANDLE_URI_PREFIX = 'handle:'

/**
 * Matches `[[handle]]` where handle is a slug: starts alphanumeric, then
 * lower-case alphanumerics and dashes — the same shape validateHandle enforces.
 * A fresh RegExp is returned each call so the global `lastIndex` never leaks
 * between scans.
 */
export function handleTokenRegex(): RegExp {
  return /\[\[([a-z0-9][a-z0-9-]*)\]\]/g
}

export type HandleToken =
  | { type: 'text'; value: string }
  | { type: 'handle'; handle: string; raw: string }

export type HandleSegment =
  | { type: 'text'; value: string }
  | {
      type: 'handle'
      handle: string
      raw: string
      /** resolved node identity, or null when the handle names no node */
      actionHash: string | null
    }

/**
 * Split `text` into a sequence of plain-text and handle tokens. Pure: no
 * resolution, just detection. A string with no `[[handle]]` yields a single
 * text token (so callers can always map over the result).
 */
export function splitHandleTokens(text: string): HandleToken[] {
  const out: HandleToken[] = []
  if (typeof text !== 'string' || text.length === 0) {
    return [{ type: 'text', value: text || '' }]
  }
  const re = handleTokenRegex()
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: 'text', value: text.slice(last, m.index) })
    }
    out.push({ type: 'handle', handle: m[1], raw: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) {
    out.push({ type: 'text', value: text.slice(last) })
  }
  if (out.length === 0) out.push({ type: 'text', value: text })
  return out
}

/**
 * Split `text` and resolve each handle token to a node actionHash (or null).
 * `resolve` is the injected resolver — wire it to nodeRef.resolveRef(project, …).
 * This is the unit-tested core of the text-to-links transform: it detects
 * `[[handle]]` tokens and maps each to its node, or null when unknown.
 */
export function parseHandleLinks(
  text: string,
  resolve: (handle: string) => string | null
): HandleSegment[] {
  return splitHandleTokens(text).map((tok) =>
    tok.type === 'text'
      ? tok
      : { ...tok, actionHash: resolve(tok.handle) }
  )
}

/**
 * remark (mdast) plugin: rewrite `[[handle]]` occurrences inside text nodes into
 * mdast `link` nodes whose url is `handle:<handle>`, so react-markdown emits an
 * anchor the renderer can intercept. Resolution is NOT done here — every handle
 * becomes a link; the renderer decides resolved-vs-plain. Code and existing
 * links are left untouched (no linkifying inside code, no nested links).
 */
export function remarkHandleLinks() {
  return (tree: any) => {
    transformNode(tree)
  }
}

function transformNode(node: any): void {
  if (!node || !Array.isArray(node.children)) return
  const next: any[] = []
  for (const child of node.children) {
    if (child && child.type === 'text' && typeof child.value === 'string') {
      const tokens = splitHandleTokens(child.value)
      const hasHandle = tokens.some((t) => t.type === 'handle')
      if (!hasHandle) {
        next.push(child)
        continue
      }
      for (const tok of tokens) {
        if (tok.type === 'text') {
          if (tok.value) next.push({ type: 'text', value: tok.value })
        } else {
          next.push({
            type: 'link',
            url: HANDLE_URI_PREFIX + tok.handle,
            children: [{ type: 'text', value: tok.handle }],
          })
        }
      }
    } else {
      // Don't linkify inside code spans/blocks or descend into existing links.
      if (child && child.type !== 'code' && child.type !== 'inlineCode' && child.type !== 'link') {
        transformNode(child)
      }
      next.push(child)
    }
  }
  node.children = next
}
