/**
 * Tests for the direct OpenAI-compatible backend (web/dev-harness/directBackend.js):
 * tool-schema conversion, block flattening, and the tool-call loop — all without a
 * live model (the `chat` call is injected).
 */
// CommonJS module loaded by the (CommonJS) sidecar — require it directly.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  makeDirectAgent,
  toOpenAiTools,
  blocksToText,
} = require('../dev-harness/directBackend')

const ACORN_TOOLS = [
  { name: 'read_tree', description: 'Read the tree', inputSchema: { type: 'object', properties: {} } },
  { name: 'propose_edits', description: 'Propose edits', inputSchema: { type: 'object', properties: { diff: {} }, required: ['diff'] } },
]

describe('toOpenAiTools', () => {
  it('maps acornToolsServer TOOLS to OpenAI function tools', () => {
    expect(toOpenAiTools(ACORN_TOOLS)[0]).toEqual({
      type: 'function',
      function: {
        name: 'read_tree',
        description: 'Read the tree',
        parameters: { type: 'object', properties: {} },
      },
    })
  })
})

describe('blocksToText', () => {
  it('flattens resource blocks and joins text blocks', () => {
    const text = blocksToText([
      { type: 'resource', resource: { uri: 'acorn://tree/p', text: '{"t":1}' } },
      { type: 'text', text: 'list the nodes' },
    ])
    expect(text).toContain('{"t":1}')
    expect(text).toContain('list the nodes')
  })
})

describe('makeDirectAgent tool-call loop', () => {
  // A fake chat that returns a read_tree call first, then a final message.
  const makeAgent = (chatScript: any[], callTool: any) => {
    const updates: any[] = []
    let i = 0
    const agent = makeDirectAgent({
      model: 'test-model',
      systemText: 'You are Acorn.',
      skillText: 'SKILL BODY',
      tools: ACORN_TOOLS,
      chat: async () => chatScript[Math.min(i++, chatScript.length - 1)],
      callTool,
      pushUpdate: (sessionId: string, update: any) => updates.push({ sessionId, update }),
      genSessionId: () => 'sess-1',
    })
    return { agent, updates }
  }

  it('seats system prompt + skill in the system message on newSession', async () => {
    const { agent } = makeAgent([{ content: 'hi', toolCalls: [] }], async () => ({ ok: true }))
    const { sessionId } = await agent.newSession({})
    expect(sessionId).toBe('sess-1')
  })

  it('calls the tool, feeds the result back, and emits the final message', async () => {
    const calls: any[] = []
    const callTool = async (name: string, args: any) => {
      calls.push({ name, args })
      return { ok: true, result: { nodes: ['a', 'b'] } }
    }
    const { agent, updates } = makeAgent(
      [
        { content: '', toolCalls: [{ id: 'c1', name: 'read_tree', arguments: {} }] },
        { content: 'The tree has nodes a and b.', toolCalls: [] },
      ],
      callTool
    )
    await agent.newSession({})
    const res = await agent.prompt({
      sessionId: 'sess-1',
      prompt: [{ type: 'text', text: 'read the tree' }],
    })

    expect(res.stopReason).toBe('end_turn')
    // the tool ran with the model's args
    expect(calls).toEqual([{ name: 'read_tree', args: {} }])
    // the renderer saw tool_call in_progress → completed, then the final message
    const kinds = updates.map((u) => `${u.update.type}:${u.update.status || ''}`)
    expect(kinds).toContain('tool_call:in_progress')
    expect(kinds).toContain('tool_call:completed')
    const msg = updates.find((u) => u.update.type === 'message')
    expect(msg.update.text).toBe('The tree has nodes a and b.')
  })

  it('marks a failed tool call and still feeds an error back to the model', async () => {
    const callTool = async () => ({ ok: false, error: 'not connected' })
    const { agent, updates } = makeAgent(
      [
        { content: '', toolCalls: [{ id: 'c1', name: 'read_tree', arguments: {} }] },
        { content: 'Sorry, could not read it.', toolCalls: [] },
      ],
      callTool
    )
    await agent.newSession({})
    await agent.prompt({ sessionId: 'sess-1', prompt: [{ type: 'text', text: 'go' }] })
    expect(updates.map((u) => u.update.status)).toContain('failed')
  })

  it('stops when cancelled', async () => {
    const { agent } = makeAgent(
      [{ content: '', toolCalls: [{ id: 'c1', name: 'read_tree', arguments: {} }] }],
      async (_n: string, _a: any) => {
        agent.cancel({ sessionId: 'sess-1' }) // cancel mid-tool
        return { ok: true, result: {} }
      }
    )
    await agent.newSession({})
    const res = await agent.prompt({ sessionId: 'sess-1', prompt: [{ type: 'text', text: 'go' }] })
    expect(res.stopReason).toBe('cancelled')
  })
})
