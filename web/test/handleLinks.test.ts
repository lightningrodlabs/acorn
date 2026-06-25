import { serializeFields, setHandle } from '../src/outcomeFields'
import { resolveRef } from '../src/nodeRef'
import {
  splitHandleTokens,
  parseHandleLinks,
  remarkHandleLinks,
  HANDLE_URI_PREFIX,
} from '../src/handleLinks'

// ---- a tiny live tree, two nodes carry handles ----------------------------
const withHandle = (outcome: string, handle?: string) =>
  handle
    ? setHandle(serializeFields({ outcome }), handle)
    : serializeFields({ outcome })

const WORKLOOP = 'uhCkkWORKLOOP'
const READTREE = 'uhCkkREADTREE'
const NOHANDLE = 'uhCkkPLAIN000'

const project = {
  outcomes: {
    [WORKLOOP]: { actionHash: WORKLOOP, description: withHandle('the loop', 'work-loop') },
    [READTREE]: { actionHash: READTREE, description: withHandle('reads tree', 'read-tree') },
    [NOHANDLE]: { actionHash: NOHANDLE, description: withHandle('no handle') },
  },
}
const resolve = (handle: string) => resolveRef(project, handle)

describe('splitHandleTokens', () => {
  it('returns a single text token when there are no handles', () => {
    expect(splitHandleTokens('plain text, no refs')).toEqual([
      { type: 'text', value: 'plain text, no refs' },
    ])
  })

  it('detects a [[handle]] token amid surrounding text', () => {
    expect(splitHandleTokens('see [[work-loop]] now')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'handle', handle: 'work-loop', raw: '[[work-loop]]' },
      { type: 'text', value: ' now' },
    ])
  })

  it('detects multiple and adjacent handles', () => {
    const out = splitHandleTokens('[[work-loop]][[read-tree]]')
    expect(out).toEqual([
      { type: 'handle', handle: 'work-loop', raw: '[[work-loop]]' },
      { type: 'handle', handle: 'read-tree', raw: '[[read-tree]]' },
    ])
  })

  it('ignores malformed brackets (spaces, capitals, single brackets)', () => {
    for (const s of ['[[Work Loop]]', '[[UPPER]]', '[single]', '[[ spaced ]]']) {
      expect(splitHandleTokens(s)).toEqual([{ type: 'text', value: s }])
    }
  })

  it('handles empty input', () => {
    expect(splitHandleTokens('')).toEqual([{ type: 'text', value: '' }])
  })
})

describe('parseHandleLinks — detection + resolution', () => {
  it('maps a known handle to its node actionHash', () => {
    const segs = parseHandleLinks('go to [[work-loop]]', resolve)
    expect(segs).toEqual([
      { type: 'text', value: 'go to ' },
      {
        type: 'handle',
        handle: 'work-loop',
        raw: '[[work-loop]]',
        actionHash: WORKLOOP,
      },
    ])
  })

  it('maps an unknown handle to null (never a broken link)', () => {
    const segs = parseHandleLinks('[[does-not-exist]]', resolve)
    expect(segs).toEqual([
      {
        type: 'handle',
        handle: 'does-not-exist',
        raw: '[[does-not-exist]]',
        actionHash: null,
      },
    ])
  })

  it('resolves each of several handles independently', () => {
    const segs = parseHandleLinks('[[work-loop]] and [[read-tree]] and [[nope]]', resolve)
    const handles = segs.filter((s) => s.type === 'handle') as any[]
    expect(handles.map((h) => [h.handle, h.actionHash])).toEqual([
      ['work-loop', WORKLOOP],
      ['read-tree', READTREE],
      ['nope', null],
    ])
  })
})

describe('remarkHandleLinks — mdast transform', () => {
  it('rewrites a [[handle]] text node into text + link nodes', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'see [[work-loop]] ok' }],
        },
      ],
    }
    remarkHandleLinks()(tree)
    expect(tree.children[0].children).toEqual([
      { type: 'text', value: 'see ' },
      {
        type: 'link',
        url: HANDLE_URI_PREFIX + 'work-loop',
        children: [{ type: 'text', value: 'work-loop' }],
      },
      { type: 'text', value: ' ok' },
    ])
  })

  it('leaves code spans and existing links untouched', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'inlineCode', value: '[[work-loop]]' },
        {
          type: 'link',
          url: 'https://x',
          children: [{ type: 'text', value: '[[read-tree]]' }],
        },
      ],
    }
    remarkHandleLinks()(tree)
    expect(tree.children[0]).toEqual({ type: 'inlineCode', value: '[[work-loop]]' })
    // the link's inner text is NOT linkified (no nested links)
    expect(tree.children[1].children).toEqual([
      { type: 'text', value: '[[read-tree]]' },
    ])
  })

  it('is a no-op for text without handles', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', value: 'plain' }] }],
    }
    remarkHandleLinks()(tree)
    expect(tree.children[0].children).toEqual([{ type: 'text', value: 'plain' }])
  })
})
