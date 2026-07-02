import { ChatMessage, PlanSnapshot, SessionRecord } from '../src/harness/chatHistory'
import {
  TRANSCRIPT_VERSION,
  Transcript,
  anchorSelection,
  buildTranscript,
  messageToTurn,
  parseTranscript,
  proposedEdits,
  serializeTranscript,
} from '../src/harness/transcript'

const msg = (over: Partial<ChatMessage> & { id: number }): ChatMessage => ({
  role: 'user',
  text: '',
  ...over,
})

const session = (
  messages: ChatMessage[],
  planSnapshots?: PlanSnapshot[]
): SessionRecord => ({
  id: 'ses-1',
  title: 'Flesh out branch-transcript',
  updatedAt: 1000,
  agentName: 'claude-agent-acp',
  messages,
  ...(planSnapshots ? { planSnapshots } : {}),
})

const sel = (actionHash: string, id: string, content?: string) => ({
  actionHash,
  id,
  ...(content !== undefined ? { content } : {}),
})

describe('transcript capture', () => {
  describe('buildTranscript', () => {
    it('captures session metadata and ordered turns {role, content, timestamp}', () => {
      const t = buildTranscript(
        session([
          msg({ id: 1, role: 'user', text: 'hello', at: 10 }),
          msg({ id: 2, role: 'agent', text: 'hi there', at: 20 }),
        ]),
        555
      )
      expect(t.version).toBe(TRANSCRIPT_VERSION)
      expect(t.sessionId).toBe('ses-1')
      expect(t.agentName).toBe('claude-agent-acp')
      expect(t.title).toBe('Flesh out branch-transcript')
      expect(t.capturedAt).toBe(555)
      expect(t.turns).toEqual([
        { role: 'user', content: 'hello', timestamp: 10 },
        { role: 'agent', content: 'hi there', timestamp: 20 },
      ])
    })

    it('preserves thinking and tool calls, and omits absent optionals', () => {
      const t = buildTranscript(
        session([
          msg({
            id: 1,
            role: 'agent',
            text: 'done',
            thinking: 'let me think',
            toolCalls: [
              { id: 'tc1', title: 'read_tree', status: 'completed' },
              { id: 'tc2', title: 'acorn propose_edits', status: 'completed', kind: 'edit' },
            ],
          }),
        ]),
        1
      )
      const [turn] = t.turns
      expect(turn.thinking).toBe('let me think')
      expect(turn.toolCalls).toEqual([
        { id: 'tc1', title: 'read_tree', status: 'completed' },
        { id: 'tc2', title: 'acorn propose_edits', status: 'completed', kind: 'edit' },
      ])
      // a bare user turn carries none of the optionals
      const bare = messageToTurn(msg({ id: 9, role: 'user', text: 'x' }))
      expect(bare).toEqual({ role: 'user', content: 'x' })
      expect('thinking' in bare).toBe(false)
      expect('toolCalls' in bare).toBe(false)
      expect('timestamp' in bare).toBe(false)
    })
  })

  describe('serialize / parse round-trip (executable completion criterion)', () => {
    it('round-trips, preserving turn order, roles and content', () => {
      const t = buildTranscript(
        session([
          msg({ id: 1, role: 'system', text: 'sys', at: 1 }),
          msg({ id: 2, role: 'user', text: 'first', at: 2 }),
          msg({ id: 3, role: 'agent', text: 'reply', at: 3, thinking: 'mm' }),
          msg({ id: 4, role: 'user', text: 'second', at: 4 }),
        ]),
        99
      )
      const back = parseTranscript(serializeTranscript(t))
      expect(back).toEqual(t)
      expect(back.turns.map((x) => x.role)).toEqual(['system', 'user', 'agent', 'user'])
      expect(back.turns.map((x) => x.content)).toEqual(['sys', 'first', 'reply', 'second'])
    })

    it('round-trips an empty session', () => {
      const t = buildTranscript(session([]), 7)
      expect(parseTranscript(serializeTranscript(t))).toEqual(t)
      expect(t.turns).toEqual([])
    })

    it('normalizes a drifted/legacy turn (unknown role, missing content)', () => {
      const raw = JSON.stringify({
        version: 1,
        sessionId: 's',
        title: '',
        capturedAt: 0,
        turns: [{ role: 'bogus' }, { role: 'agent', content: 'ok', status: 'weird' }],
      })
      const t = parseTranscript(raw)
      expect(t.turns[0]).toEqual({ role: 'system', content: '' })
      expect(t.turns[1]).toEqual({ role: 'agent', content: 'ok' })
    })

    it('rejects input that is not a transcript', () => {
      expect(() => parseTranscript('{"nope":true}')).toThrow(/transcript/i)
      expect(() => parseTranscript('null')).toThrow(/transcript/i)
    })
  })

  describe('proposedEdits (proposed-edit references)', () => {
    it('extracts propose_edits tool calls with their turn index', () => {
      const t = buildTranscript(
        session([
          msg({ id: 1, role: 'user', text: 'edit it', at: 1 }),
          msg({
            id: 2,
            role: 'agent',
            text: 'proposing',
            at: 2,
            toolCalls: [
              { id: 'r', title: 'read_tree', status: 'completed' },
              { id: 'p', title: 'mcp__acorn__propose_edits', status: 'completed' },
            ],
          }),
        ]),
        1
      )
      expect(proposedEdits(t)).toEqual([
        { turnIndex: 1, id: 'p', title: 'mcp__acorn__propose_edits', status: 'completed' },
      ])
    })

    it('is empty when the conversation never proposed edits', () => {
      const t = buildTranscript(
        session([msg({ id: 1, role: 'user', text: 'just chatting' })]),
        1
      )
      expect(proposedEdits(t)).toEqual([])
    })
  })

  describe('plan snapshots (capturing the plan stream)', () => {
    it('captures session-level plan snapshots and round-trips them', () => {
      const plans: PlanSnapshot[] = [
        { at: 1, entries: [{ content: 'step A', priority: 'high', status: 'pending' }] },
        {
          at: 2,
          entries: [{ content: 'step A', priority: 'high', status: 'completed' }],
        },
      ]
      const t = buildTranscript(session([msg({ id: 1, role: 'user', text: 'go' })], plans), 5)
      expect(t.planSnapshots).toEqual(plans)
      expect(parseTranscript(serializeTranscript(t)).planSnapshots).toEqual(plans)
    })

    it('omits planSnapshots when the session emitted none', () => {
      const t = buildTranscript(session([msg({ id: 1, role: 'user', text: 'x' })]), 1)
      expect('planSnapshots' in t).toBe(false)
      expect(parseTranscript(serializeTranscript(t)).planSnapshots).toBeUndefined()
    })
  })

  describe('ask-time selection (the conversation anchor)', () => {
    it('captures per-user-turn selection and round-trips it', () => {
      const t = buildTranscript(
        session([
          msg({ id: 1, role: 'user', text: 'edit this', at: 1, selection: [sel('uhAAA', '#111', 'Node A')] }),
          msg({ id: 2, role: 'agent', text: 'ok', at: 2 }),
        ]),
        9
      )
      expect(t.turns[0].selection).toEqual([sel('uhAAA', '#111', 'Node A')])
      expect(parseTranscript(serializeTranscript(t))).toEqual(t)
    })

    it('anchorSelection returns the FIRST user turn selection, not the latest', () => {
      const t = buildTranscript(
        session([
          msg({ id: 1, role: 'user', text: 'first', at: 1, selection: [sel('uhFIRST', '#1')] }),
          msg({ id: 2, role: 'agent', text: 'reply', at: 2 }),
          msg({ id: 3, role: 'user', text: 'later', at: 3, selection: [sel('uhLATER', '#2')] }),
        ]),
        1
      )
      expect(anchorSelection(t)).toEqual([sel('uhFIRST', '#1')])
    })

    it('anchorSelection is empty when no user turn carried a selection', () => {
      const t = buildTranscript(
        session([msg({ id: 1, role: 'user', text: 'no selection' })]),
        1
      )
      expect(anchorSelection(t)).toEqual([])
    })

    it('drops a malformed selection entry (missing actionHash)', () => {
      const turn = messageToTurn(
        msg({ id: 1, role: 'user', text: 'x', selection: [{ id: '#9' } as any] })
      )
      expect('selection' in turn).toBe(false)
    })

    it('survives the serialize/parse round-trip', () => {
      const t = buildTranscript(
        session([
          msg({
            id: 1,
            role: 'agent',
            text: 'x',
            toolCalls: [{ id: 'p', title: 'propose_edits', status: 'pending' }],
          }),
        ]),
        1
      )
      expect(proposedEdits(parseTranscript(serializeTranscript(t)))).toEqual([
        { turnIndex: 0, id: 'p', title: 'propose_edits', status: 'pending' },
      ])
    })
  })
})
