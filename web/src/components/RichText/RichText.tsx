import React, { useContext, useMemo } from 'react'
import ReactMarkdown, { uriTransformer } from 'react-markdown'
import type { PluggableList } from 'react-markdown/lib/react-markdown'
import { ReactReduxContext } from 'react-redux'

import { resolveRef } from '../../nodeRef'
import { animatePanAndZoom } from '../../redux/ephemeral/viewport/actions'
import {
  HANDLE_URI_PREFIX,
  remarkHandleLinks,
} from '../../handleLinks'
import './RichText.scss'

export type RichTextProps = {
  /** markdown source text */
  source: string
  /** extra remark plugins (e.g. remark-gfm for chat) — handle links are always appended */
  remarkPlugins?: PluggableList
  className?: string
}

// Allow our `handle:` scheme through react-markdown's URL sanitizer; everything
// else falls back to the default (safe) transformer.
function transformLinkUri(uri: string): string {
  if (typeof uri === 'string' && uri.startsWith(HANDLE_URI_PREFIX)) return uri
  return uriTransformer(uri)
}

/**
 * RichText — render markdown with `[[handle]]` node references turned into
 * clickable links. Clicking a resolved handle selects its node and centres the
 * map on it; an unknown handle renders as plain (dim) text, never a broken link.
 *
 * Resolution + navigation read the live redux store via ReactReduxContext, which
 * is null-safe: outside a redux Provider (e.g. Storybook) handles simply render
 * as plain text rather than throwing.
 */
const RichText: React.FC<RichTextProps> = ({
  source,
  remarkPlugins,
  className,
}) => {
  const reduxContext = useContext(ReactReduxContext)
  const store = reduxContext ? reduxContext.store : null

  const components = useMemo(() => {
    // Resolve a handle to an actionHash against the currently active project.
    const resolve = (handle: string): string | null => {
      if (!store) return null
      const state: any = store.getState()
      const projectId = state?.ui?.activeProject
      const outcomes = (projectId && state?.projects?.outcomes?.[projectId]) || {}
      return resolveRef({ outcomes }, handle)
    }
    const navigate = (actionHash: string) => {
      if (store) store.dispatch(animatePanAndZoom(actionHash, true) as any)
    }

    const Anchor: React.FC<any> = ({ href, children, ...rest }) => {
      if (typeof href === 'string' && href.startsWith(HANDLE_URI_PREFIX)) {
        const handle = href.slice(HANDLE_URI_PREFIX.length)
        const actionHash = resolve(handle)
        if (!actionHash) {
          // Unknown handle: plain, dim text — never a broken link.
          return (
            <span className="handle-ref handle-ref--unresolved" title={`Unknown node: ${handle}`}>
              {children}
            </span>
          )
        }
        return (
          <a
            className="handle-ref"
            href="#"
            title={`Go to ${handle}`}
            onClick={(e) => {
              e.preventDefault()
              // Don't let the click bubble to a parent (e.g. the field's
              // click-to-edit overlay) — a handle click navigates, nothing else.
              e.stopPropagation()
              navigate(actionHash)
            }}
          >
            {children}
          </a>
        )
      }
      // Ordinary link: open externally, preserve default behavior.
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      )
    }

    return { a: Anchor }
  }, [store])

  const plugins: PluggableList = [...(remarkPlugins || []), remarkHandleLinks]

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={plugins}
      components={components}
      transformLinkUri={transformLinkUri}
    >
      {source}
    </ReactMarkdown>
  )
}

export default RichText
